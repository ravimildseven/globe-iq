export interface CountryInfo {
  name: string;
  code: string;
  capital: string;
  region: string;
  subregion: string;
  population: number;
  area: number;
  flag: string;
  flagUrl: string;
  currencies: { name: string; symbol: string }[];
  languages: string[];
  lat: number;
  lng: number;
}

export interface NewsArticle {
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  url: string;
}

export interface ConflictData {
  name: string;
  type: "war" | "civil-conflict" | "tension" | "disputed";
  status: "active" | "ceasefire" | "frozen";
  description: string;
  parties: string[];
  startYear: number;
}

export interface EconomyData {
  gdp: string;
  gdpPerCapita: string;
  currency: string;
  inflation: string;
  unemployment: string;
  mainExports: string[];
  stockIndex?: string;
  stockValue?: string;
  stockChange?: string;
}

export type TabId = "general" | "news" | "economy" | "conflicts";
