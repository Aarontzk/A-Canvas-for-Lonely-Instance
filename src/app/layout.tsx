import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Starfield } from "@/components/starfield/Starfield";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AmbientPlayer } from "@/components/ambient/AmbientPlayer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "A Canvas for Lonely Instance",
  description: "Your private space to pour your heart out. Safe, quiet, and yours.",
};

export const viewport: Viewport = {
  themeColor: "#0a0e1a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        <Starfield />
        <Navbar />
        <main className="min-h-screen pt-16">
          <div className="max-w-4xl mx-auto px-4 py-8">
            {children}
          </div>
        </main>
        <AmbientPlayer />
        <Footer />
      </body>
    </html>
  );
}
