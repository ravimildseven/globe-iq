import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/providers/ThemeProvider";

export const metadata: Metadata = {
  title: "GlobeIQ — World Intelligence",
  description: "Explore the world in real-time. Interactive globe with live markets, news, conflicts, and more.",
  icons: {
    icon: [{ url: "/logo-icon.svg", type: "image/svg+xml" }],
    apple: "/logo-icon.svg",
  },
  openGraph: {
    title: "GlobeIQ — World Intelligence",
    description: "Explore the world in real-time. Interactive globe with live markets, news, conflicts, and more.",
    images: [{ url: "/logo-primary.svg", width: 512, height: 512 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GlobeIQ — World Intelligence",
    description: "Explore the world in real-time. Interactive globe with live markets, news, conflicts, and more.",
    images: ["/logo-primary.svg"],
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
