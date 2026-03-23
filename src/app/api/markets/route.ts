import { NextResponse } from "next/server";
import { COUNTRY_INDEX, MarketData } from "@/lib/marketIndices";

const YF_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
};

export const revalidate = 300;  // ISR: revalidate every 5 minutes

/** Fetch one ticker via the chart endpoint (no auth required, stable) */
async function fetchChart(
  countryCode: string,
  ticker: string,
  fallbackName: string,
): Promise<[string, MarketData[string]] | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`,
      { headers: YF_HEADERS, next: { revalidate: 300 } },
    );
    if (!res.ok) return null;
    const json = await res.json();
    const meta = json?.chart?.result?.[0]?.meta;
    if (meta?.regularMarketPrice == null || meta?.chartPreviousClose == null) return null;

    const price      = meta.regularMarketPrice as number;
    const prevClose  = meta.chartPreviousClose as number;
    const changePercent = prevClose !== 0 ? ((price - prevClose) / prevClose) * 100 : 0;

    return [countryCode, {
      ticker,
      name:          meta.shortName ?? meta.longName ?? fallbackName,
      price,
      changePercent,
      currency:      (meta.currency as string) ?? "",
    }];
  } catch {
    return null;
  }
}

export async function GET() {
  const entries = Object.entries(COUNTRY_INDEX);

  // Fetch all tickers in parallel; failed ones are silently dropped
  const settled = await Promise.allSettled(
    entries.map(([code, { ticker, name }]) => fetchChart(code, ticker, name)),
  );

  const data: MarketData = {};
  for (const r of settled) {
    if (r.status === "fulfilled" && r.value) {
      const [code, quote] = r.value;
      data[code] = quote;
    }
  }

  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
  });
}
