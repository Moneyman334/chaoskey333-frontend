import type { Metadata } from "next";
import "./globals.css";
import WatchtowerClient from "./components/WatchtowerClient";

export const metadata: Metadata = {
  title: "ChaosKey333 Vault - Watchtower Signal Amplifier",
  description:
    "Real-time glyph alerts and vault broadcast system with multi-channel pulse notifications",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <WatchtowerClient />
      </body>
    </html>
  );
}
