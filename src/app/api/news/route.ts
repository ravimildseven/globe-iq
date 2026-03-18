import { NextRequest, NextResponse } from "next/server";

// ─── Types ───────────────────────────────────────────────────────────────────
export interface Article {
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  url: string;
  imageUrl?: string;
  category?: string;
}

// ─── GNews API ───────────────────────────────────────────────────────────────
// Free tier: 100 req/day — sign up at https://gnews.io
// Set GNEWS_API_KEY in .env.local to enable rich news with images

const GNEWS_CATEGORIES = ["general", "nation", "business", "technology", "sports", "entertainment", "health", "science"];

async function fetchGNews(country: string, category: string): Promise<Article[]> {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) return [];

  try {
    const cat = GNEWS_CATEGORIES.includes(category) ? category : "general";
    const q   = encodeURIComponent(`"${country}"`);

    const url = `https://gnews.io/api/v4/search?q=${q}&lang=en&max=10&apikey=${apiKey}` +
                (cat !== "general" ? `&topic=${cat}` : "");

    const res = await fetch(url, { next: { revalidate: 60 } }); // 60s cache for GNews
    if (!res.ok) return [];

    const data = await res.json();
    return (data.articles || []).map((a: any) => ({
      title:       a.title        || "",
      summary:     a.description  || "",
      source:      a.source?.name || "",
      publishedAt: a.publishedAt  || "",
      url:         a.url          || "",
      imageUrl:    a.image        || undefined,
      category:    cat,
    }));
  } catch {
    return [];
  }
}

// ─── RSS helpers ─────────────────────────────────────────────────────────────
function between(xml: string, tag: string): string {
  const open  = `<${tag}`;
  const close = `</${tag}>`;
  const s = xml.indexOf(open);
  if (s === -1) return "";
  const contentStart = xml.indexOf(">", s) + 1;
  const e = xml.indexOf(close, contentStart);
  if (e === -1) return "";
  return xml.substring(contentStart, e);
}

function extractAttr(xml: string, tag: string, attr: string): string {
  const open = `<${tag}`;
  const s = xml.indexOf(open);
  if (s === -1) return "";
  const end = xml.indexOf(">", s);
  const chunk = xml.substring(s, end);
  const m = chunk.match(new RegExp(`${attr}=["']([^"']+)["']`));
  return m ? m[1] : "";
}

function stripCdata(s: string): string {
  return s.replace(/<!\[CDATA\[/g, "").replace(/\]\]>/g, "").trim();
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

// ─── Google News RSS (fallback) ───────────────────────────────────────────────
// No API key needed — real-time, free, but no images
async function fetchGoogleNewsRss(query: string, category: string): Promise<Article[]> {
  try {
    // Build topic-enriched query
    const topicSuffix: Record<string, string> = {
      business:      " economy OR finance OR market",
      technology:    " tech OR AI OR digital",
      science:       " science OR research",
      health:        " health OR medicine",
      sports:        " sport",
      entertainment: " entertainment OR culture",
    };

    const enrichedQuery = query + (topicSuffix[category] || "");
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(enrichedQuery)}&hl=en&gl=US&ceid=US:en`;

    const res = await fetch(url, {
      headers: { "User-Agent": "GlobeIQ/2.0 (+https://github.com/ravimildseven/globe-iq)" },
      next: { revalidate: 120 }, // 2-minute cache — near real-time
    });

    if (!res.ok) return [];
    const xml   = await res.text();
    const items = xml.split("<item>").slice(1, 13); // up to 12 items

    return items.map(item => {
      const title       = stripCdata(between(item, "title"));
      const link        = between(item, "link") || extractAttr(item, "link", "href");
      const pubDate     = between(item, "pubDate");
      const source      = stripCdata(between(item, "source"));
      const description = stripHtml(stripCdata(between(item, "description")));

      // Try to extract media:content image or enclosure
      const imgMatch = item.match(/url=["']([^"']+\.(jpg|jpeg|png|webp))["']/i);
      const imageUrl = imgMatch ? imgMatch[1] : undefined;

      return {
        title:       title.replace(/\s*-\s*[^-]+$/, ""), // strip source suffix from title
        summary:     description.slice(0, 220),
        source:      source || extractAttr(item, "source", "url").split("/")[2] || "",
        publishedAt: pubDate,
        url:         link,
        imageUrl,
        category,
      } satisfies Article;
    }).filter(a => a.title.length > 5);

  } catch {
    return [];
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const country  = request.nextUrl.searchParams.get("country");
  const category = request.nextUrl.searchParams.get("category") || "general";

  if (!country) {
    return NextResponse.json({ error: "Missing country parameter" }, { status: 400 });
  }

  // Try GNews first (if key present), then fall back to RSS
  let articles = await fetchGNews(country, category);

  if (articles.length === 0) {
    articles = await fetchGoogleNewsRss(country, category);
  }

  return NextResponse.json({ articles, source: articles.length > 0 ? "live" : "none" });
}
