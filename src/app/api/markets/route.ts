import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";
import type { Quote } from "yahoo-finance2/modules/quote";
import { COUNTRY_INDEX, MarketData } from "@/lib/marketIndices";

export const revalidate = 300;

export async function GET() {
  const entries = Object.entries(COUNTRY_INDEX);
  const tickers = entries.map(([, { ticker }]) => ticker);

  const data: MarketData = {};

  try {
    // yahoo-finance2 handles crumb/cookie auth automatically
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resultsArr = (await yahooFinance.quote(tickers, { return: "array" } as any)) as Quote[];

    for (const [code, { ticker, name }] of entries) {
      const quote = resultsArr.find((r) => r?.symbol === ticker);
      if (quote?.regularMarketPrice != null) {
        data[code] = {
          ticker,
          name: quote.shortName ?? quote.longName ?? name,
          price: quote.regularMarketPrice,
          changePercent: quote.regularMarketChangePercent ?? 0,
          currency: quote.currency ?? "",
        };
      }
    }
  } catch (err) {
    console.error("yahoo-finance2 error:", err);
  }

  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
  });
}
