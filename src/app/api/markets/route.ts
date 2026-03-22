import { NextResponse } from "next/server";
import { COUNTRY_INDEX, MarketData } from "@/lib/marketIndices";

// Build comma-separated ticker list once at module load
const TICKERS = Object.values(COUNTRY_INDEX).map(v => v.ticker).join(",");

// Reverse map: ticker → country code
const TICKER_TO_CODE = Object.fromEntries(
  Object.entries(COUNTRY_INDEX).map(([code, v]) => [v.ticker, code])
);

const YF_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  "Origin": "https://finance.yahoo.com",
  "Referer": "https://finance.yahoo.com/",
};

/** Fetch YF crumb + cookie for authenticated API calls */
async function getYFCredentials(): Promise<{ crumb: string; cookie: string } | null> {
  try {
    const cookieRes = await fetch("https://fc.yahoo.com/", { headers: YF_HEADERS });
    const rawCookie = cookieRes.headers.getSetCookie?.()?.join("; ")
      ?? cookieRes.headers.get("set-cookie")
      ?? "";

    const crumbRes = await fetch("https://query2.finance.yahoo.com/v1/test/getcrumb", {
      headers: { ...YF_HEADERS, "Cookie": rawCookie },
    });
    if (!crumbRes.ok) return null;
    const crumb = (await crumbRes.text()).trim();
    return crumb ? { crumb, cookie: rawCookie } : null;
  } catch {
    return null;
  }
}

/** Parse Yahoo Finance quoteResponse into MarketData */
function parseQuotes(json: unknown): MarketData {
  const result: MarketData = {};
  const quotes = (json as any)?.quoteResponse?.result ?? [];
  for (const q of quotes) {
    const code = TICKER_TO_CODE[q.symbol];
    if (!code) continue;
    if (q.regularMarketPrice == null || q.regularMarketChangePercent == null) continue;
    result[code] = {
      ticker:        q.symbol,
      name:          q.shortName ?? COUNTRY_INDEX[code].name,
      price:         q.regularMarketPrice,
      changePercent: q.regularMarketChangePercent,
      currency:      q.currency ?? "",
    };
  }
  return result;
}

export const revalidate = 300;  // ISR: revalidate every 5 minutes

export async function GET() {
  const fields = "regularMarketPrice,regularMarketChangePercent,shortName,currency";
  const sym    = encodeURIComponent(TICKERS);

  // ── Attempt 1: direct v8 quote (works when not rate-limited) ──────────────
  try {
    const res = await fetch(
      `https://query2.finance.yahoo.com/v8/finance/quote?symbols=${sym}&fields=${fields}`,
      { headers: YF_HEADERS, next: { revalidate: 300 } }
    );
    if (res.ok) {
      const json = await res.json();
      const data = parseQuotes(json);
      if (Object.keys(data).length > 0) {
        return NextResponse.json(data, {
          headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
        });
      }
    }
  } catch { /* fall through */ }

  // ── Attempt 2: crumb-based authentication ─────────────────────────────────
  try {
    const creds = await getYFCredentials();
    if (creds) {
      const res = await fetch(
        `https://query2.finance.yahoo.com/v8/finance/quote?symbols=${sym}&fields=${fields}&crumb=${encodeURIComponent(creds.crumb)}`,
        { headers: { ...YF_HEADERS, "Cookie": creds.cookie }, next: { revalidate: 300 } }
      );
      if (res.ok) {
        const json = await res.json();
        const data = parseQuotes(json);
        if (Object.keys(data).length > 0) {
          return NextResponse.json(data, {
            headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
          });
        }
      }
    }
  } catch { /* fall through */ }

  // ── Fallback: empty object (globe shows no heat, EconomyTab shows "no data") ─
  return NextResponse.json({}, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30" },
  });
}
