import type { Metadata, Viewport } from "next";
import { Inter, Outfit, Amiri } from "next/font/google";
import "./globals.css";
import I18nProvider from "@/components/I18nProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ClerkProvider } from "@clerk/nextjs";
import { ProTierSync } from "@/components/ProTierSync";
import { UpgradeModal } from "@/components/UpgradeModal";
import { SightingModal } from "@/components/SightingModal";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  weight: ["400", "700"],
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: "Hilal Vision — Lunar Observation & Hijri Calendar",
  description: "Advanced lunar visibility predictions and Islamic astronomical analytics.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#233342",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <script dangerouslySetInnerHTML={{
            __html: `
            if (localStorage.getItem('hilal-app-storage')?.includes('"isDarkMode":true')) {
              document.documentElement.classList.add('dark');
            } else if (!localStorage.getItem('hilal-app-storage')) {
              document.documentElement.classList.add('dark');
            }
          `}} />
        </head>
        <body
          className={`${inter.variable} ${outfit.variable} ${amiri.variable} font-sans antialiased`}
        >
          <ProTierSync />
          <UpgradeModal />
          <SightingModal />
          <I18nProvider>
            <Header />
            <main className="min-h-screen pt-16">
              {children}
            </main>
            <Footer />
          </I18nProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
