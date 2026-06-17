import type { Metadata } from "next";
import "./globals.css";
import "./spacing-fix.css";

export const metadata: Metadata = {
  title: "Evolv - Where ideas become funded startups",
  description:
    "Evolv connects founders, developers, and investors through AI-generated blueprints.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
