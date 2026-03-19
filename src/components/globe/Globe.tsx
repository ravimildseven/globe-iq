"use client";

import { useRef, useState, useMemo, useCallback, useEffect, Suspense } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, Sphere, Html } from "@react-three/drei";
import * as THREE from "three";
import { countryCentroids, latLngToVector3, findNearestCountry, CountryCentroid } from "@/lib/countries-geo";
import {
  loadCountryShapes, findCountryAtPoint, spherePointToLatLng,
  type CountryShape,
} from "@/lib/world-geo";

interface GlobeProps {
  selectedCountry: CountryCentroid | null;
  onCountrySelect: (country: CountryCentroid) => void;
  zoomDelta: number;
  onZoomHandled: () => void;
}

// ─── Real-time subsolar point ─────────────────────────────────────────────────
function getSunPosition(): THREE.Vector3 {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const declination = -23.44 * Math.cos((2 * Math.PI * (dayOfYear + 10)) / 365);
  const hours = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
  const sunLng = (12 - hours) * 15;
  const phi    = (90 - declination) * (Math.PI / 180);
  const theta  = (sunLng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(Math.sin(phi) * Math.cos(theta)),
    Math.cos(phi),
    Math.sin(phi) * Math.sin(theta),
  ).normalize();
}

// ─── Scene lights ─────────────────────────────────────────────────────────────
function SunLight({ sunDir }: { sunDir: THREE.Vector3 }) {
  const dirRef   = useRef<THREE.DirectionalLight>(null);
  const earthRef = useRef<THREE.DirectionalLight>(null);

  useFrame(() => {
    dirRef.current?.position.set(sunDir.x * 10, sunDir.y * 10, sunDir.z * 10);
    earthRef.current?.position.set(-sunDir.x * 4, -sunDir.y * 3, -sunDir.z * 4);
  });

  return (
    <>
      <directionalLight ref={dirRef} position={[sunDir.x * 10, sunDir.y * 10, sunDir.z * 10]}
        intensity={2.2} color="#FFF5E0" />
      <ambientLight intensity={0.15} color="#8AA8D0" />
      <directionalLight ref={earthRef}
        position={[-sunDir.x * 4, -sunDir.y * 3, -sunDir.z * 4]}
        intensity={0.22} color="#3A5A8A" />
    </>
  );
}

// ─── Day / Night GLSL shader ──────────────────────────────────────────────────
const DAY_NIGHT_VERT = /* glsl */ `
  varying vec2  vUv;
  varying vec3  vWorldNormal;
  void main() {
    vUv          = uv;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position  = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const DAY_NIGHT_FRAG = /* glsl */ `
  uniform sampler2D dayTexture;
  uniform sampler2D nightTexture;
  uniform vec3      sunDirection;
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  void main() {
    vec4 dayColor   = texture2D(dayTexture,   vUv);
    vec4 nightColor = texture2D(nightTexture, vUv);
    float cosAngle  = dot(normalize(vWorldNormal), normalize(sunDirection));
    float dayMix    = smoothstep(-0.12, 0.12, cosAngle);
    float diffuse   = max(cosAngle, 0.0);
    vec4  litDay    = dayColor * (0.07 + diffuse * 0.94);
    vec4  earthshine = dayColor * 0.09 * vec4(0.45, 0.55, 0.80, 1.0);
    vec4  litNight   = nightColor * 1.65 + earthshine;
    float twilight   = (1.0 - smoothstep(0.0, 0.12, abs(cosAngle))) * 0.12;
    gl_FragColor = mix(litNight, litDay, dayMix) + vec4(1.0, 0.75, 0.3, 0.0) * twilight;
    gl_FragColor.a = 1.0;
  }
`;

// ─── Atmosphere ───────────────────────────────────────────────────────────────
function Atmosphere() {
  return (
    <>
      <Sphere args={[1.012, 64, 64]}>
        <meshStandardMaterial color="#5BB8FF" transparent opacity={0.06}
          side={THREE.FrontSide} depthWrite={false} />
      </Sphere>
      <Sphere args={[1.07, 64, 64]}>
        <meshBasicMaterial color="#6EC6FF" transparent opacity={0.025}
          side={THREE.BackSide} depthWrite={false} />
      </Sphere>
    </>
  );
}

// ─── All country border lines in a single draw call ───────────────────────────
function CountryBordersLayer({ shapes }: { shapes: CountryShape[] }) {
  const geometry = useMemo(() => {
    if (!shapes.length) return null;
    const positions: number[] = [];

    for (const shape of shapes) {
      for (const polygon of shape.polygons) {
        for (const ring of polygon) {
          for (let i = 0; i < ring.length - 1; i++) {
            const [lng1, lat1] = ring[i];
            const [lng2, lat2] = ring[i + 1];
            const [x1, y1, z1] = latLngToVector3(lat1, lng1, 1.002);
            const [x2, y2, z2] = latLngToVector3(lat2, lng2, 1.002);
            positions.push(x1, y1, z1, x2, y2, z2);
          }
        }
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, [shapes]);

  if (!geometry) return null;

  return (
    <lineSegments geometry={geometry}>
      {/* White 18% — cartographic, not UI. Disappears on bright terrain,
          shows over dark ocean. Screen-blend feel without actual blend mode. */}
      <lineBasicMaterial color="#FFFFFF" transparent opacity={0.18} />
    </lineSegments>
  );
}

// ─── Active country border outline (hover / selected) ────────────────────────
function CountryOutline({ shape, color, opacity }: {
  shape: CountryShape;
  color: string;
  opacity: number;
}) {
  const geometry = useMemo(() => {
    const positions: number[] = [];
    for (const polygon of shape.polygons) {
      const ring = polygon[0]; // outer ring only
      for (let i = 0; i < ring.length - 1; i++) {
        const [lng1, lat1] = ring[i];
        const [lng2, lat2] = ring[i + 1];
        const [x1, y1, z1] = latLngToVector3(lat1, lng1, 1.004);
        const [x2, y2, z2] = latLngToVector3(lat2, lng2, 1.004);
        positions.push(x1, y1, z1, x2, y2, z2);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, [shape]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={opacity} />
    </lineSegments>
  );
}

// ─── Hover / selected country fill (fan-triangulated) ────────────────────────
function CountryFill({ shape, color, opacity }: {
  shape: CountryShape;
  color: string;
  opacity: number;
}) {
  const geometry = useMemo(() => {
    const positions: number[] = [];

    for (const polygon of shape.polygons) {
      const outer = polygon[0];  // use outer ring only for fill
      if (outer.length < 3) continue;

      // Centroid of this ring for fan triangulation
      let cx = 0, cy = 0;
      for (const [lng, lat] of outer) { cx += lng; cy += lat; }
      cx /= outer.length; cy /= outer.length;

      const [ocx, ocy, ocz] = latLngToVector3(cy, cx, 1.003);

      for (let i = 0; i < outer.length - 1; i++) {
        const [lng1, lat1] = outer[i];
        const [lng2, lat2] = outer[i + 1];
        const [x1, y1, z1] = latLngToVector3(lat1, lng1, 1.003);
        const [x2, y2, z2] = latLngToVector3(lat2, lng2, 1.003);
        positions.push(ocx, ocy, ocz, x1, y1, z1, x2, y2, z2);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, [shape]);

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── Expanding selection ring ─────────────────────────────────────────────────
function ExpandingRing({ position }: { position: [number, number, number] }) {
  const ref       = useRef<THREE.Mesh>(null);
  const scaleRef  = useRef(1);
  const opacRef   = useRef(0.6);
  const normal    = new THREE.Vector3(...position).normalize();
  const quat      = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);

  useFrame((_, d) => {
    if (!ref.current) return;
    scaleRef.current += d * 0.8;
    opacRef.current  -= d * 0.4;
    if (scaleRef.current > 2.5) { scaleRef.current = 1; opacRef.current = 0.6; }
    ref.current.scale.setScalar(scaleRef.current);
    (ref.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, opacRef.current);
  });

  return (
    <mesh position={position} quaternion={quat} ref={ref}>
      <ringGeometry args={[0.028, 0.036, 32]} />
      <meshBasicMaterial color="#F59E0B" transparent opacity={0.6} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ─── ISO alpha-2 → flag emoji ─────────────────────────────────────────────────
function flagEmoji(code: string) {
  return [...code.toUpperCase()].map(
    c => String.fromCodePoint(c.charCodeAt(0) + 0x1F1E6 - 65)
  ).join("");
}

// ─── Selected-country centroid label (amber pill, 3-D anchored) ───────────────
function SelectedLabel({ country }: { country: CountryCentroid }) {
  const labelPos = latLngToVector3(country.lat, country.lng, 1.06);
  const { camera } = useThree();
  const [visible, setVisible] = useState(true);

  useFrame(() => {
    const d = new THREE.Vector3(...labelPos).normalize().dot(camera.position.clone().normalize());
    setVisible(d > 0.15);
  });

  if (!visible) return null;

  return (
    <Html position={labelPos} center style={{ pointerEvents: "none", userSelect: "none" }}
      zIndexRange={[10, 0]} occlude={false}>
      <div style={{
        fontFamily: "var(--font-heading)",
        whiteSpace: "nowrap",
        display: "flex",
        alignItems: "center",
        gap: 5,
        background: "rgba(245,158,11,0.92)",
        color: "#020617",
        padding: "3px 9px",
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 700,
        boxShadow: "0 0 14px rgba(245,158,11,0.5)",
      }}>
        <span style={{ fontSize: 13 }}>{flagEmoji(country.code)}</span>
        {country.name}
      </div>
    </Html>
  );
}

// ─── Main globe with textures + country layers ────────────────────────────────
function EarthGlobe({
  selectedCountry, onCountrySelect, onInteractionStart, onHoverCountry, sunDir,
}: {
  selectedCountry: CountryCentroid | null;
  onCountrySelect: (country: CountryCentroid) => void;
  onInteractionStart: () => void;
  onHoverCountry: (c: CountryCentroid | null) => void;
  sunDir: THREE.Vector3;
}) {
  const [shapes, setShapes]           = useState<CountryShape[]>([]);
  const [hoveredShape, setHoveredShape] = useState<CountryShape | null>(null);
  const [hoveredCentroid, setHoveredCentroid] = useState<CountryCentroid | null>(null);
  const shaderRef = useRef<THREE.ShaderMaterial>(null);

  // Load world GeoJSON once
  useEffect(() => {
    loadCountryShapes(countryCentroids).then(setShapes).catch(console.error);
  }, []);

  // Textures
  const earthTexture = useLoader(THREE.TextureLoader,
    "https://unpkg.com/three-globe@2.34.1/example/img/earth-blue-marble.jpg");
  const nightTexture = useLoader(THREE.TextureLoader,
    "https://unpkg.com/three-globe@2.34.1/example/img/earth-night.jpg");

  useMemo(() => {
    earthTexture.colorSpace = THREE.SRGBColorSpace;
    earthTexture.anisotropy = 16;
    nightTexture.colorSpace = THREE.SRGBColorSpace;
    nightTexture.anisotropy = 16;
  }, [earthTexture, nightTexture]);

  const uniforms = useMemo(() => ({
    dayTexture:   { value: earthTexture },
    nightTexture: { value: nightTexture },
    sunDirection: { value: sunDir.clone() },
  }), [earthTexture, nightTexture]); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame(() => {
    shaderRef.current?.uniforms.sunDirection.value.copy(sunDir);
  });

  // ── Pointer move → find country by polygon ──────────────────────────────────
  const handlePointerMove = useCallback((e: any) => {
    if (!e.point) return;
    const { lat, lng } = spherePointToLatLng(e.point);

    const shape = shapes.length
      ? findCountryAtPoint(lat, lng, shapes)
      : null;

    setHoveredShape(shape);

    if (shape) {
      const c = countryCentroids.find(x => x.code === shape.code) ?? null;
      setHoveredCentroid(c);
      onHoverCountry(c);
      document.body.style.cursor = "pointer";
    } else {
      setHoveredCentroid(null);
      onHoverCountry(null);
      document.body.style.cursor = "";
    }
  }, [shapes, onHoverCountry]);

  // ── Click → select country ──────────────────────────────────────────────────
  const handleClick = useCallback((e: any) => {
    if (!e.point) return;
    onInteractionStart();
    const { lat, lng } = spherePointToLatLng(e.point);

    const shape = shapes.length ? findCountryAtPoint(lat, lng, shapes) : null;
    if (shape) {
      const c = countryCentroids.find(x => x.code === shape.code);
      if (c) { onCountrySelect(c); return; }
    }
    // Fallback: nearest centroid
    const nearest = findNearestCountry(e.point);
    if (nearest) onCountrySelect(nearest);
  }, [shapes, onCountrySelect, onInteractionStart]);

  const selectedShape = selectedCountry
    ? shapes.find(s => s.code === selectedCountry.code) ?? null
    : null;

  return (
    <group>
      {/* Earth sphere — day/night shader */}
      <Sphere
        args={[1, 128, 128]}
        onClick={handleClick}
        onPointerMove={handlePointerMove}
        onPointerOut={() => {
          setHoveredShape(null);
          setHoveredCentroid(null);
          onHoverCountry(null);
          document.body.style.cursor = "";
        }}
      >
        <shaderMaterial
          ref={shaderRef}
          vertexShader={DAY_NIGHT_VERT}
          fragmentShader={DAY_NIGHT_FRAG}
          uniforms={uniforms}
        />
      </Sphere>

      {/* Country border lines */}
      <CountryBordersLayer shapes={shapes} />

      {/* ── Hover state: amber fill 10% + amber outline 55% ── */}
      {hoveredShape && !selectedShape && (
        <>
          <CountryFill    shape={hoveredShape} color="#F59E0B" opacity={0.10} />
          <CountryOutline shape={hoveredShape} color="#F59E0B" opacity={0.55} />
        </>
      )}

      {/* ── Selected state: amber fill 20% + soft glow layer + full amber outline ── */}
      {selectedShape && (
        <>
          {/* Glow halo — wider, very faint */}
          <CountryFill    shape={selectedShape} color="#F59E0B" opacity={0.08} />
          {/* Main fill */}
          <CountryFill    shape={selectedShape} color="#F59E0B" opacity={0.20} />
          {/* Full amber border */}
          <CountryOutline shape={selectedShape} color="#F59E0B" opacity={1.0}  />
        </>
      )}

      {/* Expanding ring at selected centroid */}
      {selectedCountry && (() => {
        const pos = latLngToVector3(selectedCountry.lat, selectedCountry.lng, 1.004);
        return <ExpandingRing position={pos} />;
      })()}

      {/* Selected-country label pinned at centroid (amber pill) */}
      {selectedCountry && (
        <SelectedLabel country={selectedCountry} />
      )}

      <Atmosphere />
    </group>
  );
}

// ─── Camera zoom controller ───────────────────────────────────────────────────
function CameraController({ zoomDelta, onZoomHandled }: {
  zoomDelta: number; onZoomHandled: () => void;
}) {
  const { camera } = useThree();
  useEffect(() => {
    if (zoomDelta === 0) return;
    const dir  = camera.position.clone().normalize();
    const dist = THREE.MathUtils.clamp(camera.position.length() - 0.35 * zoomDelta, 1.5, 4.5);
    camera.position.copy(dir.multiplyScalar(dist));
    onZoomHandled();
  }, [zoomDelta, camera, onZoomHandled]);
  return null;
}

// ─── Auto-rotate ──────────────────────────────────────────────────────────────
function AutoRotate({ enabled }: { enabled: boolean }) {
  const ctrlRef = useRef<any>(null);
  useFrame(() => {
    if (ctrlRef.current) {
      ctrlRef.current.autoRotate      = enabled;
      ctrlRef.current.autoRotateSpeed = 0.35;
    }
  });
  return (
    <OrbitControls ref={ctrlRef} enablePan={false} enableZoom
      minDistance={1.5} maxDistance={4.5} dampingFactor={0.06} enableDamping />
  );
}

// ─── Scene root — owns shared sun direction ───────────────────────────────────
function SceneRoot({
  selectedCountry, onCountrySelect, onInteractionStart, onHoverCountry,
  zoomDelta, onZoomHandled, isInteracting,
}: {
  selectedCountry: CountryCentroid | null;
  onCountrySelect: (c: CountryCentroid) => void;
  onInteractionStart: () => void;
  onHoverCountry: (c: CountryCentroid | null) => void;
  zoomDelta: number;
  onZoomHandled: () => void;
  isInteracting: boolean;
}) {
  const sunDir = useRef<THREE.Vector3>(getSunPosition());

  useFrame(() => {
    if (Math.random() < 0.0003) sunDir.current.copy(getSunPosition());
  });

  return (
    <>
      <SunLight sunDir={sunDir.current} />
      <EarthGlobe
        selectedCountry={selectedCountry}
        onCountrySelect={onCountrySelect}
        onInteractionStart={onInteractionStart}
        onHoverCountry={onHoverCountry}
        sunDir={sunDir.current}
      />
      <CameraController zoomDelta={zoomDelta} onZoomHandled={onZoomHandled} />
      <AutoRotate enabled={!isInteracting && !selectedCountry} />
    </>
  );
}

// ─── Loading fallback ─────────────────────────────────────────────────────────
function LoadingFallback() {
  return (
    <Sphere args={[1, 32, 32]}>
      <meshStandardMaterial color="#0B1A2E" roughness={0.9} />
    </Sphere>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────
export default function Globe({ selectedCountry, onCountrySelect, zoomDelta, onZoomHandled }: GlobeProps) {
  const [isInteracting, setIsInteracting]   = useState(false);
  const [hoveredCountry, setHoveredCountry] = useState<CountryCentroid | null>(null);
  const [mousePos, setMousePos]             = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopRotation = useCallback(() => {
    setIsInteracting(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsInteracting(false), 6000);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  // Hide tooltip for the already-selected country (amber label handles that)
  const showTooltip = hoveredCountry && hoveredCountry.code !== selectedCountry?.code;

  return (
    <div className="w-full h-full" onPointerDown={stopRotation} onMouseMove={handleMouseMove}>
      <Canvas
        camera={{ position: [0, 0.25, 2.7], fov: 43 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <SceneRoot
            selectedCountry={selectedCountry}
            onCountrySelect={onCountrySelect}
            onInteractionStart={stopRotation}
            onHoverCountry={setHoveredCountry}
            zoomDelta={zoomDelta}
            onZoomHandled={onZoomHandled}
            isInteracting={isInteracting}
          />
        </Suspense>
      </Canvas>

      {/* ── Cursor-following country tooltip ── */}
      {showTooltip && (
        <div
          style={{
            position: "fixed",
            left: mousePos.x + 18,
            top:  mousePos.y - 38,
            pointerEvents: "none",
            zIndex: 60,
            transition: "opacity 120ms ease",
          }}
        >
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            background: "rgba(8,14,28,0.88)",
            border: "1px solid rgba(255,255,255,0.13)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            padding: "5px 11px 5px 9px",
            borderRadius: 20,
            boxShadow: "0 4px 20px rgba(0,0,0,0.45), 0 0 0 0.5px rgba(255,255,255,0.05)",
            whiteSpace: "nowrap",
          }}>
            <span style={{ fontSize: 15, lineHeight: 1 }}>
              {flagEmoji(hoveredCountry.code)}
            </span>
            <span style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#E8F0FF",
              letterSpacing: "0.01em",
              fontFamily: "var(--font-heading)",
            }}>
              {hoveredCountry.name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
