"use client";

import { useRef, useState, useMemo, useCallback, useEffect, Suspense } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, Sphere, Html } from "@react-three/drei";
import * as THREE from "three";
import { countryCentroids, latLngToVector3, findNearestCountry, CountryCentroid } from "@/lib/countries-geo";

/* ── Major countries always show labels ── */
const MAJOR_COUNTRIES = new Set([
  "US","CN","RU","IN","BR","AU","CA","FR","DE","GB",
  "JP","KR","SA","EG","NG","ZA","MX","AR","ID","TR",
  "IT","ES","PK","UA","IR","TH","VN","PH","BD","ET",
]);

interface GlobeProps {
  selectedCountry: CountryCentroid | null;
  onCountrySelect: (country: CountryCentroid) => void;
  zoomDelta: number;
  onZoomHandled: () => void;
}

/* ── Real-time subsolar point for sun lighting ── */
function getSunPosition(): THREE.Vector3 {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const declination = -23.44 * Math.cos((2 * Math.PI * (dayOfYear + 10)) / 365);
  const hours = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
  const sunLng = (12 - hours) * 15;
  const phi   = (90 - declination) * (Math.PI / 180);
  const theta = (sunLng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(Math.sin(phi) * Math.cos(theta)),
    Math.cos(phi),
    Math.sin(phi) * Math.sin(theta),
  ).normalize();
}

/* ── Scene lights (affect atmosphere & markers) ── */
function SunLight({ sunDir }: { sunDir: THREE.Vector3 }) {
  const dirRef      = useRef<THREE.DirectionalLight>(null);
  const earthRef    = useRef<THREE.DirectionalLight>(null);

  useFrame(() => {
    if (dirRef.current) {
      dirRef.current.position.set(sunDir.x * 10, sunDir.y * 10, sunDir.z * 10);
    }
    if (earthRef.current) {
      earthRef.current.position.set(-sunDir.x * 4, -sunDir.y * 3, -sunDir.z * 4);
    }
  });

  return (
    <>
      {/* Primary warm sunlight */}
      <directionalLight
        ref={dirRef}
        position={[sunDir.x * 10, sunDir.y * 10, sunDir.z * 10]}
        intensity={2.2}
        color="#FFF5E0"
      />
      {/* Dim ambient — deep space starlight */}
      <ambientLight intensity={0.15} color="#8AA8D0" />
      {/* Earthshine fill from opposite side */}
      <directionalLight
        ref={earthRef}
        position={[-sunDir.x * 4, -sunDir.y * 3, -sunDir.z * 4]}
        intensity={0.22}
        color="#3A5A8A"
      />
    </>
  );
}

/* ── Day/Night custom shader ── */
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
  uniform vec3      sunDirection;   // world-space unit vector toward sun

  varying vec2 vUv;
  varying vec3 vWorldNormal;

  void main() {
    vec4 dayColor   = texture2D(dayTexture,   vUv);
    vec4 nightColor = texture2D(nightTexture, vUv);

    float cosAngle = dot(normalize(vWorldNormal), normalize(sunDirection));

    // ── Smooth terminator blend (±12° twilight zone) ──────────────────────
    float dayMix = smoothstep(-0.12, 0.12, cosAngle);

    // ── Day side: Lambertian diffuse + minimal deep-space ambient ──────────
    float diffuse = max(cosAngle, 0.0);
    vec4  litDay  = dayColor * (0.07 + diffuse * 0.94);

    // ── Night side: city lights (boosted) + faint earthshine ──────────────
    // Earthshine: reflected sunlight from Earth's oceans onto night side —
    // makes continents subtly visible in cool blue-grey.
    vec4 earthshine = dayColor * 0.09 * vec4(0.45, 0.55, 0.80, 1.0);
    vec4 litNight   = nightColor * 1.65 + earthshine;

    // ── Twilight: warm golden glow at horizon ──────────────────────────────
    float twilight     = 1.0 - abs(cosAngle / 0.12) * step(-0.12, cosAngle) * step(cosAngle, 0.12);
    vec4  twilightGlow = vec4(1.0, 0.75, 0.3, 0.0) * twilight * 0.12;

    gl_FragColor = mix(litNight, litDay, dayMix) + twilightGlow;
    gl_FragColor.a = 1.0;
  }
`;

/* ── Atmospheric halo rings ── */
function Atmosphere() {
  return (
    <>
      {/* Inner thin blue haze */}
      <Sphere args={[1.012, 64, 64]}>
        <meshStandardMaterial color="#5BB8FF" transparent opacity={0.06} side={THREE.FrontSide} depthWrite={false} />
      </Sphere>
      {/* Outer soft glow */}
      <Sphere args={[1.07, 64, 64]}>
        <meshBasicMaterial color="#6EC6FF" transparent opacity={0.025} side={THREE.BackSide} depthWrite={false} />
      </Sphere>
    </>
  );
}

/* ── Idle beacon — slow radar ping on major unselected countries ── */
function IdleBeacon({ position, phaseOffset }: {
  position: [number, number, number];
  phaseOffset: number;
}) {
  const ref    = useRef<THREE.Mesh>(null);
  const tRef   = useRef(phaseOffset);
  const CYCLE  = 3.8; // seconds per pulse
  const normal = new THREE.Vector3(...position).normalize();
  const quat   = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);

  useFrame((_, delta) => {
    if (!ref.current) return;
    tRef.current = (tRef.current + delta) % CYCLE;
    const t = tRef.current / CYCLE;              // 0 → 1
    ref.current.scale.setScalar(1 + t * 2.8);   // 1× → 3.8×
    (ref.current.material as THREE.MeshBasicMaterial).opacity =
      Math.max(0, 0.38 * (1 - t * t));           // fast-in, slow fade
  });

  return (
    <mesh position={position} quaternion={quat} ref={ref}>
      <ringGeometry args={[0.020, 0.028, 24]} />
      <meshBasicMaterial color="#F59E0B" transparent opacity={0.38} side={THREE.DoubleSide} />
    </mesh>
  );
}

/* ── Animated pulse ring for selected country ── */
function SelectedPulse({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  const normal = new THREE.Vector3(...position).normalize();
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * 0.6;
  });

  return (
    <mesh position={position} quaternion={quat} ref={ref}>
      <ringGeometry args={[0.032, 0.046, 32]} />
      <meshBasicMaterial color="#F59E0B" transparent opacity={0.75} side={THREE.DoubleSide} />
    </mesh>
  );
}

/* ── Outer expanding ring (animated outward) ── */
function ExpandingRing({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  const scaleRef = useRef(1);
  const opacityRef = useRef(0.6);
  const normal = new THREE.Vector3(...position).normalize();
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);

  useFrame((_, delta) => {
    if (!ref.current) return;
    scaleRef.current += delta * 0.8;
    opacityRef.current -= delta * 0.4;
    if (scaleRef.current > 2.5) { scaleRef.current = 1; opacityRef.current = 0.6; }
    ref.current.scale.setScalar(scaleRef.current);
    (ref.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, opacityRef.current);
  });

  return (
    <mesh position={position} quaternion={quat} ref={ref}>
      <ringGeometry args={[0.028, 0.034, 32]} />
      <meshBasicMaterial color="#F59E0B" transparent opacity={0.6} side={THREE.DoubleSide} />
    </mesh>
  );
}

/* ── Per-country dot + label ── */
function CountryMarker({
  country, isSelected, isHovered, isMajor, phaseOffset, onClick, onHover, onUnhover,
}: {
  country: CountryCentroid;
  isSelected: boolean;
  isHovered: boolean;
  isMajor: boolean;
  phaseOffset: number;
  onClick: () => void;
  onHover: () => void;
  onUnhover: () => void;
}) {
  const dotRef   = useRef<THREE.Mesh>(null);
  const [isFront, setIsFront] = useState(true);
  const { camera } = useThree();

  const pos      = latLngToVector3(country.lat, country.lng, 1.006);
  const labelPos = latLngToVector3(country.lat, country.lng, 1.045);

  useFrame(() => {
    if (!dotRef.current) return;
    const target = isSelected ? 0.024 : isHovered ? 0.020 : isMajor ? 0.013 : 0.008;
    const s = dotRef.current.scale.x;
    dotRef.current.scale.setScalar(s + (target - s) * 0.18);

    const d = new THREE.Vector3(...pos).normalize().dot(camera.position.clone().normalize());
    setIsFront(d > 0.08);
  });

  // Warm amber for major countries — signals "tappable hotspot"
  const dotColor = isSelected ? "#F59E0B" : isHovered ? "#FDE68A" : isMajor ? "#FBBF24" : "#7DD3FC";
  const dotOpacity = isFront
    ? (isSelected ? 1 : isHovered ? 1 : isMajor ? 0.75 : 0.40)
    : 0;

  const showLabel  = isFront && (isSelected || isHovered || isMajor);
  const showBeacon = isFront && isMajor && !isSelected && !isHovered;

  return (
    <group>
      {/* Large invisible hit area */}
      <mesh
        position={pos}
        onClick={e => { e.stopPropagation(); onClick(); }}
        onPointerOver={e => {
          e.stopPropagation();
          onHover();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          onUnhover();
          document.body.style.cursor = "";
        }}
        visible={false}
      >
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Visible dot */}
      <mesh ref={dotRef} position={pos}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color={dotColor} transparent opacity={dotOpacity} />
      </mesh>

      {/* Idle beacon — invites interaction before any click */}
      {showBeacon && <IdleBeacon position={pos} phaseOffset={phaseOffset} />}

      {/* Selected rings */}
      {isSelected && isFront && <SelectedPulse position={pos} />}
      {isSelected && isFront && <ExpandingRing position={pos} />}

      {/* Country label */}
      {showLabel && (
        <Html
          position={labelPos}
          center
          style={{ pointerEvents: "none", userSelect: "none" }}
          zIndexRange={[10, 0]}
          occlude={false}
        >
          <div
            style={{
              fontFamily: "var(--font-heading)",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease",
              ...(isSelected ? {
                background: "rgba(245, 158, 11, 0.9)",
                color: "#020617",
                padding: "3px 8px",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 700,
                boxShadow: "0 0 12px rgba(245,158,11,0.4)",
              } : isHovered ? {
                background: "rgba(11, 17, 32, 0.85)",
                color: "#F0F4FF",
                border: "1px solid rgba(245,158,11,0.35)",
                backdropFilter: "blur(8px)",
                padding: "3px 8px",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 500,
              } : {
                color: "rgba(255,255,255,0.55)",
                fontSize: 10,
                fontWeight: 500,
                textShadow: "0 1px 3px rgba(0,0,0,0.9)",
              })
            }}
          >
            {country.name}
          </div>
        </Html>
      )}
    </group>
  );
}

/* ── Main globe with day/night shader ── */
function EarthGlobe({
  selectedCountry, onCountrySelect, onInteractionStart, sunDir,
}: {
  selectedCountry: CountryCentroid | null;
  onCountrySelect: (country: CountryCentroid) => void;
  onInteractionStart: () => void;
  sunDir: THREE.Vector3;
}) {
  const [hoveredCountry, setHoveredCountry] = useState<CountryCentroid | null>(null);
  const shaderRef = useRef<THREE.ShaderMaterial>(null);

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

  /* Build shader uniforms once; update sunDirection every frame via ref */
  const uniforms = useMemo(() => ({
    dayTexture:   { value: earthTexture },
    nightTexture: { value: nightTexture },
    sunDirection: { value: sunDir.clone() },
  }), [earthTexture, nightTexture]); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame(() => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.sunDirection.value.copy(sunDir);
    }
  });

  const handlePointerMove = useCallback((e: any) => {
    if (!e.point) return;
    setHoveredCountry(findNearestCountry(e.point));
  }, []);

  const handleClick = useCallback((e: any) => {
    if (!e.point) return;
    onInteractionStart();
    const country = findNearestCountry(e.point);
    if (country) onCountrySelect(country);
  }, [onCountrySelect, onInteractionStart]);

  return (
    <group>
      {/* Earth sphere with day/night shader */}
      <Sphere
        args={[1, 128, 128]}
        onClick={handleClick}
        onPointerMove={handlePointerMove}
        onPointerOut={() => setHoveredCountry(null)}
      >
        <shaderMaterial
          ref={shaderRef}
          vertexShader={DAY_NIGHT_VERT}
          fragmentShader={DAY_NIGHT_FRAG}
          uniforms={uniforms}
        />
      </Sphere>

      <Atmosphere />

      {/* Country markers */}
      {countryCentroids.map((c, i) => (
        <CountryMarker
          key={c.code}
          country={c}
          isSelected={selectedCountry?.code === c.code}
          isHovered={hoveredCountry?.code === c.code}
          isMajor={MAJOR_COUNTRIES.has(c.code)}
          phaseOffset={(i * 0.55) % 3.8}   // stagger beacons across the globe
          onClick={() => { onInteractionStart(); onCountrySelect(c); }}
          onHover={() => setHoveredCountry(c)}
          onUnhover={() => setHoveredCountry(null)}
        />
      ))}
    </group>
  );
}

/* ── Camera zoom controller ── */
function CameraController({ zoomDelta, onZoomHandled }: { zoomDelta: number; onZoomHandled: () => void }) {
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

/* ── Auto-rotate via OrbitControls ── */
function AutoRotate({ enabled }: { enabled: boolean }) {
  const ctrlRef = useRef<any>(null);

  useFrame(() => {
    if (ctrlRef.current) {
      ctrlRef.current.autoRotate      = enabled;
      ctrlRef.current.autoRotateSpeed = 0.35;
    }
  });

  return (
    <OrbitControls
      ref={ctrlRef}
      enablePan={false}
      enableZoom={true}
      minDistance={1.5}
      maxDistance={4.5}
      dampingFactor={0.06}
      enableDamping
    />
  );
}

/* ── Scene root — owns sun direction state shared across lights + shader ── */
function SceneRoot({
  selectedCountry, onCountrySelect, onInteractionStart, zoomDelta, onZoomHandled, isInteracting,
}: {
  selectedCountry: CountryCentroid | null;
  onCountrySelect: (country: CountryCentroid) => void;
  onInteractionStart: () => void;
  zoomDelta: number;
  onZoomHandled: () => void;
  isInteracting: boolean;
}) {
  const sunDir = useRef<THREE.Vector3>(getSunPosition());

  useFrame(() => {
    // Recalculate ~once per minute (1/3600 per-frame chance at ~60fps ≈ once per minute)
    if (Math.random() < 0.0003) sunDir.current.copy(getSunPosition());
  });

  return (
    <>
      <SunLight sunDir={sunDir.current} />
      <EarthGlobe
        selectedCountry={selectedCountry}
        onCountrySelect={onCountrySelect}
        onInteractionStart={onInteractionStart}
        sunDir={sunDir.current}
      />
      <CameraController zoomDelta={zoomDelta} onZoomHandled={onZoomHandled} />
      <AutoRotate enabled={!isInteracting && !selectedCountry} />
    </>
  );
}

/* ── Loading fallback ── */
function LoadingFallback() {
  return (
    <Sphere args={[1, 32, 32]}>
      <meshStandardMaterial color="#0B1A2E" roughness={0.9} />
    </Sphere>
  );
}

/* ── Root export ── */
export default function Globe({ selectedCountry, onCountrySelect, zoomDelta, onZoomHandled }: GlobeProps) {
  const [isInteracting, setIsInteracting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopRotation = useCallback(() => {
    setIsInteracting(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsInteracting(false), 6000);
  }, []);

  return (
    <div className="w-full h-full" onPointerDown={stopRotation}>
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
            zoomDelta={zoomDelta}
            onZoomHandled={onZoomHandled}
            isInteracting={isInteracting}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
