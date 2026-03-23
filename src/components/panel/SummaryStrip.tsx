"use client";

import { useEffect, useState } from "react";
import { CountryInfo } from "@/lib/types";
import { MarketData } from "@/lib/marketIndices";

// Country code → IANA timezone for common capitals
const COUNTRY_TZ: Record<string, string> = {
  AD: "Europe/Andorra",       AE: "Asia/Dubai",           AF: "Asia/Kabul",
  AG: "America/Antigua",      AL: "Europe/Tirane",        AM: "Asia/Yerevan",
  AO: "Africa/Luanda",        AR: "America/Argentina/Buenos_Aires",
  AT: "Europe/Vienna",        AU: "Australia/Sydney",     AZ: "Asia/Baku",
  BA: "Europe/Sarajevo",      BD: "Asia/Dhaka",           BE: "Europe/Brussels",
  BF: "Africa/Ouagadougou",   BG: "Europe/Sofia",         BJ: "Africa/Porto-Novo",
  BN: "Asia/Brunei",          BO: "America/La_Paz",       BR: "America/Sao_Paulo",
  BT: "Asia/Thimphu",         BW: "Africa/Gaborone",      BY: "Europe/Minsk",
  CA: "America/Toronto",      CD: "Africa/Kinshasa",      CF: "Africa/Bangui",
  CG: "Africa/Brazzaville",   CH: "Europe/Zurich",        CI: "Africa/Abidjan",
  CL: "America/Santiago",     CM: "Africa/Douala",        CN: "Asia/Shanghai",
  CO: "America/Bogota",       CR: "America/Costa_Rica",   CU: "America/Havana",
  CV: "Atlantic/Cape_Verde",  CY: "Asia/Nicosia",         CZ: "Europe/Prague",
  DE: "Europe/Berlin",        DJ: "Africa/Djibouti",      DK: "Europe/Copenhagen",
  DO: "America/Santo_Domingo",DZ: "Africa/Algiers",       EC: "America/Guayaquil",
  EE: "Europe/Tallinn",       EG: "Africa/Cairo",         ER: "Africa/Asmara",
  ES: "Europe/Madrid",        ET: "Africa/Addis_Ababa",   FI: "Europe/Helsinki",
  FJ: "Pacific/Fiji",         FR: "Europe/Paris",         GA: "Africa/Libreville",
  GB: "Europe/London",        GE: "Asia/Tbilisi",         GH: "Africa/Accra",
  GM: "Africa/Banjul",        GN: "Africa/Conakry",       GQ: "Africa/Malabo",
  GR: "Europe/Athens",        GT: "America/Guatemala",    GW: "Africa/Bissau",
  GY: "America/Guyana",       HN: "America/Tegucigalpa",  HR: "Europe/Zagreb",
  HT: "America/Port-au-Prince",HU: "Europe/Budapest",    ID: "Asia/Jakarta",
  IE: "Europe/Dublin",        IL: "Asia/Jerusalem",       IN: "Asia/Kolkata",
  IQ: "Asia/Baghdad",         IR: "Asia/Tehran",          IS: "Atlantic/Reykjavik",
  IT: "Europe/Rome",          JM: "America/Jamaica",      JO: "Asia/Amman",
  JP: "Asia/Tokyo",           KE: "Africa/Nairobi",       KG: "Asia/Bishkek",
  KH: "Asia/Phnom_Penh",      KM: "Indian/Comoro",        KP: "Asia/Pyongyang",
  KR: "Asia/Seoul",           KW: "Asia/Kuwait",          KZ: "Asia/Almaty",
  LA: "Asia/Vientiane",       LB: "Asia/Beirut",          LI: "Europe/Vaduz",
  LK: "Asia/Colombo",         LR: "Africa/Monrovia",      LS: "Africa/Maseru",
  LT: "Europe/Vilnius",       LU: "Europe/Luxembourg",    LV: "Europe/Riga",
  LY: "Africa/Tripoli",       MA: "Africa/Casablanca",    MC: "Europe/Monaco",
  MD: "Europe/Chisinau",      ME: "Europe/Podgorica",     MG: "Indian/Antananarivo",
  MK: "Europe/Skopje",        ML: "Africa/Bamako",        MM: "Asia/Rangoon",
  MN: "Asia/Ulaanbaatar",     MR: "Africa/Nouakchott",    MT: "Europe/Malta",
  MU: "Indian/Mauritius",     MV: "Indian/Maldives",      MW: "Africa/Blantyre",
  MX: "America/Mexico_City",  MY: "Asia/Kuala_Lumpur",    MZ: "Africa/Maputo",
  NA: "Africa/Windhoek",      NE: "Africa/Niamey",        NG: "Africa/Lagos",
  NI: "America/Managua",      NL: "Europe/Amsterdam",     NO: "Europe/Oslo",
  NP: "Asia/Kathmandu",       NR: "Pacific/Nauru",        NZ: "Pacific/Auckland",
  OM: "Asia/Muscat",          PA: "America/Panama",       PE: "America/Lima",
  PG: "Pacific/Port_Moresby", PH: "Asia/Manila",          PK: "Asia/Karachi",
  PL: "Europe/Warsaw",        PT: "Europe/Lisbon",        PW: "Pacific/Palau",
  PY: "America/Asuncion",     QA: "Asia/Qatar",           RO: "Europe/Bucharest",
  RS: "Europe/Belgrade",      RU: "Europe/Moscow",        RW: "Africa/Kigali",
  SA: "Asia/Riyadh",          SB: "Pacific/Guadalcanal",  SC: "Indian/Mahe",
  SD: "Africa/Khartoum",      SE: "Europe/Stockholm",     SG: "Asia/Singapore",
  SI: "Europe/Ljubljana",     SK: "Europe/Bratislava",    SL: "Africa/Freetown",
  SM: "Europe/San_Marino",    SN: "Africa/Dakar",         SO: "Africa/Mogadishu",
  SR: "America/Paramaribo",   SS: "Africa/Juba",          ST: "Africa/Sao_Tome",
  SV: "America/El_Salvador",  SY: "Asia/Damascus",        SZ: "Africa/Mbabane",
  TD: "Africa/Ndjamena",      TG: "Africa/Lome",          TH: "Asia/Bangkok",
  TJ: "Asia/Dushanbe",        TL: "Asia/Dili",            TM: "Asia/Ashgabat",
  TN: "Africa/Tunis",         TO: "Pacific/Tongatapu",    TR: "Europe/Istanbul",
  TT: "America/Port_of_Spain",TV: "Pacific/Funafuti",     TW: "Asia/Taipei",
  TZ: "Africa/Dar_es_Salaam", UA: "Europe/Kiev",          UG: "Africa/Kampala",
  US: "America/New_York",     UY: "America/Montevideo",   UZ: "Asia/Tashkent",
  VA: "Europe/Vatican",       VE: "America/Caracas",      VN: "Asia/Ho_Chi_Minh",
  VU: "Pacific/Efate",        WS: "Pacific/Apia",         YE: "Asia/Aden",
  ZA: "Africa/Johannesburg",  ZM: "Africa/Lusaka",        ZW: "Africa/Harare",
};

function timeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 3600) return Math.round(diff / 60) + "m ago";
  if (diff < 86400) return Math.round(diff / 3600) + "h ago";
  return Math.round(diff / 86400) + "d ago";
}

interface NewsItem {
  title: string;
  source: string;
  publishedAt: string;
  url: string;
}

interface MarketQuote {
  ticker: string;
  name: string;
  price: number;
  changePercent: number;
  currency: string;
}

interface Props {
  countryInfo: CountryInfo | null;
  countryCode: string;
  countryName: string;
  marketQuote?: MarketQuote;
}

export default function SummaryStrip({ countryInfo, countryCode, countryName, marketQuote }: Props) {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [localTime, setLocalTime] = useState("");
  const [gdp, setGdp] = useState("");

  // Update local time every second
  useEffect(() => {
    const tz = COUNTRY_TZ[countryCode];
    if (!tz) { setLocalTime(""); return; }
    const update = () => {
      setLocalTime(
        new Intl.DateTimeFormat("en-US", {
          timeZone: tz,
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }).format(new Date())
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [countryCode]);

  // Fetch GDP
  useEffect(() => {
    setGdp("");
    fetch(`/api/economy?code=${countryCode}`)
      .then(r => (r.ok ? r.json() : null))
      .then(data => { if (data?.gdp) setGdp(data.gdp); })
      .catch(() => {});
  }, [countryCode]);

  // Fetch 2 news headlines
  useEffect(() => {
    setNewsItems([]);
    fetch(`/api/news?country=${encodeURIComponent(countryName)}&category=general`)
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (data?.articles) {
          setNewsItems(
            data.articles.slice(0, 2).map((a: { title: string; source: string; publishedAt: string; url: string }) => ({
              title: a.title,
              source: a.source,
              publishedAt: a.publishedAt,
              url: a.url,
            }))
          );
        }
      })
      .catch(() => {});
  }, [countryName]);

  const currency = countryInfo?.currencies[0];

  type Chip = { icon: string; label: string; value: string; change?: number };
  const chips: Chip[] = [
    gdp
      ? { icon: "💰", label: "GDP", value: gdp }
      : null,
    currency
      ? { icon: "💱", label: "Currency", value: `${currency.symbol ? currency.symbol + " " : ""}${currency.name}` }
      : null,
    marketQuote
      ? {
          icon: "📈",
          label: marketQuote.name,
          value: marketQuote.price.toLocaleString("en-US", { maximumFractionDigits: 0 }),
          change: marketQuote.changePercent,
        }
      : null,
    localTime
      ? { icon: "🕐", label: "Local Time", value: localTime }
      : null,
  ].filter((c): c is Chip => c !== null);

  const showSkeletons = !countryInfo;

  return (
    <div className="flex-shrink-0 border-b border-border-subtle">
      {/* Chips row */}
      <div className="overflow-x-auto scrollbar-hide px-4 pt-3 pb-2">
        <div className="flex gap-2 w-max">
          {showSkeletons
            ? [...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-1.5 bg-white/5 border border-white/10 rounded-xl px-3 py-2"
                  style={{ minWidth: 80 }}
                >
                  <div className="skeleton h-2 w-10 rounded" />
                  <div className="skeleton h-3 w-14 rounded" />
                </div>
              ))
            : chips.map((chip, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-0.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2 flex-shrink-0"
                  style={{ minWidth: 80 }}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-sm leading-none">{chip.icon}</span>
                    <span className="text-[9px] text-text-muted uppercase tracking-wide leading-none truncate max-w-[68px]">
                      {chip.label}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-text-primary leading-snug whitespace-nowrap">
                    {chip.value}
                  </span>
                  {chip.change !== undefined && (
                    <span
                      className={`text-[10px] font-medium leading-none ${
                        chip.change >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {chip.change >= 0 ? "▲" : "▼"} {Math.abs(chip.change).toFixed(2)}%
                    </span>
                  )}
                </div>
              ))}
        </div>
      </div>

      {/* News headline cards */}
      {newsItems.length > 0 && (
        <div className="px-4 pb-3 flex flex-col gap-2">
          {newsItems.map((item, i) => (
            <a
              key={i}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2 hover:bg-white/[0.08] transition-colors"
              style={{ borderLeft: "2px solid rgba(59, 130, 246, 0.55)" }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[9px] text-text-muted font-medium uppercase tracking-wide truncate max-w-[120px]">
                  {item.source}
                </span>
                {item.publishedAt && (
                  <>
                    <span className="text-[8px] text-text-muted/50">·</span>
                    <span className="text-[9px] text-text-muted/70 flex-shrink-0">
                      {timeAgo(item.publishedAt)}
                    </span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-text-primary leading-snug line-clamp-2">{item.title}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
