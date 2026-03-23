"use client";

import { useState, useEffect } from "react";
import {
  bestTime,
  currencyTip,
  knownFor,
  DEFAULT_VISA,
  DEFAULT_BEST_TIME,
  DEFAULT_CURRENCY_TIP,
  DEFAULT_KNOWN_FOR,
  languageTip,
  getVisaStatus,
  getFlightHours,
  isPopularFrom,
  homeCountryData,
  type VisaStatus,
  type LanguageTip,
} from "@/lib/travelData";
import { getCountryTimezone } from "@/lib/country-timezones";
import { useHomeCountry, HOME_COUNTRY_LABELS } from "@/lib/homeCountry";

// ─── Currency codes per home country ─────────────────────────────────────────
const HOME_CURRENCY: Record<string, string> = {
  IN: "INR", US: "USD", GB: "GBP", AU: "AUD",
  CA: "CAD", DE: "EUR", FR: "EUR", JP: "JPY",
  SG: "SGD", AE: "AED",
};

// ─── ISO 4217 currency code per destination country ───────────────────────────
const COUNTRY_CURRENCY: Record<string, string> = {
  AF:"AFN",AL:"ALL",DZ:"DZD",AO:"AOA",AR:"ARS",AM:"AMD",AU:"AUD",AT:"EUR",
  AZ:"AZN",BH:"BHD",BD:"BDT",BE:"EUR",BO:"BOB",BA:"BAM",BW:"BWP",BR:"BRL",
  BN:"BND",BG:"BGN",CA:"CAD",CL:"CLP",CN:"CNY",CO:"COP",HR:"HRK",CU:"CUP",
  CZ:"CZK",DK:"DKK",EG:"EGP",ET:"ETB",FI:"EUR",FR:"EUR",GE:"GEL",DE:"EUR",
  GH:"GHS",GR:"EUR",HU:"HUF",IN:"INR",ID:"IDR",IR:"IRR",IQ:"IQD",IE:"EUR",
  IL:"ILS",IT:"EUR",JP:"JPY",JO:"JOD",KZ:"KZT",KE:"KES",KP:"KPW",KR:"KRW",
  KW:"KWD",LB:"LBP",LY:"LYD",MY:"MYR",MX:"MXN",MA:"MAD",MM:"MMK",NP:"NPR",
  NL:"EUR",NZ:"NZD",NG:"NGN",NO:"NOK",OM:"OMR",PK:"PKR",PE:"PEN",PH:"PHP",
  PL:"PLN",PT:"EUR",QA:"QAR",RO:"RON",RU:"RUB",SA:"SAR",SG:"SGD",ZA:"ZAR",
  ES:"EUR",LK:"LKR",SE:"SEK",CH:"CHF",TW:"TWD",TH:"THB",TR:"TRY",UA:"UAH",
  AE:"AED",GB:"GBP",US:"USD",UZ:"UZS",VE:"VES",VN:"VND",YE:"YER",ZW:"ZWL",
  BY:"BYN",TN:"TND",TZ:"TZS",UG:"UGX",ZM:"ZMW",KH:"KHR",CM:"XAF",CD:"CDF",
  MZ:"MZN",SY:"SYP",SD:"SDG",SR:"SRD",SN:"XOF",RS:"RSD",EE:"EUR",LV:"EUR",
  LT:"EUR",SK:"EUR",SI:"EUR",CY:"EUR",MT:"EUR",ME:"EUR",MK:"MKD",
  IS:"ISK",JM:"JMD",GN:"GNF",KG:"KGS",TJ:"TJS",TM:"TMT",MN:"MNT",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function visaLabel(v: VisaStatus): string {
  if (v === "free")       return "Visa Free";
  if (v === "on-arrival") return "On Arrival";
  if (v === "e-visa")     return "e-Visa";
  return "Visa Required";
}

function visaClass(v: VisaStatus): string {
  if (v === "free" || v === "on-arrival") return "bg-emerald-500/20 text-emerald-400";
  if (v === "e-visa")                     return "bg-amber-500/20 text-amber-400";
  return "bg-rose-500/20 text-rose-400";
}

function langLabel(t: LanguageTip | undefined): { text: string; cls: string } {
  if (!t) return { text: "Check locally", cls: "bg-zinc-500/20 text-zinc-400" };
  if (t === "english-wide")    return { text: "English works great", cls: "bg-emerald-500/20 text-emerald-400" };
  if (t === "english-limited") return { text: "Basic English helps", cls: "bg-amber-500/20 text-amber-400" };
  if (t === "hindi-ok")        return { text: "Hindi is understood", cls: "bg-blue-500/20 text-blue-400" };
  return { text: "Learn local phrases", cls: "bg-rose-500/20 text-rose-400" };
}

/**
 * Returns the UTC-offset difference between the given IANA timezone and the
 * user's local timezone (positive = destination is ahead of user).
 */
function getTimeDiff(ianaTz: string): { hours: number; label: string } | null {
  try {
    const now = new Date();
    const destParts = new Intl.DateTimeFormat("en", {
      timeZone: ianaTz,
      timeZoneName: "shortOffset",
    }).formatToParts(now);
    const destOffsetStr = destParts.find(p => p.type === "timeZoneName")?.value ?? "GMT+0";
    const parseGMT = (s: string) => {
      const m = s.match(/GMT([+-])(\d+)(?::(\d+))?/);
      if (!m) return 0;
      return (m[1] === "+" ? 1 : -1) * (parseInt(m[2]) * 60 + parseInt(m[3] ?? "0"));
    };
    const destOffsetMins  = parseGMT(destOffsetStr);
    const localOffsetMins = -now.getTimezoneOffset(); // JS returns negative of actual offset
    const diffMins = destOffsetMins - localOffsetMins;
    const hrs = diffMins / 60;
    if (hrs === 0) return { hours: 0, label: "Same time as you" };
    const abs  = Math.abs(hrs);
    const frac = abs % 1 !== 0 ? abs.toFixed(1) : abs.toString();
    const dir  = hrs > 0 ? "ahead" : "behind";
    return { hours: hrs, label: `${frac}h ${dir} of you` };
  } catch {
    return null;
  }
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function EssentialCard({
  icon,
  label,
  children,
}: {
  icon: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-bg-card border border-border-subtle rounded-xl p-3 flex flex-col gap-1.5">
      <span className="text-[9px] text-text-muted uppercase tracking-widest font-medium">
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        <span className="text-base leading-none">{icon}</span>
        {children}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TravelTab({ countryCode }: { countryCode: string }) {
  const { homeCountry } = useHomeCountry();
  const code    = countryCode.toUpperCase();

  const visa    = getVisaStatus(homeCountry, code) ?? DEFAULT_VISA;
  const time    = bestTime[code]       ?? DEFAULT_BEST_TIME;
  const tipText = currencyTip[code]    ?? DEFAULT_CURRENCY_TIP;
  const items   = knownFor[code]       ?? DEFAULT_KNOWN_FOR;
  const flightH = getFlightHours(homeCountry, code);
  const langTip = languageTip[code];
  const popular = isPopularFrom(homeCountry, code);
  const langInfo = langLabel(langTip);

  const homeInfo   = homeCountryData[homeCountry];
  const homeLabel  = HOME_COUNTRY_LABELS[homeCountry];
  const homeCurrency = HOME_CURRENCY[homeCountry] ?? "USD";

  // ── Live time difference ──────────────────────────────────────────────────
  const [timeDiff, setTimeDiff] = useState<{ hours: number; label: string } | null>(null);
  useEffect(() => {
    const tz = getCountryTimezone(code)?.primary;
    if (!tz) { setTimeDiff(null); return; }
    const compute = () => setTimeDiff(getTimeDiff(tz));
    compute();
    const id = setInterval(compute, 60_000);
    return () => clearInterval(id);
  }, [code]);

  // ── Live exchange rate (home currency → destination currency) ─────────────
  const [rateLabel, setRateLabel] = useState<string>("");
  useEffect(() => {
    setRateLabel("");
    if (code === homeCountry) { setRateLabel("—"); return; }
    const destCurrency = COUNTRY_CURRENCY[code];
    if (!destCurrency || destCurrency === homeCurrency) { setRateLabel("—"); return; }
    fetch(`/api/exchange-rate?from=${homeCurrency}&to=${destCurrency}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const rate = data?.rate as number | undefined;
        if (!rate) { setRateLabel("See live rates"); return; }
        const inverted = (1 / rate).toFixed(2);
        const homeCurrSymbol = homeCurrencySymbol(homeCurrency);
        setRateLabel(`${homeCurrSymbol}${inverted} per 1 ${destCurrency}`);
      })
      .catch(() => setRateLabel("See live rates"));
  }, [code, homeCountry, homeCurrency]);

  // ── Country GDP + population ──────────────────────────────────────────────
  const [gdpPc, setGdpPc] = useState<number | null>(null);
  const [pop,   setPop]   = useState<number | null>(null);
  useEffect(() => {
    setGdpPc(null);
    setPop(null);
    fetch(`https://restcountries.com/v3.1/alpha/${code}?fields=population,gini`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        const d = Array.isArray(data) ? data[0] : data;
        if (d?.population) setPop(d.population);
      })
      .catch(() => {});
    fetch(`https://api.worldbank.org/v2/country/${code}/indicator/NY.GDP.PCAP.CD?format=json&mrv=1`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const val = data?.[1]?.[0]?.value;
        if (val != null) setGdpPc(Math.round(val));
      })
      .catch(() => {});
  }, [code]);

  function fmtPop(n: number): string {
    if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return Math.round(n / 1e3) + "K";
    return n.toString();
  }

  return (
    <div className="space-y-4">

      {/* ── Popular badge ── */}
      {popular && code !== homeCountry && (
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/25 rounded-xl px-3 py-2">
          <span className="text-base leading-none">{homeLabel.flag}</span>
          <span className="text-xs font-medium text-amber-400">
            Popular destination for {homeLabel.label} travellers
          </span>
        </div>
      )}

      {/* ── Travel Essentials ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">✈️</span>
          <span className="text-[10px] text-text-muted uppercase tracking-widest font-medium">
            Travel Essentials
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Visa */}
          <EssentialCard icon="🛂" label={`Visa · ${homeLabel.label} passport`}>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${visaClass(visa)}`}>
              {visaLabel(visa)}
            </span>
          </EssentialCard>

          {/* Best Time */}
          <EssentialCard icon="🗓" label="Best Time to Visit">
            <span className="text-xs font-medium text-text-primary">{time}</span>
          </EssentialCard>

          {/* Flight Time */}
          <EssentialCard icon="🛫" label={`Flight from ${homeInfo?.hub ?? homeLabel.label}`}>
            {flightH != null ? (
              <span className="text-xs font-medium text-text-primary">
                {flightH === 0 ? "You're home!" : `~${flightH} hrs`}
              </span>
            ) : (
              <span className="text-xs text-text-muted/60">No direct data</span>
            )}
          </EssentialCard>

          {/* Time Difference */}
          <EssentialCard icon="🕐" label="Time Difference">
            {timeDiff !== null ? (
              <span className="text-xs font-medium text-text-primary">
                {timeDiff.label}
              </span>
            ) : (
              <span className="text-xs text-text-muted/60">Calculating…</span>
            )}
          </EssentialCard>

          {/* Live Exchange Rate */}
          <EssentialCard icon="💱" label="Exchange Rate (live)">
            {rateLabel ? (
              <span className="text-xs font-medium text-text-primary">{rateLabel}</span>
            ) : (
              <span className="text-xs text-text-muted/60">Loading…</span>
            )}
          </EssentialCard>

          {/* Currency Tip */}
          <EssentialCard icon="💳" label="Currency Tip">
            <span className="text-xs text-text-secondary leading-snug">{tipText}</span>
          </EssentialCard>
        </div>
      </div>

      {/* ── Language Tip ── */}
      <div className="bg-bg-card border border-border-subtle rounded-xl p-3 flex items-center gap-2.5">
        <span className="text-base leading-none flex-shrink-0">🗣</span>
        <div className="min-w-0">
          <span className="text-[9px] text-text-muted uppercase tracking-widest font-medium block mb-1">Language</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${langInfo.cls}`}>
            {langInfo.text}
          </span>
        </div>
      </div>

      {/* ── Comparison Stats vs home country ── */}
      {homeInfo && (gdpPc !== null || pop !== null) && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">📊</span>
            <span className="text-[10px] text-text-muted uppercase tracking-widest font-medium">
              Compared to {homeInfo.name}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {gdpPc !== null && (
              <div className="bg-bg-card border border-border-subtle rounded-xl p-3">
                <span className="text-[9px] text-text-muted uppercase tracking-widest font-medium block mb-1.5">
                  GDP per capita
                </span>
                <p className="text-sm font-bold text-text-primary">
                  ${gdpPc.toLocaleString()}
                </p>
                <p className={`text-[10px] mt-0.5 ${
                  gdpPc > homeInfo.gdpPerCapita ? "text-emerald-400" : "text-rose-400"
                }`}>
                  {gdpPc > homeInfo.gdpPerCapita
                    ? `${(gdpPc / homeInfo.gdpPerCapita).toFixed(1)}× ${homeInfo.name}`
                    : `${(homeInfo.gdpPerCapita / gdpPc).toFixed(1)}× below ${homeInfo.name}`}
                </p>
              </div>
            )}
            {pop !== null && (
              <div className="bg-bg-card border border-border-subtle rounded-xl p-3">
                <span className="text-[9px] text-text-muted uppercase tracking-widest font-medium block mb-1.5">
                  Population
                </span>
                <p className="text-sm font-bold text-text-primary">
                  {fmtPop(pop)}
                </p>
                <p className="text-[10px] text-text-muted/60 mt-0.5">
                  {homeInfo.name}: {fmtPop(homeInfo.population)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Culture & Highlights ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">🎭</span>
          <span className="text-[10px] text-text-muted uppercase tracking-widest font-medium">
            Culture &amp; Highlights
          </span>
        </div>

        {/* Known For chips */}
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item.label}
              className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1 text-sm text-text-secondary"
            >
              <span>{item.emoji}</span>
              <span className="text-xs">{item.label}</span>
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}

// ─── Helper: currency symbol for common currencies ────────────────────────────
function homeCurrencySymbol(code: string): string {
  const map: Record<string, string> = {
    INR: "₹", USD: "$", GBP: "£", AUD: "A$", CAD: "C$",
    EUR: "€", JPY: "¥", SGD: "S$", AED: "د.إ",
  };
  return map[code] ?? code + " ";
}
