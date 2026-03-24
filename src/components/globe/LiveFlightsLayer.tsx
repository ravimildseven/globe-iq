"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CAPITAL_CITIES } from "@/lib/capitals";
import { conflictsDatabase } from "@/lib/conflicts-data";

// Convert latitude/longitude to a Vector3 position on the sphere
function polarToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

// Draw a top-down commercial airplane shape for InstancedMesh
function createAirplaneShape() {
  const shape = new THREE.Shape();
  // Drawing a recognizable commercial airliner top-down profile
  shape.moveTo(0, 1.2);         // Nose
  shape.lineTo(0.12, 0.8);      // Right cockpit
  shape.lineTo(0.18, 0.2);      // Right fuselage
  shape.lineTo(1.1, -0.2);      // Right wing tip
  shape.lineTo(1.1, -0.4);      // Right wing trailing edge
  shape.lineTo(0.18, -0.4);     // Right fuselage rear
  shape.lineTo(0.12, -1.0);     // Right tail base
  shape.lineTo(0.5, -1.2);      // Right horizontal stabilizer
  shape.lineTo(0.5, -1.3);
  shape.lineTo(0.05, -1.25);
  shape.lineTo(0, -1.35);       // Tail end
  shape.lineTo(-0.05, -1.25);
  shape.lineTo(-0.5, -1.3);
  shape.lineTo(-0.5, -1.2);     // Left horizontal stabilizer
  shape.lineTo(-0.12, -1.0);    // Left tail base
  shape.lineTo(-0.18, -0.4);    // Left fuselage rear
  shape.lineTo(-1.1, -0.4);     // Left wing trailing edge
  shape.lineTo(-1.1, -0.2);     // Left wing tip
  shape.lineTo(-0.18, 0.2);     // Left fuselage
  shape.lineTo(-0.12, 0.8);     // Left cockpit
  shape.lineTo(0, 1.2);         // Back to nose
  return shape;
}

interface SimulatedFlight {
  sourcePos: THREE.Vector3;
  targetPos: THREE.Vector3;
  progress: number;
  speed: number;
  heightOffset: number;
}

const COLORS = [
  new THREE.Color("#38bdf8"), // Cyan / Blue skies
  new THREE.Color("#facc15"), // Yellow / Discount airlines
  new THREE.Color("#fb7185"), // Pink / Special
  new THREE.Color("#4ade80"), // Green / Eco airlines
  new THREE.Color("#e2e8f0"), // White / Classic
];

export function LiveFlightsLayer({ count = 400, globeRadius = 1 }: { count?: number; globeRadius?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Determine if a country is safe to route a flight to/from
  const isSafeFlightHub = (code: string): boolean => {
    const conflicts = conflictsDatabase[code];
    if (!conflicts) return true;
    return !conflicts.some(c => c.status === "active" && (c.severity === "high" || c.severity === "medium"));
  };

  const flights = useMemo(() => {
    // Only route flights between safe capital cities
    const capitals = Object.values(CAPITAL_CITIES).filter(c => isSafeFlightHub(c.code));
    const data: SimulatedFlight[] = [];
    if (capitals.length < 2) return data;

    for (let i = 0; i < count; i++) {
        const src = capitals[Math.floor(Math.random() * capitals.length)];
        let dst = capitals[Math.floor(Math.random() * capitals.length)];
        while (src === dst) { dst = capitals[Math.floor(Math.random() * capitals.length)]; }

        const sVec = polarToVector3(src.lat, src.lng, globeRadius);
        const tVec = polarToVector3(dst.lat, dst.lng, globeRadius);
        
        const dist = sVec.distanceTo(tVec);
        const height = globeRadius + Math.max(0.04, dist * 0.16);

        data.push({
            sourcePos: sVec,
            targetPos: tVec,
            progress: Math.random(),
            speed: 0.0006 + Math.random() * 0.0012,
            heightOffset: height
        });
    }
    return data;
  }, [count, globeRadius]);

  const planeGeo = useMemo(() => new THREE.ShapeGeometry(createAirplaneShape()), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const posVec = useMemo(() => new THREE.Vector3(), []);
  const nextPosVec = useMemo(() => new THREE.Vector3(), []);
  const R = useMemo(() => new THREE.Vector3(), []);
  const F = useMemo(() => new THREE.Vector3(), []);
  const planeScale = 0.008;

  const colorArray = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for(let i = 0; i < count; i++) {
        const c = COLORS[Math.floor(Math.random() * COLORS.length)];
        c.toArray(arr, i * 3);
    }
    return arr;
  }, [count]);

  useFrame(() => {
    if (!meshRef.current) return;
    
    flights.forEach((f, i) => {
        f.progress += f.speed;
        if (f.progress >= 1) f.progress = 0;

        // Current arc position normalized to sphere surface
        posVec.copy(f.sourcePos).lerp(f.targetPos, f.progress).normalize();
        
        // Slightly future position to calculate direction of travel
        const nextProgress = Math.min(1, f.progress + 0.001);
        nextPosVec.copy(f.sourcePos).lerp(f.targetPos, nextProgress).normalize();

        const T = nextPosVec.sub(posVec).normalize(); // Travel direction
        const N = posVec.clone(); // Face straight up from center of Earth
        
        // Right vector (Cross of Travel vs Up)
        R.crossVectors(T, N).normalize();
        // True forward vector (Cross of Up vs Right)
        F.crossVectors(N, R).normalize();

        // Scale the local axes
        R.multiplyScalar(planeScale);
        F.multiplyScalar(planeScale);
        N.multiplyScalar(planeScale);
        
        // Raise to parabolic cruising altitude
        const currentAltitude = globeRadius + (f.heightOffset - globeRadius) * 4 * f.progress * (1 - f.progress);
        posVec.multiplyScalar(currentAltitude);

        // Build transformation matrix orienting the airplane flat to the surface pointing forward
        dummy.matrix.makeBasis(R, F, N);
        dummy.matrix.setPosition(posVec);
        meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null as any, null as any, count]}>
      <primitive object={planeGeo} attach="geometry" />
      <meshBasicMaterial toneMapped={false} side={THREE.DoubleSide} transparent />
      <instancedBufferAttribute attach="instanceColor" args={[colorArray, 3]} />
    </instancedMesh>
  );
}
