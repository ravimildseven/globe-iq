import { EconomyData } from "./types";

// Curated economy data for major countries — can be replaced with live API
export const economyDatabase: Record<string, Partial<EconomyData> & Pick<EconomyData, "currency" | "mainExports">> = {
  // ── Existing full entries ──────────────────────────────────────────────────
  US: {
    gdp: "$25.5T",
    gdpPerCapita: "$76,330",
    currency: "USD ($)",
    inflation: "3.2%",
    unemployment: "3.7%",
    mainExports: ["Refined Petroleum", "Aircraft", "Medical Instruments", "Integrated Circuits"],
    stockIndex: "S&P 500",
    stockValue: "5,234",
    stockChange: "+1.2%",
  },
  CN: {
    gdp: "$17.9T",
    gdpPerCapita: "$12,720",
    currency: "CNY (¥)",
    inflation: "0.2%",
    unemployment: "5.2%",
    mainExports: ["Electronics", "Machinery", "Textiles", "Furniture"],
    stockIndex: "Shanghai Composite",
    stockValue: "3,088",
    stockChange: "-0.4%",
  },
  JP: {
    gdp: "$4.2T",
    gdpPerCapita: "$33,950",
    currency: "JPY (¥)",
    inflation: "2.8%",
    unemployment: "2.5%",
    mainExports: ["Vehicles", "Machinery", "Electronics", "Steel"],
    stockIndex: "Nikkei 225",
    stockValue: "39,740",
    stockChange: "+0.8%",
  },
  DE: {
    gdp: "$4.1T",
    gdpPerCapita: "$48,718",
    currency: "EUR (€)",
    inflation: "2.9%",
    unemployment: "5.7%",
    mainExports: ["Vehicles", "Machinery", "Chemical Products", "Electronics"],
    stockIndex: "DAX",
    stockValue: "18,200",
    stockChange: "+0.5%",
  },
  GB: {
    gdp: "$3.1T",
    gdpPerCapita: "$46,125",
    currency: "GBP (£)",
    inflation: "4.0%",
    unemployment: "4.2%",
    mainExports: ["Machinery", "Vehicles", "Pharmaceuticals", "Oil"],
    stockIndex: "FTSE 100",
    stockValue: "7,930",
    stockChange: "+0.3%",
  },
  IN: {
    gdp: "$3.7T",
    gdpPerCapita: "$2,612",
    currency: "INR (₹)",
    inflation: "5.1%",
    unemployment: "7.8%",
    mainExports: ["Refined Petroleum", "Diamonds", "Pharmaceuticals", "IT Services"],
    stockIndex: "SENSEX",
    stockValue: "73,500",
    stockChange: "+0.6%",
  },
  FR: {
    gdp: "$2.8T",
    gdpPerCapita: "$42,330",
    currency: "EUR (€)",
    inflation: "2.3%",
    unemployment: "7.4%",
    mainExports: ["Aircraft", "Vehicles", "Pharmaceuticals", "Wine"],
    stockIndex: "CAC 40",
    stockValue: "8,150",
    stockChange: "+0.4%",
  },
  BR: {
    gdp: "$2.1T",
    gdpPerCapita: "$9,673",
    currency: "BRL (R$)",
    inflation: "4.5%",
    unemployment: "7.6%",
    mainExports: ["Soybeans", "Iron Ore", "Crude Petroleum", "Sugar"],
    stockIndex: "IBOVESPA",
    stockValue: "128,400",
    stockChange: "-0.2%",
  },
  RU: {
    gdp: "$1.9T",
    gdpPerCapita: "$12,580",
    currency: "RUB (₽)",
    inflation: "7.4%",
    unemployment: "2.9%",
    mainExports: ["Crude Petroleum", "Natural Gas", "Metals", "Wheat"],
    stockIndex: "MOEX",
    stockValue: "3,280",
    stockChange: "-1.1%",
  },
  AU: {
    gdp: "$1.7T",
    gdpPerCapita: "$65,100",
    currency: "AUD (A$)",
    inflation: "3.4%",
    unemployment: "3.9%",
    mainExports: ["Iron Ore", "Coal", "Natural Gas", "Gold"],
    stockIndex: "ASX 200",
    stockValue: "7,840",
    stockChange: "+0.3%",
  },
  KR: {
    gdp: "$1.7T",
    gdpPerCapita: "$32,423",
    currency: "KRW (₩)",
    inflation: "3.6%",
    unemployment: "2.7%",
    mainExports: ["Semiconductors", "Vehicles", "Ships", "Displays"],
    stockIndex: "KOSPI",
    stockValue: "2,680",
    stockChange: "+0.7%",
  },
  SA: {
    gdp: "$1.1T",
    gdpPerCapita: "$30,436",
    currency: "SAR (﷼)",
    inflation: "1.6%",
    unemployment: "4.8%",
    mainExports: ["Crude Petroleum", "Refined Petroleum", "Polymers"],
    stockIndex: "Tadawul",
    stockValue: "12,150",
    stockChange: "+0.1%",
  },
  NG: {
    gdp: "$477B",
    gdpPerCapita: "$2,184",
    currency: "NGN (₦)",
    inflation: "28.9%",
    unemployment: "33.3%",
    mainExports: ["Crude Petroleum", "Natural Gas", "Cocoa"],
  },
  EG: {
    gdp: "$387B",
    gdpPerCapita: "$3,699",
    currency: "EGP (E£)",
    inflation: "35.7%",
    unemployment: "7.1%",
    mainExports: ["Petroleum Gas", "Crude Petroleum", "Fertilizers", "Textiles"],
  },
  IL: {
    gdp: "$525B",
    gdpPerCapita: "$55,535",
    currency: "ILS (₪)",
    inflation: "2.5%",
    unemployment: "3.4%",
    mainExports: ["Diamonds", "Electronics", "Pharmaceuticals", "Tech"],
    stockIndex: "TA-125",
    stockValue: "2,040",
    stockChange: "-0.8%",
  },
  UA: {
    gdp: "$160B",
    gdpPerCapita: "$4,530",
    currency: "UAH (₴)",
    inflation: "5.8%",
    unemployment: "18.0%",
    mainExports: ["Grain", "Iron", "Sunflower Oil", "Steel"],
  },

  // ── Europe ────────────────────────────────────────────────────────────────
  IT: {
    currency: "EUR (€)",
    mainExports: ["Machinery", "Vehicles", "Pharmaceuticals", "Food"],
    stockIndex: "FTSE MIB",
    stockValue: "33,500",
    stockChange: "+0.4%",
  },
  ES: {
    currency: "EUR (€)",
    mainExports: ["Vehicles", "Machinery", "Pharmaceuticals", "Food"],
    stockIndex: "IBEX 35",
    stockValue: "10,800",
    stockChange: "+0.3%",
  },
  CA: {
    currency: "CAD (C$)",
    mainExports: ["Crude Oil", "Gold", "Vehicles", "Lumber"],
    stockIndex: "S&P/TSX",
    stockValue: "21,400",
    stockChange: "+0.2%",
  },
  NL: {
    currency: "EUR (€)",
    mainExports: ["Refined Petroleum", "Machinery", "Chemicals", "Electronics"],
  },
  SE: {
    currency: "SEK (kr)",
    mainExports: ["Vehicles", "Machinery", "Pharmaceuticals", "Paper"],
  },
  NO: {
    currency: "NOK (kr)",
    mainExports: ["Crude Petroleum", "Natural Gas", "Fish", "Metals"],
  },
  CH: {
    currency: "CHF (Fr)",
    mainExports: ["Pharmaceuticals", "Machinery", "Watches", "Chemicals"],
  },
  PL: {
    currency: "PLN (zł)",
    mainExports: ["Machinery", "Vehicles", "Furniture", "Electronics"],
  },
  DK: {
    currency: "DKK (kr)",
    mainExports: ["Pharmaceuticals", "Machinery", "Fish", "Wind Turbines"],
  },
  IE: {
    currency: "EUR (€)",
    mainExports: ["Pharmaceuticals", "Medical Devices", "Technology", "Food"],
  },
  PT: {
    currency: "EUR (€)",
    mainExports: ["Vehicles", "Machinery", "Cork", "Wine"],
  },
  GR: {
    currency: "EUR (€)",
    mainExports: ["Refined Petroleum", "Aluminium", "Pharmaceuticals", "Food"],
  },
  HU: {
    currency: "HUF (Ft)",
    mainExports: ["Vehicles", "Machinery", "Electronics", "Pharmaceuticals"],
  },
  CZ: {
    currency: "CZK (Kč)",
    mainExports: ["Vehicles", "Machinery", "Electronics", "Steel"],
  },
  RO: {
    currency: "RON (lei)",
    mainExports: ["Vehicles", "Machinery", "Electronics", "Cereals"],
  },
  HR: {
    currency: "EUR (€)",
    mainExports: ["Vehicles", "Machinery", "Pharmaceuticals", "Food"],
  },
  RS: {
    currency: "RSD (din)",
    mainExports: ["Vehicles", "Machinery", "Iron", "Corn"],
  },
  BG: {
    currency: "BGN (лв)",
    mainExports: ["Refined Petroleum", "Metals", "Pharmaceuticals", "Machinery"],
  },
  AL: {
    currency: "ALL (L)",
    mainExports: ["Clothing", "Footwear", "Metals", "Oil"],
  },
  BY: {
    currency: "BYR (Br)",
    mainExports: ["Petroleum Products", "Potash", "Machinery", "Food"],
  },

  // ── Asia ──────────────────────────────────────────────────────────────────
  SG: {
    currency: "SGD (S$)",
    mainExports: ["Integrated Circuits", "Refined Petroleum", "Machinery", "Pharmaceuticals"],
    stockIndex: "STI",
    stockValue: "3,210",
    stockChange: "+0.2%",
  },
  TH: {
    currency: "THB (฿)",
    mainExports: ["Machinery", "Vehicles", "Electronics", "Food"],
    stockIndex: "SET",
    stockValue: "1,380",
    stockChange: "-0.3%",
  },
  VN: {
    currency: "VND (₫)",
    mainExports: ["Electronics", "Machinery", "Footwear", "Textiles"],
  },
  MY: {
    currency: "MYR (RM)",
    mainExports: ["Electronics", "Refined Petroleum", "Palm Oil", "LNG"],
  },
  ID: {
    currency: "IDR (Rp)",
    mainExports: ["Coal", "Palm Oil", "Iron Ore", "Natural Gas"],
    stockIndex: "IDX Composite",
    stockValue: "7,100",
    stockChange: "+0.3%",
  },
  AT: {
    currency: "EUR (€)",
    mainExports: ["Machinery", "Vehicles", "Pharmaceuticals", "Electronics"],
  },
  BE: {
    currency: "EUR (€)",
    mainExports: ["Vehicles", "Pharmaceuticals", "Diamonds", "Machinery"],
  },
  FI: {
    currency: "EUR (€)",
    mainExports: ["Electronics", "Machinery", "Wood Products", "Pharmaceuticals"],
  },
  SY: {
    currency: "SYP (£)",
    mainExports: ["Crude Petroleum", "Phosphates", "Cotton", "Textiles"],
  },
  YE: {
    currency: "YER (﷼)",
    mainExports: ["Crude Petroleum", "Coffee", "Gold", "Fish"],
  },
  LA: {
    currency: "LAK (₭)",
    mainExports: ["Electricity", "Copper", "Gold", "Timber"],
  },
  TR: {
    currency: "TRY (₺)",
    mainExports: ["Vehicles", "Machinery", "Textiles", "Chemicals"],
    stockIndex: "BIST 100",
    stockValue: "9,200",
    stockChange: "+0.5%",
  },
  PK: {
    currency: "PKR (Rs)",
    mainExports: ["Textiles", "Rice", "Leather", "Sports Goods"],
  },
  BD: {
    currency: "BDT (৳)",
    mainExports: ["Garments", "Shrimp", "Leather", "Jute"],
  },
  MM: {
    currency: "MMK (K)",
    mainExports: ["Natural Gas", "Teak", "Gemstones", "Rice"],
  },
  KH: {
    currency: "KHR (៛)",
    mainExports: ["Clothing", "Footwear", "Rice", "Rubber"],
  },
  GE: {
    currency: "GEL (₾)",
    mainExports: ["Copper", "Vehicles", "Wine", "Manganese"],
  },
  AM: {
    currency: "AMD (֏)",
    mainExports: ["Copper", "Gold", "Aluminium", "Diamonds"],
  },
  AZ: {
    currency: "AZN (₼)",
    mainExports: ["Crude Petroleum", "Natural Gas", "Chemicals"],
  },
  KZ: {
    currency: "KZT (₸)",
    mainExports: ["Crude Petroleum", "Copper", "Iron", "Wheat"],
  },
  UZ: {
    currency: "UZS (soʻm)",
    mainExports: ["Gold", "Natural Gas", "Cotton", "Copper"],
  },
  IQ: {
    currency: "IQD (ع.د)",
    mainExports: ["Crude Petroleum", "Gold", "Dates"],
  },
  IR: {
    currency: "IRR (﷼)",
    mainExports: ["Crude Petroleum", "Petrochemicals", "Pistachios"],
  },
  JO: {
    currency: "JOD (JD)",
    mainExports: ["Potash", "Phosphates", "Pharmaceuticals", "Clothing"],
  },
  KW: {
    currency: "KWD (KD)",
    mainExports: ["Crude Petroleum", "Refined Petroleum", "Chemical Products"],
  },
  QA: {
    currency: "QAR (QR)",
    mainExports: ["LNG", "Crude Petroleum", "Ethylene Polymers"],
  },
  LB: {
    currency: "LBP (£)",
    mainExports: ["Jewellery", "Scrap Metal", "Electrical Equipment"],
  },
  AF: {
    currency: "AFN (؋)",
    mainExports: ["Grapes", "Opium", "Cotton", "Gemstones"],
  },

  // ── Americas ──────────────────────────────────────────────────────────────
  MX: {
    currency: "MXN ($)",
    mainExports: ["Vehicles", "Electronics", "Crude Oil", "Medical Instruments"],
    stockIndex: "IPC BMV",
    stockValue: "55,200",
    stockChange: "+0.2%",
  },
  AR: {
    currency: "ARS ($)",
    mainExports: ["Soybeans", "Corn", "Vehicles", "Wheat"],
  },
  CO: {
    currency: "COP ($)",
    mainExports: ["Crude Petroleum", "Coal", "Coffee", "Gold"],
  },
  PE: {
    currency: "PEN (S/)",
    mainExports: ["Copper", "Gold", "Zinc", "Fish"],
  },
  CL: {
    currency: "CLP ($)",
    mainExports: ["Copper", "Lithium", "Fish", "Wine"],
    stockIndex: "IPSA",
    stockValue: "6,200",
    stockChange: "+0.1%",
  },
  VE: {
    currency: "VES (Bs.)",
    mainExports: ["Crude Petroleum", "Gold", "Aluminium"],
  },
  EC: {
    currency: "USD ($)",
    mainExports: ["Petroleum", "Bananas", "Shrimp", "Cocoa"],
  },
  BO: {
    currency: "BOB (Bs)",
    mainExports: ["Natural Gas", "Zinc", "Silver", "Soybeans"],
  },
  PY: {
    currency: "PYG (Gs)",
    mainExports: ["Soybeans", "Corn", "Beef", "Electricity"],
  },
  UY: {
    currency: "UYU ($U)",
    mainExports: ["Soybeans", "Beef", "Cellulose Pulp", "Wool"],
  },
  GT: {
    currency: "GTQ (Q)",
    mainExports: ["Coffee", "Sugar", "Bananas", "Palm Oil"],
  },
  HN: {
    currency: "HNL (L)",
    mainExports: ["Coffee", "Textiles", "Bananas", "Palm Oil"],
  },
  SV: {
    currency: "USD ($)",
    mainExports: ["Textiles", "Coffee", "Sugar", "Gold"],
  },
  NI: {
    currency: "NIO (C$)",
    mainExports: ["Coffee", "Beef", "Gold", "Sugar"],
  },
  PA: {
    currency: "USD ($)",
    mainExports: ["Gold", "Bananas", "Shrimp", "Sugar"],
  },
  DO: {
    currency: "DOP (RD$)",
    mainExports: ["Medical Instruments", "Gold", "Cigars", "Cocoa"],
  },
  CU: {
    currency: "CUP ($)",
    mainExports: ["Refined Petroleum", "Sugar", "Cigars", "Zinc"],
  },

  // ── Africa ────────────────────────────────────────────────────────────────
  ZA: {
    currency: "ZAR (R)",
    mainExports: ["Gold", "Platinum", "Iron", "Coal"],
    stockIndex: "JSE Top 40",
    stockValue: "71,500",
    stockChange: "+0.2%",
  },
  ET: {
    currency: "ETB (Br)",
    mainExports: ["Coffee", "Oil Seeds", "Flowers", "Vegetables"],
  },
  TZ: {
    currency: "TZS (Sh)",
    mainExports: ["Gold", "Coffee", "Cashews", "Tobacco"],
  },
  KE: {
    currency: "KES (Ksh)",
    mainExports: ["Tea", "Coffee", "Flowers", "Vegetables"],
  },
  GH: {
    currency: "GHS (GH₵)",
    mainExports: ["Gold", "Crude Petroleum", "Cocoa", "Manganese"],
  },
  SN: {
    currency: "XOF (Fr)",
    mainExports: ["Crude Petroleum", "Gold", "Phosphoric Acid", "Fish"],
  },
  CM: {
    currency: "XAF (Fr)",
    mainExports: ["Crude Petroleum", "Cocoa", "Timber", "Coffee"],
  },
  CI: {
    currency: "XOF (Fr)",
    mainExports: ["Cocoa", "Gold", "Refined Petroleum", "Cashews"],
  },
  CD: {
    currency: "CDF (Fr)",
    mainExports: ["Copper", "Cobalt", "Gold", "Coltan"],
  },
  AO: {
    currency: "AOA (Kz)",
    mainExports: ["Crude Petroleum", "Diamonds", "Gold"],
  },
  ZM: {
    currency: "ZMW (ZK)",
    mainExports: ["Copper", "Cobalt", "Tobacco", "Flowers"],
  },
  MZ: {
    currency: "MZN (MT)",
    mainExports: ["Natural Gas", "Aluminium", "Coal", "Electricity"],
  },
  ZW: {
    currency: "ZWG ($)",
    mainExports: ["Gold", "Tobacco", "Diamonds", "Lithium"],
  },
  NA: {
    currency: "NAD ($)",
    mainExports: ["Diamonds", "Copper", "Gold", "Fish"],
  },
  MA: {
    currency: "MAD (DH)",
    mainExports: ["Phosphoric Acid", "Cars", "Fertilizers", "Clothing"],
  },
  TN: {
    currency: "TND (DT)",
    mainExports: ["Refined Petroleum", "Clothing", "Phosphoric Acid", "Olive Oil"],
  },
  SD: {
    currency: "SDG (£)",
    mainExports: ["Gold", "Livestock", "Sesame Seeds", "Gum Arabic"],
  },
  LY: {
    currency: "LYD (LD)",
    mainExports: ["Crude Petroleum", "Natural Gas", "Gold"],
  },
  DZ: {
    currency: "DZD (دج)",
    mainExports: ["Crude Petroleum", "Natural Gas", "Ammonia"],
  },
  ML: {
    currency: "XOF (Fr)",
    mainExports: ["Gold", "Cotton", "Livestock"],
  },
  NE: {
    currency: "XOF (Fr)",
    mainExports: ["Gold", "Uranium", "Livestock", "Onions"],
  },
  BF: {
    currency: "XOF (Fr)",
    mainExports: ["Gold", "Cotton", "Livestock", "Zinc"],
  },
  TD: {
    currency: "XAF (Fr)",
    mainExports: ["Crude Petroleum", "Gold", "Livestock", "Cotton"],
  },
  GA: {
    currency: "XAF (Fr)",
    mainExports: ["Crude Petroleum", "Timber", "Manganese", "Gold"],
  },
  SO: {
    currency: "SOS (Sh)",
    mainExports: ["Livestock", "Charcoal", "Bananas", "Hides"],
  },
  LR: {
    currency: "LRD ($)",
    mainExports: ["Iron Ore", "Gold", "Rubber", "Timber"],
  },
  SL: {
    currency: "SLL (Le)",
    mainExports: ["Iron Ore", "Diamonds", "Cocoa", "Coffee"],
  },
  UG: {
    currency: "UGX (Sh)",
    mainExports: ["Coffee", "Gold", "Fish", "Maize"],
  },
  SS: {
    currency: "SSP (£)",
    mainExports: ["Crude Petroleum", "Gold", "Livestock"],
  },

  // ── Oceania / Other ───────────────────────────────────────────────────────
  NZ: {
    currency: "NZD ($)",
    mainExports: ["Milk Products", "Meat", "Wood", "Fruit"],
  },
  PG: {
    currency: "PGK (K)",
    mainExports: ["LNG", "Gold", "Copper", "Palm Oil"],
  },
  PH: {
    currency: "PHP (₱)",
    mainExports: ["Integrated Circuits", "Electronics", "Machinery", "Coconut Oil"],
  },
  LK: {
    currency: "LKR (Rs)",
    mainExports: ["Clothing", "Tea", "Rubber", "Gems"],
  },
  NP: {
    currency: "NPR (Rs)",
    mainExports: ["Clothing", "Carpets", "Jute", "Tea"],
  },
  TW: {
    currency: "TWD (NT$)",
    mainExports: ["Integrated Circuits", "Computers", "Electronics", "Machinery"],
    stockIndex: "TAIEX",
    stockValue: "19,800",
    stockChange: "+0.6%",
  },
  PS: {
    currency: "ILS/JOD",
    mainExports: ["Stone", "Olive Oil", "Pharmaceuticals"],
  },
  KP: {
    currency: "KPW (₩)",
    mainExports: ["Coal", "Iron", "Textiles", "Military Arms"],
  },
};
