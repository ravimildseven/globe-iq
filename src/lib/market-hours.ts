export interface ExchangeStatus {
  id: string;
  name: string;
  shortName: string;
  status: "open" | "pre" | "post" | "closed";
  note?: string; // e.g. "Closes in 1h 30m", "Opens in 45m", "Opens Mon in 2h"
}

interface ExchangeConfig {
  id: string;
  name: string;
  shortName: string;
  timezone: string;
  openHour: number;
  openMinute: number;
  closeHour: number;
  closeMinute: number;
}

const EXCHANGES: ExchangeConfig[] = [
  {
    id: "nyse",
    name: "NYSE / NASDAQ",
    shortName: "NYSE",
    timezone: "America/New_York",
    openHour: 9,
    openMinute: 30,
    closeHour: 16,
    closeMinute: 0,
  },
  {
    id: "lse",
    name: "London Stock Exchange",
    shortName: "LSE",
    timezone: "Europe/London",
    openHour: 8,
    openMinute: 0,
    closeHour: 16,
    closeMinute: 30,
  },
  {
    id: "tse",
    name: "Tokyo Stock Exchange",
    shortName: "TSE",
    timezone: "Asia/Tokyo",
    openHour: 9,
    openMinute: 0,
    closeHour: 15,
    closeMinute: 30,
  },
  {
    id: "sse",
    name: "Shanghai Stock Exchange",
    shortName: "SSE",
    timezone: "Asia/Shanghai",
    openHour: 9,
    openMinute: 30,
    closeHour: 15,
    closeMinute: 0,
  },
  {
    id: "bse",
    name: "BSE Mumbai",
    shortName: "BSE",
    timezone: "Asia/Kolkata",
    openHour: 9,
    openMinute: 15,
    closeHour: 15,
    closeMinute: 30,
  },
  {
    id: "asx",
    name: "ASX Sydney",
    shortName: "ASX",
    timezone: "Australia/Sydney",
    openHour: 10,
    openMinute: 0,
    closeHour: 16,
    closeMinute: 0,
  },
];

function getLocalContext(timezone: string): { minuteOfDay: number; dayOfWeek: number } {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    weekday: "long",
    hour12: false,
  }).formatToParts(now);

  let hour = parseInt(parts.find(p => p.type === "hour")?.value ?? "0");
  const minute = parseInt(parts.find(p => p.type === "minute")?.value ?? "0");
  const weekday = parts.find(p => p.type === "weekday")?.value ?? "Sunday";

  // Intl may return 24 for midnight
  if (hour === 24) hour = 0;

  const dayMap: Record<string, number> = {
    Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
    Thursday: 4, Friday: 5, Saturday: 6,
  };

  return { minuteOfDay: hour * 60 + minute, dayOfWeek: dayMap[weekday] ?? 0 };
}

function fmt(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

function getExchangeStatus(cfg: ExchangeConfig): ExchangeStatus {
  const { minuteOfDay: now, dayOfWeek: day } = getLocalContext(cfg.timezone);
  const open = cfg.openHour * 60 + cfg.openMinute;
  const close = cfg.closeHour * 60 + cfg.closeMinute;

  const base = { id: cfg.id, name: cfg.name, shortName: cfg.shortName };

  // Weekend — show time until Monday open
  if (day === 0 || day === 6) {
    const daysToMon = day === 6 ? 2 : 1;
    const minsUntilOpen = daysToMon * 1440 - now + open;
    return { ...base, status: "closed", note: `Opens Mon in ${fmt(minsUntilOpen)}` };
  }

  // Within trading hours
  if (now >= open && now < close) {
    return { ...base, status: "open", note: `Closes in ${fmt(close - now)}` };
  }

  // Pre-market (30 min before open)
  if (now >= open - 30 && now < open) {
    return { ...base, status: "pre", note: `Opens in ${fmt(open - now)}` };
  }

  // Post-market (30 min after close)
  if (now >= close && now < close + 30) {
    return { ...base, status: "post", note: `Closed ${fmt(now - close)}m ago` };
  }

  // Closed — calculate time until next open
  let minsUntilOpen: number;
  if (now < open) {
    // Before pre-market window
    minsUntilOpen = open - now;
    return { ...base, status: "closed", note: `Opens in ${fmt(minsUntilOpen)}` };
  } else {
    // After post-market — opens next business day
    const isFriday = day === 5;
    const daysAhead = isFriday ? 3 : 1;
    minsUntilOpen = daysAhead * 1440 - now + open;
    const label = isFriday ? "Opens Mon" : "Opens tomorrow";
    return { ...base, status: "closed", note: `${label} in ${fmt(minsUntilOpen)}` };
  }
}

export function getExchangeStatuses(): ExchangeStatus[] {
  return EXCHANGES.map(getExchangeStatus);
}

export function openMarketCount(): number {
  return getExchangeStatuses().filter(s => s.status === "open").length;
}
