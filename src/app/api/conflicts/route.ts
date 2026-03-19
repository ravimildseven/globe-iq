import { NextRequest, NextResponse } from "next/server";
import { conflictsDatabase } from "@/lib/conflicts-data";
import type { Article } from "@/app/api/news/route";
import type { ConflictData } from "@/lib/types";

// ─── Response type ─────────────────────────────────────────────────────────
interface ConflictsResponse {
  conflicts: ConflictData[];
  recentNews: Article[];
  asOf: string;
}

// ─── RSS helpers (mirrored from /api/news/route.ts) ────────────────────────
function between(xml: string, tag: string): string {
  const s = xml.indexOf(`<${tag}`);
  if (s === -1) return "";
  const cs = xml.indexOf(">", s) + 1;
  const e  = xml.indexOf(`</${tag}>`, cs);
  if (e === -1) return "";
  return xml.substring(cs, e).trim();
}
function stripCdata(s: string) {
  return s.replace(/<!\[CDATA\[/g, "").replace(/\]\]>/g, "").trim();
}
function stripHtml(s: string) {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function rssPublisherImageUrl(item: string): string | undefined {
  const m = item.match(/<source[^>]+url=["']([^"']+)["']/i);
  if (!m?.[1]) return undefined;
  try {
    const domain = new URL(m[1]).hostname;
    return `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=256`;
  } catch {
    return undefined;
  }
}

// ─── Fetch recent conflict news via Google News RSS ────────────────────────
async function fetchConflictNews(country: string): Promise<Article[]> {
  try {
    const q = `"${country}" (war OR ceasefire OR military OR fighting OR casualties OR bombing)`;
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en&gl=US&ceid=US:en`;

    const res = await fetch(url, {
      headers: { "User-Agent": "GlobeIQ/2.0 (+https://github.com/ravimildseven/globe-iq)" },
      next: { revalidate: 600 },
    });
    if (!res.ok) return [];

    const xml   = await res.text();
    const items = xml.split("<item>").slice(1, 7); // grab up to 6, then trim to 4

    return items
      .map((item): Article => {
        const title    = stripCdata(between(item, "title"));
        const link     = between(item, "link");
        const pubDate  = between(item, "pubDate");
        const source   = stripCdata(between(item, "source"));
        const desc     = stripHtml(stripCdata(between(item, "description")));
        const imageUrl = rssPublisherImageUrl(item);
        return {
          title:       title.replace(/\s+-\s+[^-]+$/, "").trim(),
          summary:     desc.slice(0, 220),
          source,
          publishedAt: pubDate,
          url:         link,
          imageUrl,
          category:    "conflicts",
        };
      })
      .filter((a) => a.title.length > 5)
      .slice(0, 4);
  } catch {
    return [];
  }
}

// ─── Route handler ─────────────────────────────────────────────────────────
// GET /api/conflicts?code=IN&country=India
export async function GET(request: NextRequest) {
  const code    = request.nextUrl.searchParams.get("code");
  const country = request.nextUrl.searchParams.get("country");

  if (!code || !country) {
    return NextResponse.json({ error: "Missing code or country" }, { status: 400 });
  }

  const conflicts: ConflictData[] = conflictsDatabase[code.toUpperCase()] ?? [];
  const recentNews: Article[]     = await fetchConflictNews(country);

  const asOf = new Date().toLocaleDateString("en-US", {
    month: "long",
    day:   "numeric",
    year:  "numeric",
  });

  return NextResponse.json({ conflicts, recentNews, asOf } satisfies ConflictsResponse);
}
