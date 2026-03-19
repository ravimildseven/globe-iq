import { NextRequest, NextResponse } from "next/server";
import { economyDatabase } from "@/lib/economy-data";
import type { EconomyData } from "@/lib/types";

// ─── Response type ──────────────────────────────────────────────────────────
interface EconomyResponse {
  data: EconomyData | null;
  source: "worldbank" | "static" | "none";
  sourceLabel: string;
  asOf: string;
}

// ─── World Bank indicator IDs ───────────────────────────────────────────────
const WB_GDP        = "NY.GDP.MKTP.CD";
const WB_GDP_CAPITA = "NY.GDP.PCAP.CD";
const WB_INFLATION  = "FP.CPI.TOTL.ZG";
const WB_UNEMPLOY   = "SL.UEM.TOTL.ZS";

// ─── Formatting helpers ──────────────────────────────────────────────────────
function fmtGdp(val: number): string {
  if (val >= 1e12) return `$${(val / 1e12).toFixed(1)}T`;
  if (val >= 1e9)  return `$${(val / 1e9).toFixed(1)}B`;
  if (val >= 1e6)  return `$${(val / 1e6).toFixed(1)}M`;
  return `$${val.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function fmtGdpPerCapita(val: number): string {
  return `$${val.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function fmtPercent(val: number): string {
  return `${val.toFixed(1)}%`;
}

// ─── Fetch a single World Bank indicator value ────────────────────────────────
async function fetchWBIndicator(code: string, indicator: string): Promise<{ value: number | null; date: string | null }> {
  try {
    const url = `https://api.worldbank.org/v2/country/${code}/indicator/${indicator}?format=json&mrv=1&per_page=1`;
    const res = await fetch(url, { next: { revalidate: 86400 } }); // 24-hour cache
    if (!res.ok) return { value: null, date: null };
    const json = await res.json();
    const row = Array.isArray(json) && Array.isArray(json[1]) ? json[1][0] : null;
    return { value: row?.value ?? null, date: row?.date ?? null };
  } catch {
    return { value: null, date: null };
  }
}

// ─── Route handler ───────────────────────────────────────────────────────────
// GET /api/economy?code=IN
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")?.toUpperCase();

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const asOf = new Date().toLocaleDateString("en-US", {
    month: "long",
    day:   "numeric",
    year:  "numeric",
  });

  const staticEntry = economyDatabase[code] ?? null;

  // ── Fetch all 4 World Bank indicators in parallel ─────────────────────────
  try {
    const [gdpRes, gdpCapRes, inflRes, unempRes] = await Promise.all([
      fetchWBIndicator(code, WB_GDP),
      fetchWBIndicator(code, WB_GDP_CAPITA),
      fetchWBIndicator(code, WB_INFLATION),
      fetchWBIndicator(code, WB_UNEMPLOY),
    ]);

    // Need at least GDP to consider it a valid World Bank response
    if (gdpRes.value !== null) {
      const liveData: EconomyData = {
        gdp:          fmtGdp(gdpRes.value),
        gdpPerCapita: gdpCapRes.value  !== null ? fmtGdpPerCapita(gdpCapRes.value) : (staticEntry?.gdpPerCapita ?? "N/A"),
        inflation:    inflRes.value    !== null ? fmtPercent(inflRes.value)         : (staticEntry?.inflation    ?? "N/A"),
        unemployment: unempRes.value   !== null ? fmtPercent(unempRes.value)        : (staticEntry?.unemployment ?? "N/A"),
        currency:     staticEntry?.currency    ?? "N/A",
        mainExports:  staticEntry?.mainExports ?? [],
        stockIndex:   staticEntry?.stockIndex,
        stockValue:   staticEntry?.stockValue,
        stockChange:  staticEntry?.stockChange,
      };

      const latestYear = [gdpRes.date, gdpCapRes.date, inflRes.date, unempRes.date]
        .filter(Boolean).sort().reverse()[0];
      const wbAsOf = latestYear ? `World Bank ${latestYear} data` : asOf;

      return NextResponse.json({
        data: liveData,
        source: "worldbank",
        sourceLabel: "World Bank API · Live Data",
        asOf: wbAsOf,
      } satisfies EconomyResponse);
    }
  } catch {
    // Fall through to static
  }

  // ── Fall back to static database ──────────────────────────────────────────
  if (staticEntry) {
    const staticData: EconomyData = {
      gdp:          staticEntry.gdp          ?? "N/A",
      gdpPerCapita: staticEntry.gdpPerCapita ?? "N/A",
      currency:     staticEntry.currency,
      inflation:    staticEntry.inflation    ?? "N/A",
      unemployment: staticEntry.unemployment ?? "N/A",
      mainExports:  staticEntry.mainExports,
      stockIndex:   staticEntry.stockIndex,
      stockValue:   staticEntry.stockValue,
      stockChange:  staticEntry.stockChange,
    };
    return NextResponse.json({
      data: staticData,
      source: "static",
      sourceLabel: "Curated Database",
      asOf,
    } satisfies EconomyResponse);
  }

  // ── Nothing available ─────────────────────────────────────────────────────
  return NextResponse.json({
    data: null,
    source: "none",
    sourceLabel: "No data",
    asOf,
  } satisfies EconomyResponse);
}
