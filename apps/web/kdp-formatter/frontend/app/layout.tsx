import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-display",
});

const bodyFont = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "KDP Manuscript Formatter — Editorial Boutique",
  description:
    "Convierte tu manuscrito en un interior de libro listo para imprimir en Amazon KDP.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body className="min-h-screen bg-matte-950 font-body antialiased">
        <div className="pointer-events-none fixed inset-0 z-50 bg-grain opacity-40" />
        {children}
      </body>
    </html>
  );
}
