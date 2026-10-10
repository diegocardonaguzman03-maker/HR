import type { Metadata } from "next";
import { Inter, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-space-grotesk" });
const body = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-space-mono" });

export const metadata: Metadata = {
  title: { default: "PRAXIA Command Center", template: "%s · PRAXIA" },
  description: "Turn strategy into adoption — PRAXIA's operating system.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
