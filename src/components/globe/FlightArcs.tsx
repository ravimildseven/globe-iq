import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { latLngToVector3 } from "@/lib/countries-geo";

interface FlightArcProps {
  source: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  color?: string;
}

export function FlightArc({ source, destination, color = "#38bdf8" }: FlightArcProps) {
  const lineRef = useRef<THREE.Line>(null);
  const geoRef = useRef<THREE.BufferGeometry>(null);

  // Generate the bezier curve paths
  const geometry = useMemo(() => {
    // Globe radius is assumed to be roughly 1.0. Place endpoints slightly above the map.
    const [sx, sy, sz] = latLngToVector3(source.lat, source.lng, 1.01);
    const [dx, dy, dz] = latLngToVector3(destination.lat, destination.lng, 1.01);

    const startVec = new THREE.Vector3(sx, sy, sz);
    const endVec = new THREE.Vector3(dx, dy, dz);

    const distance = startVec.distanceTo(endVec);

    // Compute the midpoint of the chord
    const midPoint = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);

    // Push the control point outwards to form an arc based on the chord distance
    // The multiplier dictates the height of the arc
    const arcHeight = Math.max(0.1, distance * 0.4);
    const controlPoint = midPoint.clone().normalize().multiplyScalar(1.0 + arcHeight);

    // Quadratic bezier
    const curve = new THREE.QuadraticBezierCurve3(startVec, controlPoint, endVec);

    // Extract enough points to make the arc smooth
    const points = curve.getPoints(64);

    const geo = new THREE.BufferGeometry().setFromPoints(points);
    
    // We must manually compute line distances for dashed materials to work correctly
    geo.computeBoundingBox();
    
    return geo;
  }, [source.lat, source.lng, destination.lat, destination.lng]);

  const material = useMemo(() => {
    return new THREE.LineDashedMaterial({
      color,
      linewidth: 3, 
      dashSize: 0.04,
      gapSize: 0.08,
      transparent: true,
      opacity: 0.9,
    });
  }, [color]);

  useFrame((_, delta) => {
    if (lineRef.current) {
      const mat = lineRef.current.material as any;
      if (mat.dashSize > 0) {
        // Move the dashes backwards to simulate forward flight motion
        mat.dashOffset -= delta * 0.15;
      }
    }
  });

  return (
    <primitive
      object={new THREE.Line(geometry, material)}
      ref={lineRef}
      onUpdate={(self: any) => self.computeLineDistances()}
    />
  );
}
