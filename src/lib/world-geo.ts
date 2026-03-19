import { feature as topoFeature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { FeatureCollection, Feature, Polygon, MultiPolygon } from "geojson";
import type { CountryCentroid } from "./countries-geo";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface CountryShape {
  code: string;                        // ISO alpha-2
  name: string;
  /** Each element is one Polygon: array of rings (outer + holes).
   *  Ring coords are [lng, lat] — GeoJSON convention. */
  polygons: Array<[number, number][][]>;
}

// ─── ISO 3166-1 numeric → alpha-2 ─────────────────────────────────────────────
const N2A: Record<string, string> = {
  "4":"AF","8":"AL","12":"DZ","24":"AO","32":"AR","36":"AU","40":"AT",
  "31":"AZ","50":"BD","56":"BE","68":"BO","76":"BR","100":"BG","112":"BY",
  "116":"KH","120":"CM","124":"CA","144":"LK","148":"TD","152":"CL",
  "156":"CN","158":"TW","170":"CO","180":"CD","191":"HR","192":"CU",
  "203":"CZ","208":"DK","214":"DO","218":"EC","222":"SV","231":"ET",
  "246":"FI","250":"FR","266":"GA","268":"GE","276":"DE","288":"GH",
  "300":"GR","320":"GT","340":"HN","348":"HU","356":"IN","360":"ID",
  "364":"IR","368":"IQ","372":"IE","376":"IL","380":"IT","392":"JP",
  "398":"KZ","400":"JO","404":"KE","408":"KP","410":"KR","414":"KW",
  "418":"LA","422":"LB","430":"LR","434":"LY","458":"MY","466":"ML",
  "484":"MX","504":"MA","508":"MZ","516":"NA","524":"NP","528":"NL",
  "554":"NZ","558":"NI","562":"NE","566":"NG","578":"NO","586":"PK",
  "591":"PA","598":"PG","600":"PY","604":"PE","608":"PH","616":"PL",
  "620":"PT","634":"QA","642":"RO","643":"RU","682":"SA","686":"SN",
  "688":"RS","694":"SL","702":"SG","704":"VN","706":"SO","710":"ZA",
  "716":"ZW","724":"ES","729":"SD","752":"SE","756":"CH","760":"SY",
  "764":"TH","788":"TN","792":"TR","800":"UG","804":"UA","818":"EG",
  "826":"GB","834":"TZ","840":"US","854":"BF","858":"UY","860":"UZ",
  "862":"VE","887":"YE","894":"ZM","51":"AM","104":"MM","275":"PS",
};

// ─── Module-level cache (single fetch per process) ────────────────────────────
let cache: CountryShape[] | null = null;

// ─── India official boundary (GOI claimed territory incl. full J&K + Aksai Chin) ─
async function loadIndiaOverride(): Promise<Array<[number, number][][]>> {
  const res = await fetch("/geo/india-official.geojson");
  if (!res.ok) throw new Error(`India GeoJSON HTTP ${res.status}`);
  const data = await res.json();
  const polygons: Array<[number, number][][]> = [];
  const feats: Feature<Polygon | MultiPolygon>[] =
    data.type === "FeatureCollection" ? data.features : [data];
  for (const feat of feats) {
    const geom = (feat.geometry ?? feat) as Polygon | MultiPolygon;
    if (geom.type === "Polygon") {
      polygons.push(geom.coordinates as [number, number][][]);
    } else if (geom.type === "MultiPolygon") {
      for (const poly of geom.coordinates) {
        polygons.push(poly as [number, number][][]);
      }
    }
  }
  return polygons;
}

// ─── Load + convert world-atlas TopoJSON → CountryShape[] ─────────────────────
export async function loadCountryShapes(
  centroids: CountryCentroid[]
): Promise<CountryShape[]> {
  if (cache) return cache;

  // Fetch 50m world topology + India official boundary in parallel
  const [topo, indiaPolygons] = await Promise.all([
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json")
      .then(r => r.json()) as Promise<Topology>,
    loadIndiaOverride().catch(() => {
      console.warn("[globe-iq] India boundary override missing — using world-atlas fallback");
      return [] as Array<[number, number][][]>;
    }),
  ]);

  const nameByCode = new Map(centroids.map(c => [c.code, c.name]));

  const col = topoFeature(
    topo,
    topo.objects.countries as GeometryCollection
  ) as FeatureCollection<Polygon | MultiPolygon>;

  const shapes: CountryShape[] = [];

  for (const feat of col.features) {
    const code = N2A[String(feat.id)];
    if (!code) continue;

    const name     = nameByCode.get(code) ?? code;
    let polygons: Array<[number, number][][]> = [];

    if (feat.geometry.type === "Polygon") {
      polygons.push(feat.geometry.coordinates as [number, number][][]);
    } else {
      for (const poly of feat.geometry.coordinates) {
        polygons.push(poly as [number, number][][]);
      }
    }

    // Apply India's official GOI claimed boundary (full J&K, Aksai Chin, Arunachal Pradesh)
    if (code === "IN" && indiaPolygons.length > 0) {
      polygons = indiaPolygons;
    }

    shapes.push({ code, name, polygons });
  }

  // India wins hit-test in overlapping disputed zones (J&K vs PK, Aksai Chin vs CN)
  const indiaIdx = shapes.findIndex(s => s.code === "IN");
  if (indiaIdx > 0) {
    const [india] = shapes.splice(indiaIdx, 1);
    shapes.unshift(india);
  }

  cache = shapes;
  return shapes;
}

// ─── Point-in-polygon (2D, GeoJSON [lng, lat] rings) ─────────────────────────
function pointInRing(lng: number, lat: number, ring: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if ((yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

export function findCountryAtPoint(
  lat: number, lng: number, shapes: CountryShape[]
): CountryShape | null {
  for (const shape of shapes) {
    for (const poly of shape.polygons) {
      if (!pointInRing(lng, lat, poly[0])) continue;
      // Check not inside a hole
      let inHole = false;
      for (let h = 1; h < poly.length && !inHole; h++) {
        if (pointInRing(lng, lat, poly[h])) inHole = true;
      }
      if (!inHole) return shape;
    }
  }
  return null;
}

// ─── Inverse of latLngToVector3 ───────────────────────────────────────────────
export function spherePointToLatLng(
  point: { x: number; y: number; z: number }
): { lat: number; lng: number } {
  const r   = Math.sqrt(point.x ** 2 + point.y ** 2 + point.z ** 2);
  const lat = 90 - (Math.acos(point.y / r) * 180) / Math.PI;
  const raw = (Math.atan2(point.z, -point.x) * 180) / Math.PI - 180;
  const lng = ((raw + 540) % 360) - 180;
  return { lat, lng };
}
