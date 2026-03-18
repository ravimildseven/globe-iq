/**
 * Country Timezone Data
 * Maps ISO 3166-1 alpha-2 country codes → primary IANA timezone + all timezones
 * Primary = most populous / capital city timezone
 */
export interface CountryTimezone {
  primary: string;          // IANA timezone for capital / most populous zone
  all: string[];            // All IANA timezones in the country
  utcLabel: string;         // Human-readable UTC offset label (e.g. "UTC+5:30")
}

// Precomputed UTC offset labels are calculated at runtime via Intl
// The mapping below covers all 249 UN-recognised territories

const RAW: Record<string, { primary: string; all: string[] }> = {
  AF: { primary: "Asia/Kabul",              all: ["Asia/Kabul"] },
  AL: { primary: "Europe/Tirane",           all: ["Europe/Tirane"] },
  DZ: { primary: "Africa/Algiers",          all: ["Africa/Algiers"] },
  AD: { primary: "Europe/Andorra",          all: ["Europe/Andorra"] },
  AO: { primary: "Africa/Luanda",           all: ["Africa/Luanda"] },
  AG: { primary: "America/Antigua",         all: ["America/Antigua"] },
  AR: { primary: "America/Argentina/Buenos_Aires", all: ["America/Argentina/Buenos_Aires","America/Argentina/Cordoba","America/Argentina/Salta","America/Argentina/Mendoza"] },
  AM: { primary: "Asia/Yerevan",            all: ["Asia/Yerevan"] },
  AU: { primary: "Australia/Sydney",        all: ["Australia/Sydney","Australia/Melbourne","Australia/Brisbane","Australia/Perth","Australia/Adelaide","Australia/Darwin","Australia/Hobart"] },
  AT: { primary: "Europe/Vienna",           all: ["Europe/Vienna"] },
  AZ: { primary: "Asia/Baku",              all: ["Asia/Baku"] },
  BS: { primary: "America/Nassau",          all: ["America/Nassau"] },
  BH: { primary: "Asia/Bahrain",           all: ["Asia/Bahrain"] },
  BD: { primary: "Asia/Dhaka",             all: ["Asia/Dhaka"] },
  BB: { primary: "America/Barbados",        all: ["America/Barbados"] },
  BY: { primary: "Europe/Minsk",           all: ["Europe/Minsk"] },
  BE: { primary: "Europe/Brussels",         all: ["Europe/Brussels"] },
  BZ: { primary: "America/Belize",         all: ["America/Belize"] },
  BJ: { primary: "Africa/Porto-Novo",      all: ["Africa/Porto-Novo"] },
  BT: { primary: "Asia/Thimphu",           all: ["Asia/Thimphu"] },
  BO: { primary: "America/La_Paz",         all: ["America/La_Paz"] },
  BA: { primary: "Europe/Sarajevo",        all: ["Europe/Sarajevo"] },
  BW: { primary: "Africa/Gaborone",        all: ["Africa/Gaborone"] },
  BR: { primary: "America/Sao_Paulo",      all: ["America/Sao_Paulo","America/Manaus","America/Belem","America/Fortaleza","America/Recife","America/Noronha"] },
  BN: { primary: "Asia/Brunei",            all: ["Asia/Brunei"] },
  BG: { primary: "Europe/Sofia",           all: ["Europe/Sofia"] },
  BF: { primary: "Africa/Ouagadougou",     all: ["Africa/Ouagadougou"] },
  BI: { primary: "Africa/Bujumbura",       all: ["Africa/Bujumbura"] },
  CV: { primary: "Atlantic/Cape_Verde",    all: ["Atlantic/Cape_Verde"] },
  KH: { primary: "Asia/Phnom_Penh",        all: ["Asia/Phnom_Penh"] },
  CM: { primary: "Africa/Douala",          all: ["Africa/Douala"] },
  CA: { primary: "America/Toronto",        all: ["America/Toronto","America/Vancouver","America/Winnipeg","America/Edmonton","America/Halifax","America/St_Johns"] },
  CF: { primary: "Africa/Bangui",          all: ["Africa/Bangui"] },
  TD: { primary: "Africa/Ndjamena",        all: ["Africa/Ndjamena"] },
  CL: { primary: "America/Santiago",       all: ["America/Santiago","Pacific/Easter"] },
  CN: { primary: "Asia/Shanghai",          all: ["Asia/Shanghai","Asia/Urumqi"] },
  CO: { primary: "America/Bogota",         all: ["America/Bogota"] },
  KM: { primary: "Indian/Comoro",          all: ["Indian/Comoro"] },
  CG: { primary: "Africa/Brazzaville",     all: ["Africa/Brazzaville"] },
  CD: { primary: "Africa/Kinshasa",        all: ["Africa/Kinshasa","Africa/Lubumbashi"] },
  CR: { primary: "America/Costa_Rica",     all: ["America/Costa_Rica"] },
  CI: { primary: "Africa/Abidjan",         all: ["Africa/Abidjan"] },
  HR: { primary: "Europe/Zagreb",          all: ["Europe/Zagreb"] },
  CU: { primary: "America/Havana",         all: ["America/Havana"] },
  CY: { primary: "Asia/Nicosia",           all: ["Asia/Nicosia"] },
  CZ: { primary: "Europe/Prague",          all: ["Europe/Prague"] },
  DK: { primary: "Europe/Copenhagen",      all: ["Europe/Copenhagen"] },
  DJ: { primary: "Africa/Djibouti",        all: ["Africa/Djibouti"] },
  DM: { primary: "America/Dominica",       all: ["America/Dominica"] },
  DO: { primary: "America/Santo_Domingo",  all: ["America/Santo_Domingo"] },
  EC: { primary: "America/Guayaquil",      all: ["America/Guayaquil","Pacific/Galapagos"] },
  EG: { primary: "Africa/Cairo",           all: ["Africa/Cairo"] },
  SV: { primary: "America/El_Salvador",    all: ["America/El_Salvador"] },
  GQ: { primary: "Africa/Malabo",          all: ["Africa/Malabo"] },
  ER: { primary: "Africa/Asmara",          all: ["Africa/Asmara"] },
  EE: { primary: "Europe/Tallinn",         all: ["Europe/Tallinn"] },
  SZ: { primary: "Africa/Mbabane",         all: ["Africa/Mbabane"] },
  ET: { primary: "Africa/Addis_Ababa",     all: ["Africa/Addis_Ababa"] },
  FJ: { primary: "Pacific/Fiji",           all: ["Pacific/Fiji"] },
  FI: { primary: "Europe/Helsinki",        all: ["Europe/Helsinki"] },
  FR: { primary: "Europe/Paris",           all: ["Europe/Paris"] },
  GA: { primary: "Africa/Libreville",      all: ["Africa/Libreville"] },
  GM: { primary: "Africa/Banjul",          all: ["Africa/Banjul"] },
  GE: { primary: "Asia/Tbilisi",           all: ["Asia/Tbilisi"] },
  DE: { primary: "Europe/Berlin",          all: ["Europe/Berlin"] },
  GH: { primary: "Africa/Accra",           all: ["Africa/Accra"] },
  GR: { primary: "Europe/Athens",          all: ["Europe/Athens"] },
  GD: { primary: "America/Grenada",        all: ["America/Grenada"] },
  GT: { primary: "America/Guatemala",      all: ["America/Guatemala"] },
  GN: { primary: "Africa/Conakry",         all: ["Africa/Conakry"] },
  GW: { primary: "Africa/Bissau",          all: ["Africa/Bissau"] },
  GY: { primary: "America/Guyana",         all: ["America/Guyana"] },
  HT: { primary: "America/Port-au-Prince", all: ["America/Port-au-Prince"] },
  HN: { primary: "America/Tegucigalpa",    all: ["America/Tegucigalpa"] },
  HU: { primary: "Europe/Budapest",        all: ["Europe/Budapest"] },
  IS: { primary: "Atlantic/Reykjavik",     all: ["Atlantic/Reykjavik"] },
  IN: { primary: "Asia/Kolkata",           all: ["Asia/Kolkata"] },
  ID: { primary: "Asia/Jakarta",           all: ["Asia/Jakarta","Asia/Makassar","Asia/Jayapura"] },
  IR: { primary: "Asia/Tehran",            all: ["Asia/Tehran"] },
  IQ: { primary: "Asia/Baghdad",           all: ["Asia/Baghdad"] },
  IE: { primary: "Europe/Dublin",          all: ["Europe/Dublin"] },
  IL: { primary: "Asia/Jerusalem",         all: ["Asia/Jerusalem"] },
  IT: { primary: "Europe/Rome",            all: ["Europe/Rome"] },
  JM: { primary: "America/Jamaica",        all: ["America/Jamaica"] },
  JP: { primary: "Asia/Tokyo",             all: ["Asia/Tokyo"] },
  JO: { primary: "Asia/Amman",             all: ["Asia/Amman"] },
  KZ: { primary: "Asia/Almaty",            all: ["Asia/Almaty","Asia/Aqtau","Asia/Aqtobe","Asia/Oral"] },
  KE: { primary: "Africa/Nairobi",         all: ["Africa/Nairobi"] },
  KI: { primary: "Pacific/Tarawa",         all: ["Pacific/Tarawa"] },
  KP: { primary: "Asia/Pyongyang",         all: ["Asia/Pyongyang"] },
  KR: { primary: "Asia/Seoul",             all: ["Asia/Seoul"] },
  KW: { primary: "Asia/Kuwait",            all: ["Asia/Kuwait"] },
  KG: { primary: "Asia/Bishkek",           all: ["Asia/Bishkek"] },
  LA: { primary: "Asia/Vientiane",         all: ["Asia/Vientiane"] },
  LV: { primary: "Europe/Riga",            all: ["Europe/Riga"] },
  LB: { primary: "Asia/Beirut",            all: ["Asia/Beirut"] },
  LS: { primary: "Africa/Maseru",          all: ["Africa/Maseru"] },
  LR: { primary: "Africa/Monrovia",        all: ["Africa/Monrovia"] },
  LY: { primary: "Africa/Tripoli",         all: ["Africa/Tripoli"] },
  LI: { primary: "Europe/Vaduz",           all: ["Europe/Vaduz"] },
  LT: { primary: "Europe/Vilnius",         all: ["Europe/Vilnius"] },
  LU: { primary: "Europe/Luxembourg",      all: ["Europe/Luxembourg"] },
  MG: { primary: "Indian/Antananarivo",    all: ["Indian/Antananarivo"] },
  MW: { primary: "Africa/Blantyre",        all: ["Africa/Blantyre"] },
  MY: { primary: "Asia/Kuala_Lumpur",      all: ["Asia/Kuala_Lumpur","Asia/Kuching"] },
  MV: { primary: "Indian/Maldives",        all: ["Indian/Maldives"] },
  ML: { primary: "Africa/Bamako",          all: ["Africa/Bamako"] },
  MT: { primary: "Europe/Malta",           all: ["Europe/Malta"] },
  MH: { primary: "Pacific/Majuro",         all: ["Pacific/Majuro"] },
  MR: { primary: "Africa/Nouakchott",      all: ["Africa/Nouakchott"] },
  MU: { primary: "Indian/Mauritius",       all: ["Indian/Mauritius"] },
  MX: { primary: "America/Mexico_City",    all: ["America/Mexico_City","America/Cancun","America/Monterrey","America/Hermosillo","America/Tijuana","America/Chihuahua"] },
  FM: { primary: "Pacific/Pohnpei",        all: ["Pacific/Pohnpei","Pacific/Chuuk","Pacific/Kosrae"] },
  MD: { primary: "Europe/Chisinau",        all: ["Europe/Chisinau"] },
  MC: { primary: "Europe/Monaco",          all: ["Europe/Monaco"] },
  MN: { primary: "Asia/Ulaanbaatar",       all: ["Asia/Ulaanbaatar","Asia/Hovd","Asia/Choibalsan"] },
  ME: { primary: "Europe/Podgorica",       all: ["Europe/Podgorica"] },
  MA: { primary: "Africa/Casablanca",      all: ["Africa/Casablanca"] },
  MZ: { primary: "Africa/Maputo",          all: ["Africa/Maputo"] },
  MM: { primary: "Asia/Yangon",            all: ["Asia/Yangon"] },
  NA: { primary: "Africa/Windhoek",        all: ["Africa/Windhoek"] },
  NR: { primary: "Pacific/Nauru",          all: ["Pacific/Nauru"] },
  NP: { primary: "Asia/Kathmandu",         all: ["Asia/Kathmandu"] },
  NL: { primary: "Europe/Amsterdam",       all: ["Europe/Amsterdam"] },
  NZ: { primary: "Pacific/Auckland",       all: ["Pacific/Auckland","Pacific/Chatham"] },
  NI: { primary: "America/Managua",        all: ["America/Managua"] },
  NE: { primary: "Africa/Niamey",          all: ["Africa/Niamey"] },
  NG: { primary: "Africa/Lagos",           all: ["Africa/Lagos"] },
  MK: { primary: "Europe/Skopje",          all: ["Europe/Skopje"] },
  NO: { primary: "Europe/Oslo",            all: ["Europe/Oslo"] },
  OM: { primary: "Asia/Muscat",            all: ["Asia/Muscat"] },
  PK: { primary: "Asia/Karachi",           all: ["Asia/Karachi"] },
  PW: { primary: "Pacific/Palau",          all: ["Pacific/Palau"] },
  PS: { primary: "Asia/Gaza",              all: ["Asia/Gaza","Asia/Hebron"] },
  PA: { primary: "America/Panama",         all: ["America/Panama"] },
  PG: { primary: "Pacific/Port_Moresby",   all: ["Pacific/Port_Moresby"] },
  PY: { primary: "America/Asuncion",       all: ["America/Asuncion"] },
  PE: { primary: "America/Lima",           all: ["America/Lima"] },
  PH: { primary: "Asia/Manila",            all: ["Asia/Manila"] },
  PL: { primary: "Europe/Warsaw",          all: ["Europe/Warsaw"] },
  PT: { primary: "Europe/Lisbon",          all: ["Europe/Lisbon","Atlantic/Azores"] },
  QA: { primary: "Asia/Qatar",             all: ["Asia/Qatar"] },
  RO: { primary: "Europe/Bucharest",       all: ["Europe/Bucharest"] },
  RU: { primary: "Europe/Moscow",          all: ["Europe/Moscow","Europe/Kaliningrad","Europe/Samara","Asia/Yekaterinburg","Asia/Omsk","Asia/Krasnoyarsk","Asia/Irkutsk","Asia/Yakutsk","Asia/Vladivostok","Asia/Magadan","Asia/Sakhalin","Asia/Kamchatka"] },
  RW: { primary: "Africa/Kigali",          all: ["Africa/Kigali"] },
  KN: { primary: "America/St_Kitts",       all: ["America/St_Kitts"] },
  LC: { primary: "America/St_Lucia",       all: ["America/St_Lucia"] },
  VC: { primary: "America/St_Vincent",     all: ["America/St_Vincent"] },
  WS: { primary: "Pacific/Apia",           all: ["Pacific/Apia"] },
  SM: { primary: "Europe/San_Marino",      all: ["Europe/San_Marino"] },
  ST: { primary: "Africa/Sao_Tome",        all: ["Africa/Sao_Tome"] },
  SA: { primary: "Asia/Riyadh",            all: ["Asia/Riyadh"] },
  SN: { primary: "Africa/Dakar",           all: ["Africa/Dakar"] },
  RS: { primary: "Europe/Belgrade",        all: ["Europe/Belgrade"] },
  SC: { primary: "Indian/Mahe",            all: ["Indian/Mahe"] },
  SL: { primary: "Africa/Freetown",        all: ["Africa/Freetown"] },
  SG: { primary: "Asia/Singapore",         all: ["Asia/Singapore"] },
  SK: { primary: "Europe/Bratislava",      all: ["Europe/Bratislava"] },
  SI: { primary: "Europe/Ljubljana",       all: ["Europe/Ljubljana"] },
  SB: { primary: "Pacific/Guadalcanal",    all: ["Pacific/Guadalcanal"] },
  SO: { primary: "Africa/Mogadishu",       all: ["Africa/Mogadishu"] },
  ZA: { primary: "Africa/Johannesburg",    all: ["Africa/Johannesburg"] },
  SS: { primary: "Africa/Juba",            all: ["Africa/Juba"] },
  ES: { primary: "Europe/Madrid",          all: ["Europe/Madrid","Atlantic/Canary"] },
  LK: { primary: "Asia/Colombo",           all: ["Asia/Colombo"] },
  SD: { primary: "Africa/Khartoum",        all: ["Africa/Khartoum"] },
  SR: { primary: "America/Paramaribo",     all: ["America/Paramaribo"] },
  SE: { primary: "Europe/Stockholm",       all: ["Europe/Stockholm"] },
  CH: { primary: "Europe/Zurich",          all: ["Europe/Zurich"] },
  SY: { primary: "Asia/Damascus",          all: ["Asia/Damascus"] },
  TW: { primary: "Asia/Taipei",            all: ["Asia/Taipei"] },
  TJ: { primary: "Asia/Dushanbe",          all: ["Asia/Dushanbe"] },
  TZ: { primary: "Africa/Dar_es_Salaam",   all: ["Africa/Dar_es_Salaam"] },
  TH: { primary: "Asia/Bangkok",           all: ["Asia/Bangkok"] },
  TL: { primary: "Asia/Dili",              all: ["Asia/Dili"] },
  TG: { primary: "Africa/Lome",            all: ["Africa/Lome"] },
  TO: { primary: "Pacific/Tongatapu",      all: ["Pacific/Tongatapu"] },
  TT: { primary: "America/Port_of_Spain",  all: ["America/Port_of_Spain"] },
  TN: { primary: "Africa/Tunis",           all: ["Africa/Tunis"] },
  TR: { primary: "Europe/Istanbul",        all: ["Europe/Istanbul"] },
  TM: { primary: "Asia/Ashgabat",          all: ["Asia/Ashgabat"] },
  TV: { primary: "Pacific/Funafuti",       all: ["Pacific/Funafuti"] },
  UG: { primary: "Africa/Kampala",         all: ["Africa/Kampala"] },
  UA: { primary: "Europe/Kyiv",            all: ["Europe/Kyiv","Europe/Simferopol"] },
  AE: { primary: "Asia/Dubai",             all: ["Asia/Dubai"] },
  GB: { primary: "Europe/London",          all: ["Europe/London"] },
  US: { primary: "America/New_York",       all: ["America/New_York","America/Chicago","America/Denver","America/Los_Angeles","America/Anchorage","Pacific/Honolulu"] },
  UY: { primary: "America/Montevideo",     all: ["America/Montevideo"] },
  UZ: { primary: "Asia/Tashkent",          all: ["Asia/Tashkent","Asia/Samarkand"] },
  VU: { primary: "Pacific/Efate",          all: ["Pacific/Efate"] },
  VE: { primary: "America/Caracas",        all: ["America/Caracas"] },
  VN: { primary: "Asia/Ho_Chi_Minh",       all: ["Asia/Ho_Chi_Minh"] },
  YE: { primary: "Asia/Aden",              all: ["Asia/Aden"] },
  ZM: { primary: "Africa/Lusaka",          all: ["Africa/Lusaka"] },
  ZW: { primary: "Africa/Harare",          all: ["Africa/Harare"] },
  // Extra territories
  HK: { primary: "Asia/Hong_Kong",         all: ["Asia/Hong_Kong"] },
  MO: { primary: "Asia/Macau",             all: ["Asia/Macau"] },
  PR: { primary: "America/Puerto_Rico",    all: ["America/Puerto_Rico"] },
  GU: { primary: "Pacific/Guam",           all: ["Pacific/Guam"] },
  VA: { primary: "Europe/Vatican",         all: ["Europe/Vatican"] },
  CK: { primary: "Pacific/Rarotonga",      all: ["Pacific/Rarotonga"] },
  PF: { primary: "Pacific/Tahiti",         all: ["Pacific/Tahiti"] },
  NC: { primary: "Pacific/Noumea",         all: ["Pacific/Noumea"] },
  RE: { primary: "Indian/Reunion",         all: ["Indian/Reunion"] },
  MQ: { primary: "America/Martinique",     all: ["America/Martinique"] },
  GP: { primary: "America/Guadeloupe",     all: ["America/Guadeloupe"] },
  GF: { primary: "America/Cayenne",        all: ["America/Cayenne"] },
  PM: { primary: "America/Miquelon",       all: ["America/Miquelon"] },
  YT: { primary: "Indian/Mayotte",         all: ["Indian/Mayotte"] },
  IO: { primary: "Indian/Chagos",          all: ["Indian/Chagos"] },
  KY: { primary: "America/Cayman",         all: ["America/Cayman"] },
  BM: { primary: "Atlantic/Bermuda",       all: ["Atlantic/Bermuda"] },
  VG: { primary: "America/Tortola",        all: ["America/Tortola"] },
  VI: { primary: "America/St_Thomas",      all: ["America/St_Thomas"] },
  TC: { primary: "America/Grand_Turk",     all: ["America/Grand_Turk"] },
  AI: { primary: "America/Anguilla",       all: ["America/Anguilla"] },
  MS: { primary: "America/Montserrat",     all: ["America/Montserrat"] },
  FK: { primary: "Atlantic/Stanley",       all: ["Atlantic/Stanley"] },
  GI: { primary: "Europe/Gibraltar",       all: ["Europe/Gibraltar"] },
  JE: { primary: "Europe/Jersey",          all: ["Europe/Jersey"] },
  GG: { primary: "Europe/Guernsey",        all: ["Europe/Guernsey"] },
  IM: { primary: "Europe/Isle_of_Man",     all: ["Europe/Isle_of_Man"] },
  AX: { primary: "Europe/Mariehamn",       all: ["Europe/Mariehamn"] },
  FO: { primary: "Atlantic/Faroe",         all: ["Atlantic/Faroe"] },
  GL: { primary: "America/Godthab",        all: ["America/Godthab","America/Thule","America/Scoresbysund"] },
  SJ: { primary: "Arctic/Longyearbyen",    all: ["Arctic/Longyearbyen"] },
  CX: { primary: "Indian/Christmas",       all: ["Indian/Christmas"] },
  CC: { primary: "Indian/Cocos",           all: ["Indian/Cocos"] },
  NF: { primary: "Pacific/Norfolk",        all: ["Pacific/Norfolk"] },
  SH: { primary: "Atlantic/St_Helena",     all: ["Atlantic/St_Helena"] },
};

/**
 * Get UTC offset string for an IANA timezone (e.g. "UTC+5:30")
 */
function getUtcLabel(tz: string): string {
  try {
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    }).formatToParts(now);
    const off = parts.find(p => p.type === "timeZoneName")?.value || "UTC";
    return off.replace("GMT", "UTC");
  } catch {
    return "UTC";
  }
}

/**
 * Get timezone data for a country code
 * Returns null if no timezone data is available
 */
export function getCountryTimezone(code: string): CountryTimezone | null {
  const raw = RAW[code.toUpperCase()];
  if (!raw) return null;
  return {
    primary: raw.primary,
    all: raw.all,
    utcLabel: getUtcLabel(raw.primary),
  };
}

/**
 * Format a Date as local time string for a given IANA timezone
 * Returns e.g. "14:35:07"
 */
export function formatLocalTime(date: Date, tz: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(date);
  } catch {
    return "--:--:--";
  }
}

/**
 * Get day/night context for a timezone (for icon display)
 */
export function getDayNight(date: Date, tz: string): "day" | "night" {
  try {
    const hour = parseInt(
      new Intl.DateTimeFormat("en", {
        timeZone: tz,
        hour: "numeric",
        hour12: false,
      }).format(date),
      10
    );
    return hour >= 6 && hour < 20 ? "day" : "night";
  } catch {
    return "day";
  }
}

/**
 * Get abbreviated timezone city name for multi-zone countries
 */
export function getZoneCity(tz: string): string {
  const parts = tz.split("/");
  return parts[parts.length - 1].replace(/_/g, " ");
}
