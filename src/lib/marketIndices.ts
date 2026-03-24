// Country ISO-2 → major stock index mapping
export const COUNTRY_INDEX: Record<string, { ticker: string; name: string }> = {
  US: { ticker: "^GSPC",     name: "S&P 500" },
  GB: { ticker: "^FTSE",     name: "FTSE 100" },
  JP: { ticker: "^N225",     name: "Nikkei 225" },
  DE: { ticker: "^GDAXI",    name: "DAX" },
  FR: { ticker: "^FCHI",     name: "CAC 40" },
  IN: { ticker: "^BSESN",    name: "BSE Sensex" },
  CN: { ticker: "000001.SS", name: "SSE Composite" },
  HK: { ticker: "^HSI",      name: "Hang Seng" },
  AU: { ticker: "^AXJO",     name: "ASX 200" },
  CA: { ticker: "^GSPTSE",   name: "TSX Composite" },
  KR: { ticker: "^KS11",     name: "KOSPI" },
  BR: { ticker: "^BVSP",     name: "Ibovespa" },
  IT: { ticker: "FTSEMIB.MI",name: "FTSE MIB" },
  ES: { ticker: "^IBEX",     name: "IBEX 35" },
  NL: { ticker: "^AEX",      name: "AEX" },
  CH: { ticker: "^SSMI",     name: "SMI" },
  SE: { ticker: "^OMX",      name: "OMX Stockholm" },
  SG: { ticker: "^STI",      name: "Straits Times" },
  TW: { ticker: "^TWII",     name: "TAIEX" },
  MX: { ticker: "^MXX",      name: "IPC Mexico" },
  ZA: { ticker: "^J203.JO",  name: "JSE All Share" },
  RU: { ticker: "IMOEX.ME",  name: "MOEX Russia" },
  TR: { ticker: "XU100.IS",  name: "BIST 100" },
  SA: { ticker: "^TASI.SR",  name: "Tadawul (TASI)" },
  NG: { ticker: "^NGSEINDX", name: "NGX All Share" },
  EG: { ticker: "^CASE30",   name: "EGX 30" },
  AR: { ticker: "^MERV",     name: "MERVAL" },
  ID: { ticker: "^JKSE",     name: "IDX Composite" },
  MY: { ticker: "^KLSE",     name: "KLCI" },
  TH: { ticker: "^SET.BK",   name: "SET Index" },
  PH: { ticker: "PSEI.PS",   name: "PSEi" },
  PK: { ticker: "KSE100.KA", name: "KSE 100" },
  NO: { ticker: "^OSEAX",    name: "Oslo Børs" },
  DK: { ticker: "^OMXC25",   name: "OMX Copenhagen" },
  FI: { ticker: "^OMXH25",   name: "OMX Helsinki" },
  PT: { ticker: "^PSI20",    name: "PSI 20" },
  BE: { ticker: "^BFX",      name: "BEL 20" },
  AT: { ticker: "^ATX",      name: "ATX Vienna" },
  PL: { ticker: "^WIG20",    name: "WIG 20" },
  CZ: { ticker: "^PX",       name: "PX Prague" },
  GR: { ticker: "^ATG",      name: "Athens General" },
  IL: { ticker: "^TA125.TA", name: "TA-125" },
  AE: { ticker: "^DFMGI",    name: "DFM General" },
  QA: { ticker: "^DSM",      name: "Qatar Exchange" },
  VN: { ticker: "^VNINDEX",  name: "VN-Index" },

  // Additional indices
  NZ: { ticker: "^NZ50",      name: "NZX 50" },
  IE: { ticker: "^ISEQ",      name: "ISEQ Overall" },
  HU: { ticker: "^BUX",       name: "Budapest SE" },
  CL: { ticker: "^IPSA",      name: "S&P IPSA" },
  PE: { ticker: "^SPBLPGPT",  name: "S&P BVL Peru" },
  CO: { ticker: "^COLCAP",    name: "COLCAP Colombia" },
  LK: { ticker: "^CSEALL",    name: "CSE All Share" },
  OM: { ticker: "^MSM30",     name: "MSM 30 Oman" },
  KW: { ticker: "^KWX",       name: "Kuwait Premier" },
  BH: { ticker: "^BASI",      name: "Bahrain All Share" },
  MA: { ticker: "^MASI",      name: "MASI Casablanca" },
  BD: { ticker: "^DSEX",      name: "DSEX Bangladesh" },
  RS: { ticker: "^BELEX15",   name: "BELEX 15" },
  UA: { ticker: "^PFTS",      name: "PFTS Ukraine" },
  KE: { ticker: "^NSE20",     name: "NSE 20 Kenya" },
};

export interface MarketQuote {
  ticker: string;
  name: string;
  price: number;
  changePercent: number;   // e.g. -1.23
  currency: string;
}

export type MarketData = Record<string, MarketQuote>;  // keyed by ISO-2 country code

/** THREE.js-compatible hex colour for a given % change */
export function marketHex(changePercent: number): string {
  return changePercent >= 0 ? "#22C55E" : "#EF4444";
}

/** Overlay opacity — stronger for bigger moves, min 0.30 at 0%, max 0.70 */
export function marketOpacity(changePercent: number): number {
  return Math.min(0.70, 0.30 + Math.abs(changePercent) / 5);
}
