import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Evolv",
  description:
    "Evolv connects founders, developers, and investors through AI-generated blueprints.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.className} ${GeistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
