import type { Metadata } from "next";
// Remove Inter font import to avoid network dependency
import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";
import { VaultPremiereGate } from "./components/VaultPremiereGate";

export const metadata: Metadata = {
  title: "ChaosKey333 - Vault Cinematic Experience",
  description:
    "ChaosKey333 vault with cinematic premiere system and relic evolution",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <ThirdwebProvider>
          <VaultPremiereGate adminMode={true}>
            {children}
          </VaultPremiereGate>
        </ThirdwebProvider>
      </body>
    </html>
  );
}
