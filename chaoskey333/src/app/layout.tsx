import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChaosKey333 - Ascension Terminal",
  description: "Master Command Layer for Relic Events",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-black text-green-400 font-mono">
        {children}
      </body>
    </html>
  );
}
