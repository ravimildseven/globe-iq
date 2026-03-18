import { NextRequest, NextResponse } from "next/server";

function extractBetweenTags(xml: string, tag: string): string {
  const open = `<${tag}>`;
  const close = `</${tag}>`;
  const start = xml.indexOf(open);
  const end = xml.indexOf(close);
  if (start === -1 || end === -1) return "";
  return xml.substring(start + open.length, end);
}

function stripCdata(s: string): string {
  return s.replace(/<!\[CDATA\[/g, "").replace(/\]\]>/g, "").trim();
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, "").trim();
}

export async function GET(request: NextRequest) {
  const country = request.nextUrl.searchParams.get("country");
  if (!country) {
    return NextResponse.json({ error: "Missing country parameter" }, { status: 400 });
  }

  try {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(country)}&hl=en&gl=US&ceid=US:en`;
    const res = await fetch(url, {
      headers: { "User-Agent": "GlobeIQ/1.0" },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return NextResponse.json({ articles: [] });
    }

    const xml = await res.text();
    const items = xml.split("<item>").slice(1, 9);

    const articles = items.map((item) => {
      const title = stripCdata(extractBetweenTags(item, "title"));
      const link = extractBetweenTags(item, "link");
      const pubDate = extractBetweenTags(item, "pubDate");
      const source = stripCdata(extractBetweenTags(item, "source"));
      const description = stripHtml(stripCdata(extractBetweenTags(item, "description")));

      return {
        title,
        summary: description.slice(0, 200),
        source,
        publishedAt: pubDate,
        url: link,
      };
    });

    return NextResponse.json({ articles });
  } catch {
    return NextResponse.json({ articles: [] });
  }
}
