import { NextRequest, NextResponse } from "next/server";

export const revalidate = 3600; // cache 1 hour

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const from = searchParams.get("from");
  const to   = searchParams.get("to");

  if (!from || !to) {
    return NextResponse.json({ error: "Missing from/to params" }, { status: 400 });
  }

  try {
    // open.er-api.com supports 160+ currencies (incl. AED, INR, SAR, etc.) — no key needed
    const res = await fetch(
      `https://open.er-api.com/v6/latest/${from}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) throw new Error(`er-api ${res.status}`);
    const data = await res.json();
    const rate = data?.rates?.[to];
    if (rate == null) {
      return NextResponse.json({ error: "Currency pair not found" }, { status: 404 });
    }
    return NextResponse.json(
      { base: from, to, rate },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=300" } }
    );
  } catch (err) {
    console.error("exchange-rate error:", err);
    return NextResponse.json({ error: "Failed to fetch rate" }, { status: 502 });
  }
}
