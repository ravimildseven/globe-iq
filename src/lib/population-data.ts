/**
 * Static population density data — persons per km²
 * Source: World Bank / UN estimates, ~2023
 */
export const POPULATION_DENSITY: Record<string, number> = {
  // ── Very high (>300) ───────────────────────────────
  SG: 8357, BD: 1119, PS: 778, LB: 667, RW: 525, KR: 527, NL: 521,
  IL: 418,  IN: 430,  BE: 376, JP: 336, PH: 368, VN: 308, GB: 275,
  DE: 237,  CH: 217,  IT: 200,

  // ── High (100–300) ────────────────────────────────
  CN: 153, NG: 226, PK: 287, UG: 213, TH: 136, GH: 130, FR: 119,
  ET: 115,  TR: 106, EG: 103, MX: 64,  RO: 82,  MA: 81,  MM: 79,
  UA: 74,   PL: 124, GR: 82,  PT: 112, CZ: 138, HU: 107, AT: 107,
  BY: 47,   TN: 74,  SY: 97,  IQ: 94,  YE: 58,  CM: 52,

  // ── Medium (20–100) ───────────────────────────────
  TZ: 65,  KE: 94,  ZA: 48,  MZ: 39,  CO: 44,  EC: 68,  PE: 24,
  VE: 35,  ZW: 38,  CD: 40,  ZM: 22,  AO: 26,  SO: 25,  AF: 55,
  ID: 145, MY: 98,  IR: 52,  SA: 17,  IQ_: 94, UA_: 74, SN: 83,
  GT: 158, HN: 78,  NI: 51,  DO: 219, CU: 102, TW: 650, LA: 30,
  KH: 95,  NP: 203, KP: 213, RS: 80,  HR: 73,  BG: 64,  SK: 114,
  LT: 44,  LV: 30,  EE: 30,  DK: 137, SE: 25,  NO: 15,  FI: 18,

  // ── Low (5–20) ────────────────────────────────────
  US: 36,  AR: 16,  BR: 25,  BO: 10,  PY: 17,  UY: 19,  CL: 24,
  MG: 45,  MZ_: 39, ZM_: 22, ML: 16,  NE: 18,  TD: 12,  BF: 73,
  MR: 4,   SD: 26,  SS: 18,  ER: 29,  ET_: 115, DJ: 43, RU: 9,
  KZ: 7,   UZ: 74,  TM: 12,  KG: 32,  TJ: 63,

  // ── Very low (<5) ─────────────────────────────────
  CA: 4,   AU: 3,   MN: 2,   LY: 4,   DZ: 18,  NA: 3,   BW: 4,
  IS: 4,   GL: 0.1,
};

/** Map density (persons/km²) to fill colour + opacity */
export function densityColor(density: number): { hex: string; opacity: number } {
  if (density > 500) return { hex: "#7F1D1D", opacity: 0.55 };
  if (density > 200) return { hex: "#B91C1C", opacity: 0.50 };
  if (density > 100) return { hex: "#EA580C", opacity: 0.45 };
  if (density > 50)  return { hex: "#CA8A04", opacity: 0.40 };
  if (density > 20)  return { hex: "#16A34A", opacity: 0.35 };
  if (density > 5)   return { hex: "#22D3EE", opacity: 0.30 };
  return                    { hex: "#3B82F6", opacity: 0.25 };
}
