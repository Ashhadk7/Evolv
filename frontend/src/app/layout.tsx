import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import "./spacing-fix.css";

const geist = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Evolv - Where ideas become funded startups",
  description:
    "Evolv connects founders, developers, and investors through AI-generated blueprints.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.className} data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
