"use client";

import { ConflictData } from "@/lib/types";
import { Shield, AlertTriangle, Flame, CheckCircle2 } from "lucide-react";

const statusConfig = {
  active:    { color: "text-accent-red",   bg: "bg-accent-red/10",   border: "border-accent-red/25",   label: "Active",    dot: "bg-accent-red",   pulse: true },
  ceasefire: { color: "text-accent-amber", bg: "bg-accent-amber/10", border: "border-accent-amber/25", label: "Ceasefire", dot: "bg-accent-amber", pulse: false },
  frozen:    { color: "text-accent-blue",  bg: "bg-accent-blue/10",  border: "border-accent-blue/25",  label: "Frozen",    dot: "bg-accent-blue",  pulse: false },
};

const typeConfig = {
  "war":            { icon: <Flame size={15} />,         label: "War" },
  "civil-conflict": { icon: <AlertTriangle size={15} />, label: "Civil Conflict" },
  "tension":        { icon: <Shield size={15} />,        label: "Tension" },
  "disputed":       { icon: <Shield size={15} />,        label: "Disputed Territory" },
};

export default function ConflictsTab({ conflicts, countryName }: {
  conflicts: ConflictData[];
  countryName: string;
}) {
  if (conflicts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-accent-green/8 border border-accent-green/20 flex items-center justify-center">
          <CheckCircle2 size={24} className="text-accent-green" />
        </div>
        <div>
          <p className="text-sm font-medium text-text-secondary">No active conflicts</p>
          <p className="text-xs text-text-muted mt-1">{countryName} has no tracked conflicts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {conflicts.map((conflict, i) => {
        const status = statusConfig[conflict.status];
        const type   = typeConfig[conflict.type];

        return (
          <div
            key={i}
            className={`bg-bg-card border ${status.border} rounded-xl p-4 card-glow`}
          >
            {/* Header row */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={status.color}>{type.icon}</span>
                <h3 className="text-sm font-semibold text-text-primary leading-snug">
                  {conflict.name}
                </h3>
              </div>

              {/* Status badge */}
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${status.bg} ${status.color} flex-shrink-0 ml-2`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot} ${status.pulse ? "pulse-dot" : ""} relative`} />
                {status.label}
              </div>
            </div>

            {/* Type + Year */}
            <p className="text-[11px] text-text-muted mb-2">
              {type.label} · Since {conflict.startYear}
            </p>

            {/* Description */}
            <p className="text-xs text-text-secondary leading-relaxed mb-3">
              {conflict.description}
            </p>

            {/* Parties */}
            {conflict.parties.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {conflict.parties.map(party => (
                  <span
                    key={party}
                    className="px-2 py-0.5 text-[10px] rounded-full bg-bg-elevated text-text-muted border border-border-subtle"
                  >
                    {party}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
