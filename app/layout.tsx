import type { Metadata } from "next";
import { homeMeta } from "@/lib/seo";
import ThemeProvider from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = homeMeta;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7690377849232326" crossOrigin="anonymous"></script>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-YPV331MBHD"></script>
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-YPV331MBHD');
        `}} />
      </head>
      <body className="antialiased text-gray-900 dark:text-gray-100 min-h-screen flex flex-col">
        <ThemeProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
