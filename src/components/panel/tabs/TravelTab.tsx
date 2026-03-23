"use client";

import {
  visaForIndian,
  bestTime,
  currencyTip,
  knownFor,
  DEFAULT_VISA,
  DEFAULT_BEST_TIME,
  DEFAULT_CURRENCY_TIP,
  DEFAULT_KNOWN_FOR,
  type VisaStatus,
} from "@/lib/travelData";

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
  const code    = countryCode.toUpperCase();
  const visa    = visaForIndian[code]  ?? DEFAULT_VISA;
  const time    = bestTime[code]       ?? DEFAULT_BEST_TIME;
  const tipText = currencyTip[code]    ?? DEFAULT_CURRENCY_TIP;
  const items   = knownFor[code]       ?? DEFAULT_KNOWN_FOR;

  return (
    <div className="space-y-4">

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
          <EssentialCard icon="🛂" label="Visa · Indian passport">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${visaClass(visa)}`}>
              {visaLabel(visa)}
            </span>
          </EssentialCard>

          {/* Best Time */}
          <EssentialCard icon="🗓" label="Best Time to Visit">
            <span className="text-xs font-medium text-text-primary">{time}</span>
          </EssentialCard>

          {/* Currency Tip */}
          <EssentialCard icon="💳" label="Currency Tip">
            <span className="text-xs text-text-secondary leading-snug">{tipText}</span>
          </EssentialCard>
        </div>
      </div>

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
