"use client";

import { useState, useEffect } from "react";
import { X, ExternalLink, Globe2, Code2, Database, Layers } from "lucide-react";

const TECH = [
  { label: "Next.js 15",          category: "framework" },
  { label: "React Three Fiber",   category: "framework" },
  { label: "Three.js",            category: "framework" },
  { label: "TypeScript",          category: "language"  },
  { label: "Tailwind CSS",        category: "style"     },
  { label: "Vercel",              category: "infra"     },
];

const DATA = [
  { label: "NASA Blue Marble",    note: "Globe texture"       },
  { label: "Natural Earth",       note: "Country boundaries"  },
  { label: "World Bank API",      note: "Economy data"        },
  { label: "Google News RSS",     note: "Live news"           },
  { label: "REST Countries",      note: "Country metadata"    },
  { label: "World Atlas 50m",     note: "GeoJSON polygons"    },
];

const CATEGORY_COLOR: Record<string, string> = {
  framework: "rgba(99,102,241,0.15)",
  language:  "rgba(245,158,11,0.12)",
  style:     "rgba(20,184,166,0.12)",
  infra:     "rgba(59,130,246,0.12)",
};
const CATEGORY_BORDER: Record<string, string> = {
  framework: "rgba(99,102,241,0.35)",
  language:  "rgba(245,158,11,0.35)",
  style:     "rgba(20,184,166,0.30)",
  infra:     "rgba(59,130,246,0.30)",
};

export default function AboutPanel() {
  const [open, setOpen] = useState(false);

  // Escape to close
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  return (
    <>
      {/* ── Trigger: small ⓘ button ───────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(true)}
        aria-label="About GlobeIQ"
        className="w-7 h-7 rounded-full glass border border-white/8
                   flex items-center justify-center
                   text-text-muted/50 hover:text-accent-amber
                   hover:border-accent-amber/30
                   hover:shadow-[0_0_10px_rgba(245,158,11,0.12)]
                   transition-all duration-200 text-[11px] font-semibold"
      >
        ⓘ
      </button>

      {/* ── Modal ─────────────────────────────────────────────────────────────── */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[3px]"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div
            className="fixed bottom-16 right-5 z-[70] w-[340px] max-w-[calc(100vw-24px)]
                       animate-in fade-in slide-in-from-bottom-2 duration-200"
            role="dialog"
            aria-modal="true"
            aria-label="About GlobeIQ"
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "rgba(4,10,24,0.97)",
                backdropFilter: "blur(28px)",
                WebkitBackdropFilter: "blur(28px)",
                border: "1px solid rgba(180,210,255,0.11)",
                boxShadow: "0 24px 60px rgba(0,0,0,0.65), 0 0 0 1px rgba(245,158,11,0.05)",
              }}
            >

              {/* Header */}
              <div className="flex items-start justify-between px-5 pt-5 pb-4"
                style={{ borderBottom: "1px solid rgba(180,210,255,0.07)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl glass glow-amber flex items-center justify-center flex-shrink-0">
                    <Globe2 size={17} className="text-accent-amber" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary tracking-tight leading-tight">
                      Globe<span className="text-accent-amber">IQ</span>
                    </p>
                    <p className="text-[10px] text-text-muted/60 tracking-widest uppercase mt-0.5">
                      World Intelligence
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="text-text-muted/40 hover:text-text-muted transition-colors mt-0.5"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Built by */}
              <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(180,210,255,0.07)" }}>
                <p className="text-[10px] text-text-muted/50 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                  <Code2 size={10} className="text-accent-amber/60" />
                  Built by
                </p>
                <a
                  href="https://ravimildseven.github.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2"
                >
                  <span className="text-sm font-semibold text-text-primary group-hover:text-accent-amber transition-colors">
                    Ravikiran Shenoy
                  </span>
                  <ExternalLink
                    size={11}
                    className="text-text-muted/40 group-hover:text-accent-amber/70 transition-colors"
                  />
                </a>
              </div>

              {/* Tech stack */}
              <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(180,210,255,0.07)" }}>
                <p className="text-[10px] text-text-muted/50 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Layers size={10} className="text-accent-amber/60" />
                  Tech Stack
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {TECH.map(t => (
                    <span
                      key={t.label}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                      style={{
                        background: CATEGORY_COLOR[t.category],
                        border: `1px solid ${CATEGORY_BORDER[t.category]}`,
                        color: "rgba(200,220,255,0.80)",
                      }}
                    >
                      {t.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Data sources */}
              <div className="px-5 py-4">
                <p className="text-[10px] text-text-muted/50 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Database size={10} className="text-accent-amber/60" />
                  Data Sources
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {DATA.map(d => (
                    <div key={d.label} className="flex flex-col">
                      <span className="text-[11px] font-medium text-text-primary/80">{d.label}</span>
                      <span className="text-[9px] text-text-muted/45 leading-tight">{d.note}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div
                className="px-5 py-2.5 flex items-center justify-between"
                style={{ borderTop: "1px solid rgba(180,210,255,0.06)" }}
              >
                <span className="text-[9px] text-text-muted/30 tracking-wide">
                  Open source · MIT license
                </span>
                <span className="text-[9px] text-text-muted/30">
                  2025
                </span>
              </div>

            </div>
          </div>
        </>
      )}
    </>
  );
}
