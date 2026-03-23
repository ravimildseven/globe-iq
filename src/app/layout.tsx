import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/providers/ThemeProvider";
import AudioUnlock from "@/components/ui/AudioUnlock";
import { HomeCountryProvider } from "@/lib/homeCountry";


export const metadata: Metadata = {
  title: "GlobeIQ — World Intelligence",
  description: "Explore the world in real-time. Interactive globe with live markets, news, conflicts, and more.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GlobeIQ",
  },
  icons: {
    icon: [
      { url: "/logo-icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "GlobeIQ — World Intelligence",
    description: "Explore the world in real-time. Interactive globe with live markets, news, conflicts, and more.",
    images: [{ url: "/icons/icon-512.png", width: 512, height: 512 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GlobeIQ — World Intelligence",
    description: "Explore the world in real-time. Interactive globe with live markets, news, conflicts, and more.",
    images: ["/icons/icon-512.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#070F1C" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <HomeCountryProvider>
            <AudioUnlock />
            {children}
          </HomeCountryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
