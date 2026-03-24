import { NextResponse } from "next/server";

export const revalidate = 300;

interface EqFeature {
  geometry: { coordinates: [number, number] };
  properties: { mag: number; place: string };
}

export async function GET() {
  try {
    const res = await fetch(
      "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson",
      { next: { revalidate: 300 } },
    );
    if (!res.ok) throw new Error(`USGS returned ${res.status}`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw: any = await res.json();

    // Return only coordinates [lng, lat] and magnitude — keeps payload small
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const features: EqFeature[] = (raw.features ?? []).map((f: any) => ({
      geometry: { coordinates: [f.geometry.coordinates[0], f.geometry.coordinates[1]] },
      properties: { mag: f.properties.mag ?? 0, place: f.properties.place ?? "" },
    }));

    return NextResponse.json(features, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
    });
  } catch (err) {
    console.error("USGS earthquake fetch error:", err);
    return NextResponse.json([], { status: 200 });
  }
}
