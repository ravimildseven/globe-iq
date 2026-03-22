"use client";

import { useState } from "react";
import { Layers, TrendingUp, Swords, Users, Clock, Moon, X } from "lucide-react";

export type LayerId = "market" | "conflicts" | "population" | "timezones" | "nightlights";

interface LayerConfig {
  id: LayerId;
  label: string;
  icon: React.ReactNode;
  description: string;
  legend: React.ReactNode;
}

const MARKET_LEGEND = (
  <div className="flex items-center gap-1 mt-1.5 flex-wrap">
    {[
      { color: "#166534", label: "> +3%" },
      { color: "#16A34A", label: "+1%" },
      { color: "#64748B", label: "0%" },
      { color: "#DC2626", label: "−1%" },
      { color: "#7F1D1D", label: "< −3%" },
    ].map(s => (
      <span key={s.label} className="flex items-center gap-0.5">
        <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: s.color }} />
        <span className="text-[9px] text-text-muted">{s.label}</span>
      </span>
    ))}
  </div>
);

const CONFLICT_LEGEND = (
  <div className="flex items-center gap-1 mt-1.5 flex-wrap">
    {[
      { color: "#EF4444", label: "Active War" },
      { color: "#F97316", label: "Conflict" },
      { color: "#EAB308", label: "Ceasefire" },
      { color: "#94A3B8", label: "Frozen" },
    ].map(s => (
      <span key={s.label} className="flex items-center gap-0.5">
        <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: s.color }} />
        <span className="text-[9px] text-text-muted">{s.label}</span>
      </span>
    ))}
  </div>
);

const POPULATION_LEGEND = (
  <div className="mt-1.5">
    <div className="flex gap-0 rounded-sm overflow-hidden h-2" style={{ width: 140 }}>
      {["#3B82F6","#22D3EE","#16A34A","#CA8A04","#EA580C","#B91C1C","#7F1D1D"].map((c, i) => (
        <div key={i} className="flex-1" style={{ background: c }} />
      ))}
    </div>
    <div className="flex justify-between mt-0.5">
      <span className="text-[9px] text-text-muted">Sparse</span>
      <span className="text-[9px] text-text-muted">Dense</span>
    </div>
  </div>
);

const TIMEZONE_LEGEND = (
  <div className="mt-1.5">
    <div className="flex gap-0 rounded-sm overflow-hidden h-2" style={{ width: 140 }}>
      {[
        "#3B82F6","#6366F1","#8B5CF6","#A855F7","#C026D3","#DB2777",
        "#E11D48","#EF4444","#F97316","#EAB308","#22C55E","#10B981",
        "#14B8A6","#06B6D4","#0EA5E9",
      ].map((c, i) => (
        <div key={i} className="flex-1" style={{ background: c }} />
      ))}
    </div>
    <div className="flex justify-between mt-0.5">
      <span className="text-[9px] text-text-muted">UTC−12</span>
      <span className="text-[9px] text-text-muted">UTC+14</span>
    </div>
  </div>
);

const NIGHT_LEGEND = (
  <p className="text-[9px] text-text-muted mt-1">City lights amplified on night side</p>
);

const LAYERS: LayerConfig[] = [
  { id: "market",      label: "Stock Markets",      icon: <TrendingUp size={13} />, description: "Live index heat map",   legend: MARKET_LEGEND },
  { id: "conflicts",   label: "Conflict Zones",     icon: <Swords     size={13} />, description: "Active wars & tensions", legend: CONFLICT_LEGEND },
  { id: "population",  label: "Population Density", icon: <Users      size={13} />, description: "Persons per km²",       legend: POPULATION_LEGEND },
  { id: "timezones",   label: "Time Zones",         icon: <Clock      size={13} />, description: "UTC offset bands",      legend: TIMEZONE_LEGEND },
  { id: "nightlights", label: "Night Lights",       icon: <Moon       size={13} />, description: "City glow amplified",   legend: NIGHT_LEGEND },
];

interface LayersPanelProps {
  activeLayer: LayerId | null;
  onLayerChange: (id: LayerId | null) => void;
}

export default function LayersPanel({ activeLayer, onLayerChange }: LayersPanelProps) {
  const [open, setOpen] = useState(false);

  const handleToggle = (id: LayerId) => {
    onLayerChange(activeLayer === id ? null : id);
  };

  return (
    <div className="relative">
      {/* Layers button */}
      <button
        onClick={() => setOpen(v => !v)}
        title="Map Layers"
        aria-label="Toggle map layers"
        className={`zoom-btn w-9 h-9 glass rounded-xl glow-amber flex items-center justify-center transition-colors
          ${open ? "text-accent-amber" : "text-text-muted hover:text-accent-amber"}`}
      >
        <Layers size={15} />
      </button>

      {/* Panel — opens above the button */}
      {open && (
        <div className="absolute bottom-[44px] left-0 z-50 w-[220px] glass rounded-xl
                        border border-border shadow-[0_8px_40px_rgba(0,0,0,0.45)]
                        overflow-hidden hint-pop">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-border-subtle">
            <div className="flex items-center gap-1.5">
              <Layers size={12} className="text-accent-amber" />
              <span className="text-[11px] font-semibold text-text-primary tracking-wide">Map Layers</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-5 h-5 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
            >
              <X size={11} />
            </button>
          </div>

          {/* Layer rows */}
          <div className="p-2 flex flex-col gap-0.5">
            {LAYERS.map(layer => {
              const isActive = activeLayer === layer.id;
              return (
                <button
                  key={layer.id}
                  onClick={() => handleToggle(layer.id)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg transition-colors
                    ${isActive
                      ? "bg-accent-amber/10 border border-accent-amber/30"
                      : "hover:bg-bg-hover border border-transparent"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={isActive ? "text-accent-amber" : "text-text-muted"}>
                        {layer.icon}
                      </span>
                      <div>
                        <p className={`text-[11px] font-medium leading-tight
                          ${isActive ? "text-text-primary" : "text-text-secondary"}`}>
                          {layer.label}
                        </p>
                        <p className="text-[9px] text-text-muted leading-tight mt-0.5">
                          {layer.description}
                        </p>
                      </div>
                    </div>
                    {/* Toggle pill */}
                    <div className={`w-7 h-3.5 rounded-full flex items-center transition-colors flex-shrink-0 ml-1
                      ${isActive ? "bg-accent-amber" : "bg-bg-elevated border border-border"}`}>
                      <div className={`w-2.5 h-2.5 rounded-full bg-white shadow-sm transition-transform
                        ${isActive ? "translate-x-3.5" : "translate-x-0.5"}`} />
                    </div>
                  </div>
                  {/* Inline legend when active */}
                  {isActive && layer.legend}
                </button>
              );
            })}
          </div>

          {/* Note at bottom */}
          <div className="px-3 pb-2">
            <p className="text-[9px] text-text-muted/60 text-center">One layer at a time</p>
          </div>
        </div>
      )}
    </div>
  );
}
