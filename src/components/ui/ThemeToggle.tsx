"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

const THEMES = ["system", "dark", "light"] as const;
type Theme = (typeof THEMES)[number];

const ICONS: Record<Theme, React.ReactNode> = {
  system: <Monitor size={13} />,
  dark:   <Moon    size={13} />,
  light:  <Sun     size={13} />,
};

const LABELS: Record<Theme, string> = {
  system: "System",
  dark:   "Dark",
  light:  "Light",
};

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent SSR flash — only render after mount
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-full glass border border-white/8" />
    );
  }

  const current = (THEMES.includes(theme as Theme) ? theme : "system") as Theme;
  const next    = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];

  return (
    <button
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${LABELS[next]} theme`}
      title={`${LABELS[current]} theme — click for ${LABELS[next]}`}
      className="flex items-center gap-1.5 glass rounded-full px-2.5 py-1.5 min-h-[44px]
                 text-text-muted hover:text-text-primary transition-all duration-200
                 hover:border-accent-amber/30
                 hover:shadow-[0_0_12px_rgba(245,158,11,0.15)]"
    >
      <span className="text-accent-amber/80 transition-colors">
        {ICONS[current]}
      </span>
      <span className="text-[10px] font-medium tracking-wide hidden sm:block">
        {LABELS[current]}
      </span>
    </button>
  );
}
