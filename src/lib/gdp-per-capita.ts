/**
 * GDP per capita in USD — approximate 2022/2023 World Bank / IMF data
 */
export const GDP_PER_CAPITA: Record<string, number> = {
  // ── Very high income (>$40k) ─────────────────────────────────────────────
  LU: 135000, MC: 190000, SG:  82000, CH:  93000, NO: 106000,
  IS:  74000, IE: 101000, US:  76000, DK:  68000, SE:  58000,
  NL:  57000, AU:  60000, AT:  55000, FI:  53000, BE:  50000,
  CA:  52000, DE:  50000, NZ:  48000, HK:  49000, GB:  47000,
  FR:  44000, AE:  49000, IL:  55000, QA:  62000, KW:  35000,
  BH:  26000, JP:  34000, TW:  33000, KR:  33000,

  // ── High income ($15k–$40k) ──────────────────────────────────────────────
  IT:  34000, ES:  30000, CZ:  26000, PT:  24000, SI:  29000,
  SK:  22000, EE:  27000, LV:  21000, LT:  23000, PL:  18000,
  HU:  18000, HR:  17000, SA:  23000, OM:  19000, MT:  30000,
  CY:  29000, GR:  20000, TT:  16000, CL:  15000, MY:  12000,
  PA:  14000, CR:  13000, MX:  10000, AR:  13000, TR:  10000,
  RU:  12000, BY:   7000, RS:   8000, MK:   6000, BA:   7000,
  ME:  10000, AL:   6000, LB:   5000,

  // ── Upper-middle income ($5k–$15k) ──────────────────────────────────────
  BR:   9000, ZA:   7000, TH:   7000, CO:   6000, PE:   7000,
  KZ:   9000, CN:  12000, UA:   4000, AZ:   5000, GE:   6000,
  AM:   5000, TN:   4000, DZ:   4000, EG:   3500, MA:   3800,
  ID:   5000, PH:   3600, VN:   4000, LK:   3500, JO:   4000,
  IQ:   4400, LY:   6000, DO:   8800, JM:   5500, CU:   9000,
  BO:   3700, PY:   5600, EC:   6200, GT:   4600, HN:   2900,
  SV:   4700, NI:   2000, MD:   5000, XK:   5000, TM:   7600,
  IR:   5700, NA:   5200,

  // ── Lower-middle income ($1k–$5k) ───────────────────────────────────────
  IN:   2400, NG:   2200, PK:   1600, BD:   2500, MM:   1300,
  UZ:   2100, KH:   1700, LA:   1900, KE:   2200, GH:   2200,
  TZ:   1100, ET:   1000, SD:    800, SN:   1700, CI:   2500,
  CM:   1600, UG:    900, AO:   2000, ZM:   1200, ZW:   1200,
  NP:   1300, KG:   1300, TJ:    900, AF:    400, YE:    600,
  SY:    500, HT:   1600, MR:   1600, BJ:   1200, TG:   1000,
  RW:    900, BI:    300, MW:    600,
  GM:    800, SL:    500, LR:    700, GN:    800,

  // ── Low income (<$1k) ───────────────────────────────────────────────────
  CD:    600, MG:    500, MZ:    600, ML:    800, NE:    600,
  TD:    700, BF:    900, CF:    500, SS:    700, SO:    300,
  ER:    600,
};

/** Map GDP per capita (USD) to fill colour + opacity */
export function gdpColor(gdpPerCapita: number): { hex: string; opacity: number } {
  if (gdpPerCapita >= 75000) return { hex: "#166534", opacity: 0.55 }; // Very high
  if (gdpPerCapita >= 40000) return { hex: "#16A34A", opacity: 0.50 }; // High
  if (gdpPerCapita >= 15000) return { hex: "#65A30D", opacity: 0.45 }; // Upper-high
  if (gdpPerCapita >=  5000) return { hex: "#CA8A04", opacity: 0.42 }; // Upper-middle
  if (gdpPerCapita >=  2000) return { hex: "#EA580C", opacity: 0.42 }; // Lower-middle
  if (gdpPerCapita >=  1000) return { hex: "#DC2626", opacity: 0.45 }; // Low-middle
  return                            { hex: "#7F1D1D", opacity: 0.52 }; // Low
}
