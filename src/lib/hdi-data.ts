/**
 * Human Development Index (HDI) — UNDP 2021/2022 report
 * Scale: 0.0 (lowest) → 1.0 (highest)
 */
export const HDI: Record<string, number> = {
  // ── Very High Human Development (≥0.80) ──────────────────────────────────
  NO: 0.961, IS: 0.959, HK: 0.952, AU: 0.951, DE: 0.942, SE: 0.947,
  IE: 0.945, CH: 0.962, NL: 0.941, DK: 0.948, FI: 0.940, SG: 0.939,
  NZ: 0.937, BE: 0.937, CA: 0.936, AT: 0.926, LU: 0.930, GB: 0.929,
  US: 0.921, JP: 0.920, KR: 0.929, IL: 0.919, FR: 0.903, CZ: 0.900,
  MT: 0.918, SI: 0.918, ES: 0.905, CY: 0.896, IT: 0.895, EE: 0.890,
  LV: 0.879, LT: 0.875, GR: 0.887, PT: 0.866, SK: 0.848, HU: 0.846,
  PL: 0.876, CL: 0.860, HR: 0.858, AR: 0.842, AE: 0.911, QA: 0.855,
  SA: 0.875, BH: 0.875, KW: 0.831, RU: 0.822, TT: 0.815, MX: 0.758,
  BY: 0.808, RS: 0.806, ME: 0.832, TW: 0.916, MY: 0.803, GE: 0.802,
  TH: 0.800, BA: 0.780, MK: 0.770, LK: 0.782, IR: 0.774, AL: 0.795,

  // ── High Human Development (0.70–0.79) ───────────────────────────────────
  TR: 0.838, BR: 0.754, UA: 0.773, AZ: 0.745, AM: 0.769, TN: 0.731,
  CN: 0.768, MD: 0.763, CO: 0.752, PE: 0.762, EC: 0.740,
  DO: 0.767, JM: 0.706, VN: 0.703, ID: 0.705, PH: 0.699, JO: 0.720,
  EG: 0.731, IQ: 0.686, MA: 0.683, LB: 0.706, PA: 0.805, CR: 0.809,
  KG: 0.692, UZ: 0.727, TM: 0.745, TJ: 0.685, ZA: 0.713,
  BO: 0.698, GT: 0.627, HN: 0.621, SV: 0.675, NI: 0.660, PY: 0.717,
  XK: 0.762, LY: 0.718, GH: 0.632, CI: 0.550,

  // ── Medium Human Development (0.55–0.69) ─────────────────────────────────
  IN: 0.633, NG: 0.535, PK: 0.544, BD: 0.661, MM: 0.585, UG: 0.544,
  KH: 0.593, LA: 0.607, KE: 0.601, TZ: 0.532, ET: 0.498, SD: 0.508,
  SN: 0.511, CM: 0.576, AO: 0.586, ZM: 0.565, ZW: 0.571, NP: 0.602,
  HT: 0.535, YE: 0.455, SY: 0.577, DZ: 0.745, MR: 0.540, BJ: 0.525,
  TG: 0.539, RW: 0.534, MG: 0.501, MZ: 0.456, GW: 0.443, AF: 0.478,
  GM: 0.500, SL: 0.477, LR: 0.456, GN: 0.465, CD: 0.479, MW: 0.512,

  // ── Low Human Development (<0.55) ────────────────────────────────────────
  NE: 0.394, TD: 0.398, CF: 0.404, SS: 0.385, ML: 0.428, BF: 0.449,
  ER: 0.459, SO: 0.361, BI: 0.426,
};

/** Map HDI value to fill colour + opacity */
export function hdiColor(hdi: number): { hex: string; opacity: number } {
  if (hdi >= 0.850) return { hex: "#166534", opacity: 0.52 }; // Very High
  if (hdi >= 0.750) return { hex: "#22C55E", opacity: 0.45 }; // High
  if (hdi >= 0.600) return { hex: "#EAB308", opacity: 0.42 }; // Medium
  return                   { hex: "#EF4444", opacity: 0.48 }; // Low
}
