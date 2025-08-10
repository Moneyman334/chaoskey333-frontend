import type { Metadata } from "next";
import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";
import WatchtowerClient from "./components/WatchtowerClient";

export const metadata: Metadata = {
  title: "ChaosKey333 Vault - Watchtower Enabled",
  description:
    "Real-time monitoring and alerts for the ChaosKey333 Ascension chain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans">
        <ThirdwebProvider>
          {children}
          <WatchtowerClient />
        </ThirdwebProvider>
      </body>
    </html>
  );
}
