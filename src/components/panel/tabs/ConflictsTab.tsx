"use client";

import { ConflictData } from "@/lib/types";
import { Shield, AlertTriangle, Flame } from "lucide-react";

const statusConfig = {
  active: { color: "text-accent-red", bg: "bg-accent-red/15", label: "Active", dotColor: "bg-accent-red" },
  ceasefire: { color: "text-accent-amber", bg: "bg-accent-amber/15", label: "Ceasefire", dotColor: "bg-accent-amber" },
  frozen: { color: "text-accent-blue", bg: "bg-accent-blue/15", label: "Frozen", dotColor: "bg-accent-blue" },
};

const typeConfig = {
  war: { icon: <Flame size={16} />, label: "War" },
  "civil-conflict": { icon: <AlertTriangle size={16} />, label: "Civil Conflict" },
  tension: { icon: <Shield size={16} />, label: "Tension" },
  disputed: { icon: <Shield size={16} />, label: "Disputed Territory" },
};

export default function ConflictsTab({
  conflicts,
  countryName,
}: {
  conflicts: ConflictData[];
  countryName: string;
}) {
  if (conflicts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-accent-green/10 flex items-center justify-center mb-3">
          <Shield size={24} className="text-accent-green" />
        </div>
        <p className="text-text-secondary text-sm font-medium">No active conflicts</p>
        <p className="text-xs text-text-muted mt-1">{countryName} has no tracked conflicts</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {conflicts.map((conflict, i) => {
        const status = statusConfig[conflict.status];
        const type = typeConfig[conflict.type];

        return (
          <div
            key={i}
            className="bg-bg-card border border-border-subtle rounded-xl p-4 card-glow"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={status.color}>{type.icon}</span>
                <h3 className="text-sm font-semibold text-text-primary">{conflict.name}</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`relative w-2 h-2 rounded-full ${status.dotColor} ${conflict.status === "active" ? "pulse-dot" : ""}`} />
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${status.bg} ${status.color}`}>
                  {status.label}
                </span>
              </div>
            </div>

            {/* Type & Year */}
            <div className="flex items-center gap-3 mb-2 text-xs text-text-muted">
              <span>{type.label}</span>
              <span>·</span>
              <span>Since {conflict.startYear}</span>
            </div>

            {/* Description */}
            <p className="text-xs text-text-secondary leading-relaxed mb-3">
              {conflict.description}
            </p>

            {/* Parties */}
            <div className="flex flex-wrap gap-1.5">
              {conflict.parties.map((party) => (
                <span
                  key={party}
                  className="px-2 py-0.5 text-[11px] rounded-full bg-bg-elevated text-text-muted border border-border-subtle"
                >
                  {party}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
