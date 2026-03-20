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

// ─── All bordered countries get a name label — horizon-fade limits density ─────
// The globe shows ~40-50 countries at any orientation; dot-product fade hides
// labels near the limb, so crowding is naturally managed by the 3D geometry.
const LABELED_COUNTRIES: { code: string; name: string; lat: number; lng: number; small?: boolean }[] = [
  // ── Largest nations (clear label space) ─────────────────────────────────────
  { code: "RU", name: "Russia",         lat:  61.52, lng:  105.32 },
  { code: "CA", name: "Canada",         lat:  56.13, lng: -106.35 },
  { code: "US", name: "United States",  lat:  39.50, lng:  -98.35 },
  { code: "CN", name: "China",          lat:  36.00, lng:  103.00 },
  { code: "BR", name: "Brazil",         lat: -10.00, lng:  -53.00 },
  { code: "AU", name: "Australia",      lat: -25.27, lng:  133.78 },
  { code: "IN", name: "India",          lat:  22.00, lng:   79.00 },
  { code: "AR", name: "Argentina",      lat: -35.00, lng:  -65.00 },
  { code: "KZ", name: "Kazakhstan",     lat:  48.02, lng:   66.92 },
  { code: "DZ", name: "Algeria",        lat:  28.03, lng:    3.00 },
  { code: "CD", name: "DR Congo",       lat:  -4.04, lng:   21.76 },
  { code: "SA", name: "Saudi Arabia",   lat:  25.00, lng:   45.00 },
  { code: "MX", name: "Mexico",         lat:  23.63, lng: -102.55 },
  { code: "ID", name: "Indonesia",      lat:  -0.79, lng:  113.92 },
  { code: "SD", name: "Sudan",          lat:  12.86, lng:   30.22 },
  { code: "LY", name: "Libya",          lat:  26.34, lng:   17.23 },
  { code: "IR", name: "Iran",           lat:  32.43, lng:   53.69 },
  { code: "MN", name: "Mongolia",       lat:  46.86, lng:  103.85 },
  // ── Large nations ───────────────────────────────────────────────────────────
  { code: "NG", name: "Nigeria",        lat:   9.08, lng:    8.68 },
  { code: "ET", name: "Ethiopia",       lat:   9.15, lng:   40.49 },
  { code: "ZA", name: "South Africa",   lat: -29.00, lng:   25.00 },
  { code: "EG", name: "Egypt",          lat:  26.82, lng:   30.80 },
  { code: "VE", name: "Venezuela",      lat:   6.42, lng:  -66.59 },
  { code: "PK", name: "Pakistan",       lat:  30.38, lng:   69.35 },
  { code: "CO", name: "Colombia",       lat:   4.57, lng:  -74.30 },
  { code: "PE", name: "Peru",           lat:  -9.19, lng:  -75.02 },
  { code: "AO", name: "Angola",         lat: -11.20, lng:   17.87 },
  { code: "ML", name: "Mali",           lat:  17.57, lng:   -4.00 },
  { code: "TD", name: "Chad",           lat:  15.45, lng:   18.73 },
  { code: "NE", name: "Niger",          lat:  17.61, lng:    8.08 },
  { code: "SO", name: "Somalia",        lat:   5.15, lng:   46.20 },
  { code: "TZ", name: "Tanzania",       lat:  -6.37, lng:   34.89 },
  { code: "MZ", name: "Mozambique",     lat: -18.67, lng:   35.53 },
  { code: "ZM", name: "Zambia",         lat: -13.13, lng:   27.85 },
  { code: "MM", name: "Myanmar",        lat:  21.91, lng:   95.96 },
  { code: "AF", name: "Afghanistan",    lat:  33.94, lng:   67.71 },
  { code: "TR", name: "Turkey",         lat:  38.96, lng:   35.24 },
  { code: "UA", name: "Ukraine",        lat:  48.38, lng:   31.17 },
  { code: "IQ", name: "Iraq",           lat:  33.22, lng:   43.68 },
  { code: "MA", name: "Morocco",        lat:  31.79, lng:   -7.09 },
  // ── Medium nations ──────────────────────────────────────────────────────────
  { code: "UZ", name: "Uzbekistan",     lat:  41.38, lng:   64.59 },
  { code: "NO", name: "Norway",         lat:  60.47, lng:    8.47 },
  { code: "SE", name: "Sweden",         lat:  60.13, lng:   18.64 },
  { code: "FI", name: "Finland",        lat:  61.92, lng:   25.75 },
  { code: "BY", name: "Belarus",        lat:  53.71, lng:   27.95 },
  { code: "ZW", name: "Zimbabwe",       lat: -19.02, lng:   29.15 },
  { code: "DE", name: "Germany",        lat:  51.17, lng:   10.45 },
  { code: "FR", name: "France",         lat:  46.23, lng:    2.21 },
  { code: "GB", name: "UK",             lat:  55.38, lng:   -3.44 },
  { code: "ES", name: "Spain",          lat:  40.46, lng:   -3.75 },
  { code: "PL", name: "Poland",         lat:  51.92, lng:   19.15 },
  { code: "MY", name: "Malaysia",       lat:   4.21, lng:  101.98 },
  { code: "VN", name: "Vietnam",        lat:  14.06, lng:  108.28 },
  { code: "JP", name: "Japan",          lat:  36.20, lng:  138.25 },
  { code: "TH", name: "Thailand",       lat:  15.87, lng:  100.99 },
  { code: "PH", name: "Philippines",    lat:  12.88, lng:  121.77 },
  { code: "YE", name: "Yemen",          lat:  15.55, lng:   48.52 },
  { code: "CL", name: "Chile",          lat: -35.68, lng:  -71.54 },
  { code: "EC", name: "Ecuador",        lat:  -1.83, lng:  -78.18 },
  { code: "BO", name: "Bolivia",        lat: -16.29, lng:  -63.59 },
  { code: "CM", name: "Cameroon",       lat:   7.37, lng:   12.35 },
  { code: "BF", name: "Burkina Faso",   lat:  12.24, lng:   -1.56 },
  { code: "GH", name: "Ghana",          lat:   7.95, lng:   -1.02 },
  { code: "UG", name: "Uganda",         lat:   1.37, lng:   32.29 },
  { code: "KE", name: "Kenya",          lat:  -0.02, lng:   37.91 },
  { code: "RO", name: "Romania",        lat:  45.94, lng:   24.97 },
  { code: "NP", name: "Nepal",          lat:  28.39, lng:   84.12, small: true },
  { code: "KH", name: "Cambodia",       lat:  12.57, lng:  104.99, small: true },
  { code: "KP", name: "N. Korea",       lat:  40.34, lng:  127.51, small: true },
  { code: "KR", name: "S. Korea",       lat:  35.91, lng:  127.77, small: true },
  // ── Smaller nations (smaller text) ─────────────────────────────────────────
  { code: "IT", name: "Italy",          lat:  41.87, lng:   12.57, small: true },
  { code: "GR", name: "Greece",         lat:  39.07, lng:   21.82, small: true },
  { code: "PT", name: "Portugal",       lat:  39.40, lng:   -8.22, small: true },
  { code: "CZ", name: "Czechia",        lat:  49.82, lng:   15.47, small: true },
  { code: "HU", name: "Hungary",        lat:  47.16, lng:   19.50, small: true },
  { code: "SY", name: "Syria",          lat:  34.80, lng:   38.99, small: true },
  { code: "TN", name: "Tunisia",        lat:  33.89, lng:    9.54, small: true },
  { code: "BD", name: "Bangladesh",     lat:  23.68, lng:   90.36, small: true },
  { code: "NZ", name: "New Zealand",    lat: -40.90, lng:  174.89, small: true },
  { code: "CU", name: "Cuba",           lat:  21.52, lng:  -77.78, small: true },
  { code: "IE", name: "Ireland",        lat:  53.14, lng:   -7.69, small: true },
  { code: "NL", name: "Netherlands",    lat:  52.13, lng:    5.29, small: true },
  { code: "CH", name: "Switzerland",    lat:  46.82, lng:    8.23, small: true },
  { code: "AT", name: "Austria",        lat:  47.52, lng:   14.55, small: true },
  { code: "GE", name: "Georgia",        lat:  42.32, lng:   43.36, small: true },
  { code: "AZ", name: "Azerbaijan",     lat:  40.14, lng:   47.58, small: true },
  { code: "AM", name: "Armenia",        lat:  40.07, lng:   45.04, small: true },
  { code: "HR", name: "Croatia",        lat:  45.10, lng:   15.20, small: true },
  { code: "RS", name: "Serbia",         lat:  44.02, lng:   21.01, small: true },
  { code: "DK", name: "Denmark",        lat:  56.26, lng:    9.50, small: true },
  { code: "JO", name: "Jordan",         lat:  30.59, lng:   36.24, small: true },
  { code: "PA", name: "Panama",         lat:   8.54, lng:  -80.78, small: true },
  { code: "PY", name: "Paraguay",       lat: -23.44, lng:  -58.44, small: true },
  { code: "TW", name: "Taiwan",         lat:  23.70, lng:  120.96, small: true },
  { code: "LA", name: "Laos",           lat:  17.96, lng:  102.50, small: true },
];

// ─── Single muted label for a country ────────────────────────────────────────
function MajorCountryLabel({
  entry,
  hideCodes,
}: {
  entry: typeof LABELED_COUNTRIES[number];
  hideCodes: Set<string>;
}) {
  const pos = latLngToVector3(entry.lat, entry.lng, 1.055);
  const { camera } = useThree();
  const [dot, setDot] = useState(0);

  useFrame(() => {
    const d = new THREE.Vector3(...pos).normalize().dot(camera.position.clone().normalize());
    setDot(d);
  });

  // Small countries need a tighter limb threshold so they only show when well-centered
  const threshold = entry.small ? 0.50 : 0.38;
  if (dot < threshold || hideCodes.has(entry.code)) return null;

  // Fade: threshold → threshold+0.17 is the transition zone
  const opacity = Math.min(1, (dot - threshold) / 0.17) * (entry.small ? 0.55 : 0.65);

  return (
    <Html position={pos} center style={{ pointerEvents: "none", userSelect: "none" }}
      zIndexRange={[5, 0]} occlude={false}>
      <div style={{
        opacity,
        fontFamily: "var(--font-heading)",
        whiteSpace: "nowrap",
        display: "flex",
        alignItems: "center",
        gap: entry.small ? 3 : 4,
        padding: entry.small ? "1px 5px" : "2px 7px",
        borderRadius: 10,
        background: "rgba(4,10,24,0.55)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        border: "1px solid rgba(180,210,255,0.10)",
        transition: "opacity 200ms ease",
      }}>
        <span style={{ fontSize: entry.small ? 9 : 11, lineHeight: 1 }}>{flagEmoji(entry.code)}</span>
        <span style={{
          fontSize: entry.small ? 7 : 9,
          fontWeight: 600,
          color: "rgba(200,220,255,0.75)",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}>
          {entry.name}
        </span>
      </div>
    </Html>
  );
}

// ─── Renders all major-country labels ─────────────────────────────────────────
function MajorCountryLabels({
  hoveredCode,
  selectedCode,
}: {
  hoveredCode: string | null;
  selectedCode: string | null;
}) {
  const hideCodes = useMemo(() => {
    const s = new Set<string>();
    if (hoveredCode)  s.add(hoveredCode);
    if (selectedCode) s.add(selectedCode);
    return s;
  }, [hoveredCode, selectedCode]);

  return (
    <>
      {LABELED_COUNTRIES.map(entry => (
        <MajorCountryLabel key={entry.code} entry={entry} hideCodes={hideCodes} />
      ))}
    </>
  );
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

      {/* Always-visible muted labels for major countries (helps mobile) */}
      <MajorCountryLabels
        hoveredCode={hoveredCentroid?.code ?? null}
        selectedCode={selectedCountry?.code ?? null}
      />

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

// ─── Camera fly-to animation when a country is selected ──────────────────────
// Smoothly rotates the globe to face the selected country's centroid.
// Uses easeInOutCubic over FLY_DURATION seconds. Preserves current zoom distance
// (clamped to max 2.8 so we don't zoom out from a close position).
const FLY_DURATION = 1.1; // seconds

function CameraFlyTo({ selectedCountry }: { selectedCountry: CountryCentroid | null }) {
  const { camera } = useThree();
  const flyStart   = useRef<THREE.Vector3 | null>(null);
  const flyEnd     = useRef<THREE.Vector3 | null>(null);
  const elapsed    = useRef(0);
  const prevCode   = useRef<string | null>(null);

  useEffect(() => {
    if (!selectedCountry) return;
    // Only animate if the selected country actually changed
    if (selectedCountry.code === prevCode.current) return;
    prevCode.current = selectedCountry.code;

    const [x, y, z] = latLngToVector3(selectedCountry.lat, selectedCountry.lng, 1);
    const dir = new THREE.Vector3(x, y, z).normalize();
    const dist = Math.min(camera.position.length(), 2.8);

    flyStart.current = camera.position.clone();
    flyEnd.current   = dir.multiplyScalar(dist);
    elapsed.current  = 0;
  }, [selectedCountry, camera]);

  useFrame((_, delta) => {
    if (!flyStart.current || !flyEnd.current) return;
    elapsed.current += delta;
    const t = Math.min(elapsed.current / FLY_DURATION, 1);
    // easeInOutCubic
    const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    camera.position.lerpVectors(flyStart.current, flyEnd.current, eased);
    if (t >= 1) { flyStart.current = null; flyEnd.current = null; }
  });

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
      <CameraFlyTo selectedCountry={selectedCountry} />
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
