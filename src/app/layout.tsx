import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "Vover — Watch together, decide faster",
    template: "%s | Vover",
  },
  description:
    "Social movie and TV recommendations from friends you trust. Build watchlists, share what you love, and finally agree on what to watch.",
  keywords: ["movies", "tv shows", "recommendations", "watchlist", "social", "friends", "streaming"],
  authors: [{ name: "Vover" }],
  creator: "Vover",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://vover.app",
    siteName: "Vover",
    title: "Vover — Watch together, decide faster",
    description:
      "Social movie and TV recommendations from friends you trust. Build watchlists, share what you love, and finally agree on what to watch.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vover — Watch together, decide faster",
    description: "Social movie and TV recommendations from friends you trust.",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#7c5cbf",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Navbar />
        <main className="min-h-screen pt-16">{children}</main>
        <Footer />
        <Toaster theme="dark" position="bottom-right" richColors />
      </body>
    </html>
  );
}
