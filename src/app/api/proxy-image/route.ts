import { NextRequest, NextResponse } from "next/server";

/**
 * Image proxy — bypasses publisher hotlinking protection.
 * Server-to-server fetch omits the Referer header that would normally
 * reveal we're loading from a different domain (globe-iq.vercel.app etc.)
 */
export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url");
  if (!rawUrl) {
    return new NextResponse("Missing url", { status: 400 });
  }

  // Only proxy http/https URLs
  let url: URL;
  try {
    url = new URL(rawUrl);
    if (!["http:", "https:"].includes(url.protocol)) {
      return new NextResponse("Invalid protocol", { status: 400 });
    }
  } catch {
    return new NextResponse("Invalid URL", { status: 400 });
  }

  try {
    const res = await fetch(url.toString(), {
      headers: {
        // Mimic a real browser request — no Referer sent (server-side)
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "image/webp,image/avif,image/*,*/*;q=0.8",
      },
      // 5-second timeout
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return new NextResponse("Upstream image error", { status: res.status });
    }

    const contentType = res.headers.get("content-type") || "image/jpeg";
    if (!contentType.startsWith("image/")) {
      return new NextResponse("Not an image", { status: 415 });
    }

    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        // Cache for 24 hours — images don't change
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
        // Allow embedding from our own domain
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: any) {
    if (err?.name === "TimeoutError") {
      return new NextResponse("Image fetch timeout", { status: 504 });
    }
    return new NextResponse("Failed to fetch image", { status: 502 });
  }
}
