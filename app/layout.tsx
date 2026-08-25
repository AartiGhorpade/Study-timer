import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kitchen Timer",
  description: "A clean digital kitchen countdown timer."
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}