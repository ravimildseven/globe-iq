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
function getSunPosition(): [number, number, number] {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const declination = -23.44 * Math.cos((2 * Math.PI * (dayOfYear + 10)) / 365);
  const hours = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
  const sunLng = (12 - hours) * 15;
  const phi   = (90 - declination) * (Math.PI / 180);
  const theta = (sunLng + 180) * (Math.PI / 180);
  const d = 10;
  return [
    -(d * Math.sin(phi) * Math.cos(theta)),
    d * Math.cos(phi),
    d * Math.sin(phi) * Math.sin(theta),
  ];
}

function SunLight() {
  const [sunPos, setSunPos] = useState<[number, number, number]>(getSunPosition);

  useFrame(() => {
    if (Math.random() < 0.016) setSunPos(getSunPosition());
  });

  return (
    <>
      {/* Primary warm sunlight */}
      <directionalLight position={sunPos} intensity={2.2} color="#FFF5E0" castShadow={false} />
      {/* Very dim ambient — deep space starlight */}
      <ambientLight intensity={0.12} color="#8AA8D0" />
      {/* Earthshine (faint blue-fill from opposite side) */}
      <directionalLight
        position={[-sunPos[0] * 0.4, -sunPos[1] * 0.3, -sunPos[2] * 0.4]}
        intensity={0.18}
        color="#3A5A8A"
      />
    </>
  );
}

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
  country, isSelected, isHovered, isMajor, onClick, onHover, onUnhover,
}: {
  country: CountryCentroid;
  isSelected: boolean;
  isHovered: boolean;
  isMajor: boolean;
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
    const target = isSelected ? 0.024 : isHovered ? 0.019 : isMajor ? 0.011 : 0.007;
    const s = dotRef.current.scale.x;
    dotRef.current.scale.setScalar(s + (target - s) * 0.18);

    const d = new THREE.Vector3(...pos).normalize().dot(camera.position.clone().normalize());
    setIsFront(d > 0.08);
  });

  const dotColor = isSelected ? "#F59E0B" : isHovered ? "#FCD34D" : isMajor ? "#E2E8F0" : "#94A3B8";
  const dotOpacity = isFront
    ? (isSelected ? 1 : isHovered ? 0.95 : isMajor ? 0.8 : 0.45)
    : 0;

  const showLabel = isFront && (isSelected || isHovered || isMajor);

  return (
    <group>
      {/* Large invisible hit area */}
      <mesh
        position={pos}
        onClick={e => { e.stopPropagation(); onClick(); }}
        onPointerOver={e => { e.stopPropagation(); onHover(); }}
        onPointerOut={onUnhover}
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

/* ── Main globe with textures ── */
function EarthGlobe({
  selectedCountry, onCountrySelect, onInteractionStart,
}: {
  selectedCountry: CountryCentroid | null;
  onCountrySelect: (country: CountryCentroid) => void;
  onInteractionStart: () => void;
}) {
  const [hoveredCountry, setHoveredCountry] = useState<CountryCentroid | null>(null);
  const globeRef = useRef<THREE.Mesh>(null);

  const earthTexture = useLoader(THREE.TextureLoader,
    "https://unpkg.com/three-globe@2.34.1/example/img/earth-blue-marble.jpg");
  const bumpMap = useLoader(THREE.TextureLoader,
    "https://unpkg.com/three-globe@2.34.1/example/img/earth-topology.png");
  const nightTexture = useLoader(THREE.TextureLoader,
    "https://unpkg.com/three-globe@2.34.1/example/img/earth-night.jpg");

  useMemo(() => {
    earthTexture.colorSpace = THREE.SRGBColorSpace;
    earthTexture.anisotropy = 16;
    nightTexture.colorSpace = THREE.SRGBColorSpace;
  }, [earthTexture, nightTexture]);

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
      {/* Earth sphere */}
      <Sphere
        ref={globeRef}
        args={[1, 128, 128]}
        onClick={handleClick}
        onPointerMove={handlePointerMove}
        onPointerOut={() => setHoveredCountry(null)}
      >
        <meshStandardMaterial
          map={earthTexture}
          bumpMap={bumpMap}
          bumpScale={0.035}
          roughness={0.65}
          metalness={0.04}
        />
      </Sphere>

      <Atmosphere />

      {/* Country markers */}
      {countryCentroids.map(c => (
        <CountryMarker
          key={c.code}
          country={c}
          isSelected={selectedCountry?.code === c.code}
          isHovered={hoveredCountry?.code === c.code}
          isMajor={MAJOR_COUNTRIES.has(c.code)}
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
        <SunLight />

        <Suspense fallback={<LoadingFallback />}>
          <EarthGlobe
            selectedCountry={selectedCountry}
            onCountrySelect={onCountrySelect}
            onInteractionStart={stopRotation}
          />
        </Suspense>

        <CameraController zoomDelta={zoomDelta} onZoomHandled={onZoomHandled} />
        <AutoRotate enabled={!isInteracting && !selectedCountry} />
      </Canvas>
    </div>
  );
}
