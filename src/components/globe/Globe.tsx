"use client";

import { useRef, useState, useMemo, useCallback, useEffect, Suspense } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, Sphere, Html } from "@react-three/drei";
import * as THREE from "three";
import { countryCentroids, latLngToVector3, findNearestCountry, CountryCentroid } from "@/lib/countries-geo";

// Major countries that always show labels on the globe
const MAJOR_COUNTRIES = new Set([
  "US", "CN", "RU", "IN", "BR", "AU", "CA", "FR", "DE", "GB",
  "JP", "KR", "SA", "EG", "NG", "ZA", "MX", "AR", "ID", "TR",
  "IT", "ES", "PK", "UA", "IR",
]);

interface GlobeProps {
  selectedCountry: CountryCentroid | null;
  onCountrySelect: (country: CountryCentroid) => void;
  zoomDelta: number; // +1 zoom in, -1 zoom out, 0 idle
  onZoomHandled: () => void;
}

// Calculate the subsolar point (where the sun is directly overhead) from current UTC time
function getSunPosition(): [number, number, number] {
  const now = new Date();

  // Solar declination (simplified — oscillates ±23.44° over the year)
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const declination = -23.44 * Math.cos((2 * Math.PI * (dayOfYear + 10)) / 365);

  // Hour angle — sun longitude based on UTC time
  const hours = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
  const sunLng = (12 - hours) * 15; // 15° per hour, noon = 0°

  // Convert to 3D position (far away directional light)
  const phi = (90 - declination) * (Math.PI / 180);
  const theta = (sunLng + 180) * (Math.PI / 180);
  const dist = 10;
  const x = -(dist * Math.sin(phi) * Math.cos(theta));
  const z = dist * Math.sin(phi) * Math.sin(theta);
  const y = dist * Math.cos(phi);

  return [x, y, z];
}

function SunLight() {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const [sunPos, setSunPos] = useState<[number, number, number]>(getSunPosition);

  // Update sun position every 60 seconds
  useFrame(() => {
    // Smooth check — update every ~60 frames
    if (Math.random() < 0.016) {
      setSunPos(getSunPosition());
    }
  });

  useEffect(() => {
    setSunPos(getSunPosition());
  }, []);

  return (
    <>
      {/* Main sunlight — warm white, positioned at real sun location */}
      <directionalLight
        ref={lightRef}
        position={sunPos}
        intensity={2.0}
        color="#FFF8F0"
      />
      {/* Ambient — very dim to simulate starlight on dark side */}
      <ambientLight intensity={0.15} color="#B4C7E0" />
      {/* Subtle fill from opposite side (earthshine / reflected light) */}
      <directionalLight
        position={[-sunPos[0] * 0.5, -sunPos[1] * 0.3, -sunPos[2] * 0.5]}
        intensity={0.15}
        color="#4a6fa5"
      />
    </>
  );
}

function CountryMarker({
  country,
  isSelected,
  isHovered,
  isMajor,
  onClick,
  onHover,
  onUnhover,
}: {
  country: CountryCentroid;
  isSelected: boolean;
  isHovered: boolean;
  isMajor: boolean;
  onClick: () => void;
  onHover: () => void;
  onUnhover: () => void;
}) {
  const dotRef = useRef<THREE.Mesh>(null);
  const [isFrontFacing, setIsFrontFacing] = useState(true);
  const pos = latLngToVector3(country.lat, country.lng, 1.005);
  const labelPos = latLngToVector3(country.lat, country.lng, 1.04);
  const { camera } = useThree();

  useFrame(() => {
    if (!dotRef.current) return;

    // Scale animation — visible dot
    const target = isSelected ? 0.022 : isHovered ? 0.018 : isMajor ? 0.012 : 0.008;
    const s = dotRef.current.scale.x;
    dotRef.current.scale.setScalar(s + (target - s) * 0.15);

    // Check if this point faces the camera (dot product occlusion)
    const pointNormal = new THREE.Vector3(...pos).normalize();
    const cameraDir = camera.position.clone().normalize();
    const d = pointNormal.dot(cameraDir);
    setIsFrontFacing(d > 0.1);
  });

  const showLabel = isFrontFacing && (isSelected || isHovered || isMajor);

  return (
    <group>
      {/* Invisible larger hit area for easy clicking */}
      <mesh
        position={pos}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={(e) => { e.stopPropagation(); onHover(); }}
        onPointerOut={onUnhover}
        visible={false}
      >
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Visible dot */}
      <mesh ref={dotRef} position={pos}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial
          color={isSelected ? "#3B82F6" : isHovered ? "#22D3EE" : "#FFFFFF"}
          transparent
          opacity={isFrontFacing
            ? (isSelected ? 1 : isHovered ? 0.95 : isMajor ? 0.85 : 0.5)
            : 0
          }
        />
      </mesh>

      {/* Outer glow ring for selected */}
      {isSelected && isFrontFacing && <SelectedPulse position={pos} />}

      {/* Label */}
      {showLabel && (
        <Html
          position={labelPos}
          center
          style={{ pointerEvents: "none", userSelect: "none" }}
          zIndexRange={[10, 0]}
          occlude={false}
        >
          <div
            className={`whitespace-nowrap transition-all duration-200 ${
              isSelected
                ? "bg-accent-blue/90 text-white px-2.5 py-1 rounded-md text-xs font-semibold shadow-lg shadow-accent-blue/30"
                : isHovered
                ? "bg-bg-card/90 backdrop-blur-sm border border-hud-border text-text-primary px-2.5 py-1 rounded-md text-xs font-medium"
                : "text-white/60 text-[10px] font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
            }`}
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {country.name}
          </div>
        </Html>
      )}
    </group>
  );
}

function SelectedPulse({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);

  const normal = new THREE.Vector3(...position).normalize();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    normal
  );

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.z += delta * 0.5;
    }
  });

  return (
    <mesh position={position} quaternion={quaternion} ref={ref}>
      <ringGeometry args={[0.03, 0.042, 32]} />
      <meshBasicMaterial color="#3B82F6" transparent opacity={0.7} side={THREE.DoubleSide} />
    </mesh>
  );
}

function EarthGlobe({
  selectedCountry,
  onCountrySelect,
  onInteractionStart,
}: {
  selectedCountry: CountryCentroid | null;
  onCountrySelect: (country: CountryCentroid) => void;
  onInteractionStart: () => void;
}) {
  const [hoveredCountry, setHoveredCountry] = useState<CountryCentroid | null>(null);
  const globeRef = useRef<THREE.Mesh>(null);

  // Load Earth textures
  const earthTexture = useLoader(
    THREE.TextureLoader,
    "https://unpkg.com/three-globe@2.34.1/example/img/earth-blue-marble.jpg"
  );

  const bumpMap = useLoader(
    THREE.TextureLoader,
    "https://unpkg.com/three-globe@2.34.1/example/img/earth-topology.png"
  );

  // Configure textures
  useMemo(() => {
    earthTexture.colorSpace = THREE.SRGBColorSpace;
    earthTexture.anisotropy = 8;
  }, [earthTexture]);

  // Hover over globe surface → find nearest country
  const handlePointerMove = useCallback(
    (event: any) => {
      if (!event.point) return;
      const country = findNearestCountry(event.point);
      setHoveredCountry(country);
    },
    []
  );

  const handlePointerOut = useCallback(() => {
    setHoveredCountry(null);
  }, []);

  const handleClick = useCallback(
    (event: any) => {
      if (!globeRef.current || !event.point) return;
      // Stop rotation immediately
      onInteractionStart();
      const country = findNearestCountry(event.point);
      if (country) {
        onCountrySelect(country);
      }
    },
    [onCountrySelect, onInteractionStart]
  );

  return (
    <group>
      {/* Earth sphere with realistic texture */}
      <Sphere
        ref={globeRef}
        args={[1, 128, 128]}
        onClick={handleClick}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
      >
        <meshStandardMaterial
          map={earthTexture}
          bumpMap={bumpMap}
          bumpScale={0.03}
          roughness={0.7}
          metalness={0.05}
        />
      </Sphere>

      {/* Atmosphere - outer glow */}
      <Sphere args={[1.015, 64, 64]}>
        <meshStandardMaterial
          color="#4da6ff"
          transparent
          opacity={0.08}
          side={THREE.FrontSide}
        />
      </Sphere>

      {/* Atmosphere - halo */}
      <Sphere args={[1.06, 64, 64]}>
        <meshBasicMaterial
          color="#87CEEB"
          transparent
          opacity={0.03}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Country markers */}
      {countryCentroids.map((country) => (
        <CountryMarker
          key={country.code}
          country={country}
          isSelected={selectedCountry?.code === country.code}
          isHovered={hoveredCountry?.code === country.code}
          isMajor={MAJOR_COUNTRIES.has(country.code)}
          onClick={() => { onInteractionStart(); onCountrySelect(country); }}
          onHover={() => setHoveredCountry(country)}
          onUnhover={() => setHoveredCountry(null)}
        />
      ))}
    </group>
  );
}

function CameraController({ zoomDelta, onZoomHandled }: { zoomDelta: number; onZoomHandled: () => void }) {
  const { camera } = useThree();

  useEffect(() => {
    if (zoomDelta === 0) return;
    const dir = camera.position.clone().normalize();
    const currentDist = camera.position.length();
    const step = 0.3 * zoomDelta;
    const newDist = THREE.MathUtils.clamp(currentDist - step, 1.5, 4);
    camera.position.copy(dir.multiplyScalar(newDist));
    onZoomHandled();
  }, [zoomDelta, camera, onZoomHandled]);

  return null;
}

function AutoRotate({ enabled }: { enabled: boolean }) {
  const controlsRef = useRef<any>(null);

  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = enabled;
      controlsRef.current.autoRotateSpeed = 0.4;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableZoom={true}
      minDistance={1.5}
      maxDistance={4}
      dampingFactor={0.05}
      enableDamping
    />
  );
}

function LoadingFallback() {
  return (
    <Sphere args={[1, 32, 32]}>
      <meshStandardMaterial color="#1a3a5c" roughness={0.8} />
    </Sphere>
  );
}

export default function Globe({ selectedCountry, onCountrySelect, zoomDelta, onZoomHandled }: GlobeProps) {
  const [isInteracting, setIsInteracting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopRotation = useCallback(() => {
    // Stop rotation immediately and keep it stopped for 5 seconds after last interaction
    setIsInteracting(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsInteracting(false), 5000);
  }, []);

  return (
    <div
      className="w-full h-full"
      onPointerDown={stopRotation}
    >
      <Canvas
        camera={{ position: [0, 0.3, 2.6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        {/* Real-time sun-based lighting */}
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
