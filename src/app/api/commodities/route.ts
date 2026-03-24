import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import type { Quote } from "yahoo-finance2/modules/quote";
import { COMMODITIES, CommodityQuote } from "@/lib/commodities";

export const revalidate = 300;

const yahooFinance = new YahooFinance();

export async function GET() {
  const tickers = COMMODITIES.map(c => c.ticker);
  const results: CommodityQuote[] = [];

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quotes = (await yahooFinance.quote(tickers, { return: "array" } as any)) as Quote[];
    for (const c of COMMODITIES) {
      const q = quotes.find(r => r?.symbol === c.ticker);
      if (q?.regularMarketPrice != null) {
        results.push({
          ticker: c.ticker,
          name: c.name,
          unit: c.unit,
          price: q.regularMarketPrice,
          changePercent: q.regularMarketChangePercent ?? 0,
        });
      }
    }
  } catch (err) {
    console.error("commodities fetch error:", err);
  }

  return NextResponse.json(results, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
  });
}
