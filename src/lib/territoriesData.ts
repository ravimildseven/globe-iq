export interface Territory {
  code: string;           // ISO alpha-2 e.g. "GL"
  name: string;           // "Greenland"
  parentCountry: string;  // "Denmark"
  parentCode: string;     // "DK"
  status: string;         // e.g. "Autonomous Territory"
  capital: string;
  population: string;     // formatted e.g. "56,000"
  area: string;           // e.g. "2,166,086 km²"
  currency: string;       // e.g. "Danish Krone (DKK)"
  languages: string[];
  flag: string;           // emoji flag
  topoId?: number;        // ISO 3166-1 numeric = TopoJSON feature ID
}

export const TERRITORIES: Territory[] = [
  {
    code: "GL", name: "Greenland", parentCountry: "Denmark", parentCode: "DK",
    status: "Autonomous Territory", capital: "Nuuk",
    population: "56,000", area: "2,166,086 km²", currency: "Danish Krone (DKK)",
    languages: ["Greenlandic (Kalaallisut)", "Danish"], flag: "🇬🇱", topoId: 304,
  },
  {
    code: "PR", name: "Puerto Rico", parentCountry: "United States", parentCode: "US",
    status: "Unincorporated Territory", capital: "San Juan",
    population: "3,200,000", area: "9,104 km²", currency: "US Dollar (USD)",
    languages: ["Spanish", "English"], flag: "🇵🇷", topoId: 630,
  },
  {
    code: "GF", name: "French Guiana", parentCountry: "France", parentCode: "FR",
    status: "Overseas Department", capital: "Cayenne",
    population: "290,000", area: "83,534 km²", currency: "Euro (EUR)",
    languages: ["French"], flag: "🇬🇫", topoId: 254,
  },
  {
    code: "GP", name: "Guadeloupe", parentCountry: "France", parentCode: "FR",
    status: "Overseas Department", capital: "Basse-Terre",
    population: "395,000", area: "1,628 km²", currency: "Euro (EUR)",
    languages: ["French"], flag: "🇬🇵", topoId: 312,
  },
  {
    code: "MQ", name: "Martinique", parentCountry: "France", parentCode: "FR",
    status: "Overseas Department", capital: "Fort-de-France",
    population: "360,000", area: "1,128 km²", currency: "Euro (EUR)",
    languages: ["French"], flag: "🇲🇶", topoId: 474,
  },
  {
    code: "RE", name: "Réunion", parentCountry: "France", parentCode: "FR",
    status: "Overseas Department", capital: "Saint-Denis",
    population: "880,000", area: "2,512 km²", currency: "Euro (EUR)",
    languages: ["French"], flag: "🇷🇪", topoId: 638,
  },
  {
    code: "NC", name: "New Caledonia", parentCountry: "France", parentCode: "FR",
    status: "Special Collectivity", capital: "Nouméa",
    population: "270,000", area: "18,575 km²", currency: "CFP Franc (XPF)",
    languages: ["French"], flag: "🇳🇨", topoId: 540,
  },
  {
    code: "PF", name: "French Polynesia", parentCountry: "France", parentCode: "FR",
    status: "Overseas Collectivity", capital: "Papeete",
    population: "280,000", area: "4,167 km²", currency: "CFP Franc (XPF)",
    languages: ["French", "Tahitian"], flag: "🇵🇫", topoId: 258,
  },
  {
    code: "YT", name: "Mayotte", parentCountry: "France", parentCode: "FR",
    status: "Overseas Department", capital: "Mamoudzou",
    population: "310,000", area: "374 km²", currency: "Euro (EUR)",
    languages: ["French", "Shimaore"], flag: "🇾🇹", topoId: 175,
  },
  {
    code: "EH", name: "Western Sahara", parentCountry: "Morocco / SADR", parentCode: "MA",
    status: "Disputed Territory", capital: "El Aaiún",
    population: "600,000", area: "266,000 km²", currency: "Moroccan Dirham (MAD)",
    languages: ["Arabic", "Spanish"], flag: "🇪🇭", topoId: 732,
  },
  {
    code: "FK", name: "Falkland Islands", parentCountry: "United Kingdom", parentCode: "GB",
    status: "Overseas Territory", capital: "Stanley",
    population: "3,400", area: "12,173 km²", currency: "Falkland Islands Pound (FKP)",
    languages: ["English"], flag: "🇫🇰", topoId: 238,
  },
  {
    code: "GI", name: "Gibraltar", parentCountry: "United Kingdom", parentCode: "GB",
    status: "Overseas Territory", capital: "Gibraltar City",
    population: "34,000", area: "6.7 km²", currency: "Gibraltar Pound (GIP)",
    languages: ["English", "Spanish"], flag: "🇬🇮", topoId: 292,
  },
  {
    code: "BM", name: "Bermuda", parentCountry: "United Kingdom", parentCode: "GB",
    status: "Overseas Territory", capital: "Hamilton",
    population: "64,000", area: "54 km²", currency: "Bermudian Dollar (BMD)",
    languages: ["English"], flag: "🇧🇲", topoId: 60,
  },
  {
    code: "KY", name: "Cayman Islands", parentCountry: "United Kingdom", parentCode: "GB",
    status: "Overseas Territory", capital: "George Town",
    population: "65,000", area: "264 km²", currency: "Cayman Islands Dollar (KYD)",
    languages: ["English"], flag: "🇰🇾", topoId: 136,
  },
  {
    code: "TC", name: "Turks and Caicos Islands", parentCountry: "United Kingdom", parentCode: "GB",
    status: "Overseas Territory", capital: "Cockburn Town",
    population: "45,000", area: "948 km²", currency: "US Dollar (USD)",
    languages: ["English"], flag: "🇹🇨", topoId: 796,
  },
  {
    code: "VG", name: "British Virgin Islands", parentCountry: "United Kingdom", parentCode: "GB",
    status: "Overseas Territory", capital: "Road Town",
    population: "30,000", area: "151 km²", currency: "US Dollar (USD)",
    languages: ["English"], flag: "🇻🇬", topoId: 92,
  },
  {
    code: "AI", name: "Anguilla", parentCountry: "United Kingdom", parentCode: "GB",
    status: "Overseas Territory", capital: "The Valley",
    population: "18,000", area: "91 km²", currency: "East Caribbean Dollar (XCD)",
    languages: ["English"], flag: "🇦🇮", topoId: 660,
  },
  {
    code: "MS", name: "Montserrat", parentCountry: "United Kingdom", parentCode: "GB",
    status: "Overseas Territory", capital: "Brades (de facto)",
    population: "5,000", area: "102 km²", currency: "East Caribbean Dollar (XCD)",
    languages: ["English"], flag: "🇲🇸", topoId: 500,
  },
  {
    code: "SH", name: "Saint Helena", parentCountry: "United Kingdom", parentCode: "GB",
    status: "Overseas Territory", capital: "Jamestown",
    population: "6,000", area: "394 km²", currency: "Saint Helena Pound (SHP)",
    languages: ["English"], flag: "🇸🇭", topoId: 654,
  },
  {
    code: "HK", name: "Hong Kong", parentCountry: "China", parentCode: "CN",
    status: "Special Administrative Region", capital: "Hong Kong",
    population: "7,400,000", area: "1,104 km²", currency: "Hong Kong Dollar (HKD)",
    languages: ["Cantonese", "English", "Mandarin"], flag: "🇭🇰", topoId: 344,
  },
  {
    code: "MO", name: "Macau", parentCountry: "China", parentCode: "CN",
    status: "Special Administrative Region", capital: "Macau",
    population: "650,000", area: "32.9 km²", currency: "Macanese Pataca (MOP)",
    languages: ["Cantonese", "Portuguese", "Mandarin"], flag: "🇲🇴", topoId: 446,
  },
  {
    code: "AW", name: "Aruba", parentCountry: "Netherlands", parentCode: "NL",
    status: "Constituent Country", capital: "Oranjestad",
    population: "106,000", area: "180 km²", currency: "Aruban Florin (AWG)",
    languages: ["Papiamento", "Dutch"], flag: "🇦🇼", topoId: 533,
  },
  {
    code: "CW", name: "Curaçao", parentCountry: "Netherlands", parentCode: "NL",
    status: "Constituent Country", capital: "Willemstad",
    population: "150,000", area: "444 km²", currency: "Netherlands Antillean Guilder (ANG)",
    languages: ["Papiamento", "Dutch", "English"], flag: "🇨🇼", topoId: 531,
  },
  {
    code: "SX", name: "Sint Maarten", parentCountry: "Netherlands", parentCode: "NL",
    status: "Constituent Country", capital: "Philipsburg",
    population: "43,000", area: "34 km²", currency: "Netherlands Antillean Guilder (ANG)",
    languages: ["Dutch", "English"], flag: "🇸🇽", topoId: 534,
  },
  {
    code: "AS", name: "American Samoa", parentCountry: "United States", parentCode: "US",
    status: "Unincorporated Territory", capital: "Pago Pago",
    population: "55,000", area: "199 km²", currency: "US Dollar (USD)",
    languages: ["Samoan", "English"], flag: "🇦🇸", topoId: 16,
  },
  {
    code: "GU", name: "Guam", parentCountry: "United States", parentCode: "US",
    status: "Unincorporated Territory", capital: "Hagåtña",
    population: "165,000", area: "544 km²", currency: "US Dollar (USD)",
    languages: ["Chamorro", "English"], flag: "🇬🇺", topoId: 316,
  },
  {
    code: "VI", name: "US Virgin Islands", parentCountry: "United States", parentCode: "US",
    status: "Unincorporated Territory", capital: "Charlotte Amalie",
    population: "100,000", area: "347 km²", currency: "US Dollar (USD)",
    languages: ["English"], flag: "🇻🇮", topoId: 850,
  },
  {
    code: "MP", name: "Northern Mariana Islands", parentCountry: "United States", parentCode: "US",
    status: "Commonwealth", capital: "Saipan",
    population: "57,000", area: "464 km²", currency: "US Dollar (USD)",
    languages: ["Chamorro", "Carolinian", "English"], flag: "🇲🇵", topoId: 580,
  },
  {
    code: "JE", name: "Jersey", parentCountry: "United Kingdom", parentCode: "GB",
    status: "Crown Dependency", capital: "Saint Helier",
    population: "103,000", area: "118 km²", currency: "Jersey Pound (JEP)",
    languages: ["English", "French"], flag: "🇯🇪", topoId: 832,
  },
  {
    code: "GG", name: "Guernsey", parentCountry: "United Kingdom", parentCode: "GB",
    status: "Crown Dependency", capital: "Saint Peter Port",
    population: "63,000", area: "78 km²", currency: "Guernsey Pound (GGP)",
    languages: ["English", "French"], flag: "🇬🇬", topoId: 831,
  },
  {
    code: "IM", name: "Isle of Man", parentCountry: "United Kingdom", parentCode: "GB",
    status: "Crown Dependency", capital: "Douglas",
    population: "85,000", area: "572 km²", currency: "Manx Pound (IMP)",
    languages: ["English", "Manx"], flag: "🇮🇲", topoId: 833,
  },
  {
    code: "PM", name: "Saint Pierre and Miquelon", parentCountry: "France", parentCode: "FR",
    status: "Overseas Collectivity", capital: "Saint-Pierre",
    population: "6,000", area: "242 km²", currency: "Euro (EUR)",
    languages: ["French"], flag: "🇵🇲", topoId: 666,
  },
  {
    code: "WF", name: "Wallis and Futuna", parentCountry: "France", parentCode: "FR",
    status: "Overseas Collectivity", capital: "Mata-Utu",
    population: "11,000", area: "142 km²", currency: "CFP Franc (XPF)",
    languages: ["French", "Wallisian", "Futunan"], flag: "🇼🇫", topoId: 876,
  },
  {
    code: "TF", name: "French Southern Territories", parentCountry: "France", parentCode: "FR",
    status: "Overseas Territory", capital: "Port-aux-Français",
    population: "~150 (researchers)", area: "7,747 km²", currency: "Euro (EUR)",
    languages: ["French"], flag: "🇹🇫", topoId: 260,
  },
  {
    code: "CX", name: "Christmas Island", parentCountry: "Australia", parentCode: "AU",
    status: "Territory", capital: "Flying Fish Cove",
    population: "2,000", area: "135 km²", currency: "Australian Dollar (AUD)",
    languages: ["English"], flag: "🇨🇽", topoId: 162,
  },
  {
    code: "CC", name: "Cocos (Keeling) Islands", parentCountry: "Australia", parentCode: "AU",
    status: "Territory", capital: "West Island",
    population: "600", area: "14 km²", currency: "Australian Dollar (AUD)",
    languages: ["Cocos Malay", "English"], flag: "🇨🇨", topoId: 166,
  },
  {
    code: "NF", name: "Norfolk Island", parentCountry: "Australia", parentCode: "AU",
    status: "External Territory", capital: "Kingston",
    population: "1,700", area: "35 km²", currency: "Australian Dollar (AUD)",
    languages: ["English", "Norfuk"], flag: "🇳🇫", topoId: 574,
  },
];

/** Set of territory alpha-2 codes for fast lookup */
export const TERRITORY_CODES = new Set(TERRITORIES.map(t => t.code));

/** Map from alpha-2 code → Territory for O(1) lookup */
export const TERRITORY_BY_CODE = new Map(TERRITORIES.map(t => [t.code, t]));
