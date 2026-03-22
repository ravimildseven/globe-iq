# GlobeIQ — World Intelligence

An interactive 3-D globe that lets you explore any country's overview, economy, news, conflicts, and live stock market data at a glance.

**Live:** https://globe-iq.vercel.app
**Built by:** [Ravikiran Shenoy](https://ravimildseven.github.io/)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| 3-D Globe | Three.js + React Three Fiber + Drei |
| Geo data | world-atlas 50m + Natural Earth India-perspective |
| Styling | Tailwind CSS v4 |
| Theme | next-themes (dark / light / system) |
| Economy | World Bank API + Yahoo Finance v8 |
| Country facts | REST Countries v3 |
| News | Wikipedia summary API |
| Hosting | Vercel |

---

## iOS & Android — Conversion Plan

GlobeIQ is a **web-first** app built with Next.js and Three.js. The best path to a native mobile app depends on how much native-feel you need versus how fast you want to ship.

### Option A — PWA (Recommended first step, ~1 day)

Add a Progressive Web App manifest so users can install GlobeIQ directly from Safari/Chrome onto their home screen. The Three.js globe already runs in mobile browsers.

**Steps:**
1. Add `public/manifest.json` with name, icons, theme colour, `display: "standalone"`
2. Add `<link rel="manifest">` and `<meta name="apple-mobile-web-app-*">` tags to `app/layout.tsx`
3. Add a service worker (Next.js `next-pwa` plugin) for offline caching
4. Generate icon set (192×192, 512×512, Apple touch icon 180×180)
5. Deploy — users can now "Add to Home Screen" on iOS and Android

**Pros:** Zero rewrite, same codebase, submittable to some stores via PWA wrappers (e.g. PWABuilder for Microsoft Store).
**Cons:** Not on App Store / Google Play natively.

---

### Option B — Capacitor (Recommended for App Store, ~1–2 weeks)

[Capacitor](https://capacitorjs.com) wraps the existing Next.js web build inside a native iOS/Android shell. The Three.js globe runs inside a WKWebView / Chrome WebView — no rewrite required.

**Steps:**
1. Export Next.js as a static site: add `output: "export"` to `next.config.ts`, run `next build`
2. Install Capacitor: `npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android`
3. `npx cap init GlobeIQ com.ravikiran.globeiq`
4. `npx cap add ios && npx cap add android`
5. Copy build: `npx cap sync`
6. Open in Xcode / Android Studio: `npx cap open ios` / `npx cap open android`
7. Add native plugins as needed: `@capacitor/haptics`, `@capacitor/status-bar`, `@capacitor/splash-screen`
8. Submit via Xcode (TestFlight → App Store) and Android Studio (Google Play Console)

**Key considerations:**
- The `next export` static output means no server-side routes (e.g. `/api/markets`). Move market data fetch to client-side direct calls or a separate edge function.
- Three.js WebGL performs well in WKWebView on modern iPhones (iPhone 12+).
- Add `capacitor.config.json` with `server.url` pointing to your Vercel URL during development so you keep hot-reload.

**Pros:** True App Store presence, native status bar / haptics / deep links, single web codebase.
**Cons:** Some Next.js server features need adaptation; app review process (~1–2 weeks).

---

### Option C — React Native (Full rewrite, ~2–3 months)

Full native performance but requires rewriting the UI in React Native. Three.js doesn't run natively — you'd need `expo-three` + `expo-gl` or replace the globe with a native map library.

**Not recommended** unless you need deeply native features (ARKit, background location, etc.).

---

### Recommended Roadmap

```
Week 1   → PWA (manifest + icons + service worker) — home screen install works
Week 2–3 → Capacitor shell → TestFlight beta
Week 4   → App Store + Google Play submission
```

---

## Local Development

```bash
git clone https://github.com/ravimildseven/globe-iq.git
cd globe-iq
npm install
npm run dev        # http://localhost:3000
```

## Deploy

Deployed automatically to Vercel on every push to `main`.
