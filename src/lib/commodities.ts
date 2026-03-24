export interface CommodityQuote {
  ticker: string;
  name: string;
  unit: string;
  price: number;
  changePercent: number;
}

export const COMMODITIES: { ticker: string; name: string; unit: string }[] = [
  { ticker: "GC=F",    name: "Gold",          unit: "$/oz"    },
  { ticker: "SI=F",    name: "Silver",        unit: "$/oz"    },
  { ticker: "CL=F",    name: "WTI Crude Oil", unit: "$/bbl"   },
  { ticker: "BZ=F",    name: "Brent Crude",   unit: "$/bbl"   },
  { ticker: "NG=F",    name: "Natural Gas",   unit: "$/mmBtu" },
  { ticker: "BTC-USD", name: "Bitcoin",       unit: "USD"     },
  { ticker: "ETH-USD", name: "Ethereum",      unit: "USD"     },
];
