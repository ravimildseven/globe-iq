// Market hours logic — all times in local exchange timezone

export interface Exchange {
  id: string;
  name: string;
  timezone: string;
  openH: number;
  openM: number;
  closeH: number;
  closeM: number;
}

export const EXCHANGES: Exchange[] = [
  { id: "nyse", name: "NYSE / NASDAQ", timezone: "America/New_York", openH: 9,  openM: 30, closeH: 16, closeM: 0  },
  { id: "lse",  name: "LSE London",    timezone: "Europe/London",    openH: 8,  openM: 0,  closeH: 16, closeM: 30 },
  { id: "tse",  name: "TSE Tokyo",     timezone: "Asia/Tokyo",       openH: 9,  openM: 0,  closeH: 15, closeM: 30 },
  { id: "sse",  name: "SSE Shanghai",  timezone: "Asia/Shanghai",    openH: 9,  openM: 30, closeH: 15, closeM: 0  },
  { id: "bse",  name: "BSE Mumbai",    timezone: "Asia/Kolkata",     openH: 9,  openM: 15, closeH: 15, closeM: 30 },
  { id: "asx",  name: "ASX Sydney",    timezone: "Australia/Sydney", openH: 10, openM: 0,  closeH: 16, closeM: 0  },
];

export type MarketStatus = "open" | "pre" | "post" | "closed";

export interface ExchangeStatus {
  id: string;
  name: string;
  status: MarketStatus;
  nextLabel: string;
}

const PRE_MINS  = 30;
const POST_MINS = 30;

function getZoneTime(timezone: string): { totalMins: number; dayOfWeek: number } {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "numeric",
    weekday: "short",
    hour12: false,
  }).formatToParts(now);

  let hour = parseInt(parts.find(p => p.type === "hour")?.value ?? "0");
  const min = parseInt(parts.find(p => p.type === "minute")?.value ?? "0");
  if (hour === 24) hour = 0; // midnight edge case in some locales
  const wd = parts.find(p => p.type === "weekday")?.value ?? "Mon";
  const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(wd);
  return { totalMins: hour * 60 + min, dayOfWeek };
}

function fmt(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h > 0 && r > 0) return `${h}h ${r}m`;
  if (h > 0) return `${h}h`;
  return `${r}m`;
}

export function getExchangeStatuses(): ExchangeStatus[] {
  return EXCHANGES.map(ex => {
    const { totalMins, dayOfWeek } = getZoneTime(ex.timezone);
    const openMins  = ex.openH  * 60 + ex.openM;
    const closeMins = ex.closeH * 60 + ex.closeM;
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isFriday  = dayOfWeek === 5;

    let status: MarketStatus;
    let nextLabel: string;

    if (isWeekend) {
      status = "closed";
      const daysUntilMon = dayOfWeek === 6 ? 2 : 1;
      const mins = daysUntilMon * 1440 - totalMins + openMins;
      nextLabel = `Opens Mon in ${fmt(mins)}`;
    } else if (totalMins >= closeMins + POST_MINS) {
      status = "closed";
      if (isFriday) {
        const mins = 3 * 1440 - totalMins + openMins;
        nextLabel = `Opens Mon in ${fmt(mins)}`;
      } else {
        const mins = 1440 - totalMins + openMins;
        nextLabel = `Opens in ${fmt(mins)}`;
      }
    } else if (totalMins >= closeMins) {
      status = "post";
      nextLabel = `Post-market · ${fmt(closeMins + POST_MINS - totalMins)} left`;
    } else if (totalMins >= openMins) {
      status = "open";
      nextLabel = `Closes in ${fmt(closeMins - totalMins)}`;
    } else if (totalMins >= openMins - PRE_MINS) {
      status = "pre";
      nextLabel = `Opens in ${fmt(openMins - totalMins)}`;
    } else {
      status = "closed";
      nextLabel = `Opens in ${fmt(openMins - totalMins)}`;
    }

    return { id: ex.id, name: ex.name, status, nextLabel };
  });
}

export function openMarketCount(statuses: ExchangeStatus[]): number {
  return statuses.filter(s => s.status === "open").length;
}
