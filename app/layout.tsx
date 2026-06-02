import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trader Journal",
  description: "Professional Trading Journal",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}