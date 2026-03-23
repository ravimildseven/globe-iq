"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { countryCentroids } from "@/lib/countries-geo";

// ─── Supported home countries (those with enough travel data) ─────────────────
// We have visa + flight data for these origins:
export const SUPPORTED_HOME_COUNTRIES = [
  "IN", "US", "GB", "AU", "CA", "DE", "FR", "JP", "SG", "AE",
] as const;

export type HomeCountryCode = (typeof SUPPORTED_HOME_COUNTRIES)[number];

const STORAGE_KEY = "globe-iq:homeCountry";
const DEFAULT_HOME: HomeCountryCode = "IN";

// ─── Context ─────────────────────────────────────────────────────────────────

interface HomeCountryContextValue {
  homeCountry: HomeCountryCode;
  setHomeCountry: (code: HomeCountryCode) => void;
}

const HomeCountryContext = createContext<HomeCountryContextValue>({
  homeCountry: DEFAULT_HOME,
  setHomeCountry: () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function HomeCountryProvider({ children }: { children: ReactNode }) {
  const [homeCountry, setHomeCountryState] = useState<HomeCountryCode>(DEFAULT_HOME);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as HomeCountryCode | null;
      if (stored && SUPPORTED_HOME_COUNTRIES.includes(stored)) {
        setHomeCountryState(stored);
      }
    } catch {}
  }, []);

  const setHomeCountry = (code: HomeCountryCode) => {
    setHomeCountryState(code);
    try { localStorage.setItem(STORAGE_KEY, code); } catch {}
  };

  return (
    <HomeCountryContext.Provider value={{ homeCountry, setHomeCountry }}>
      {children}
    </HomeCountryContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useHomeCountry() {
  return useContext(HomeCountryContext);
}

// ─── Metadata for supported countries ─────────────────────────────────────────

export const HOME_COUNTRY_LABELS: Record<HomeCountryCode, { label: string; flag: string }> = {
  IN: { label: "India",          flag: "🇮🇳" },
  US: { label: "United States",  flag: "🇺🇸" },
  GB: { label: "United Kingdom", flag: "🇬🇧" },
  AU: { label: "Australia",      flag: "🇦🇺" },
  CA: { label: "Canada",         flag: "🇨🇦" },
  DE: { label: "Germany",        flag: "🇩🇪" },
  FR: { label: "France",         flag: "🇫🇷" },
  JP: { label: "Japan",          flag: "🇯🇵" },
  SG: { label: "Singapore",      flag: "🇸🇬" },
  AE: { label: "UAE",            flag: "🇦🇪" },
};
