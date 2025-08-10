import type { Metadata } from "next";
import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";
import { BroadcastBanner } from "../components/BroadcastBanner";
import { MonitoringProvider } from "../components/MonitoringProvider";

export const metadata: Metadata = {
  title: "ChaosKey333 - Cosmic Replay Terminal",
  description: "The ultimate blockchain vault and cosmic replay terminal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <MonitoringProvider>
          <ThirdwebProvider>
            <BroadcastBanner />
            {children}
          </ThirdwebProvider>
        </MonitoringProvider>
      </body>
    </html>
  );
}
