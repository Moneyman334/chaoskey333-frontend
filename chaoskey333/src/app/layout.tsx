import type { Metadata } from "next";
import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";
import FeatureFlagBar from "../../components/FeatureFlagBar";
import { shouldShowFlagBar } from "../../lib/featureFlags";

export const metadata: Metadata = {
  title: "ChaosKey333 Vault",
  description:
    "ChaosKey333 Vault - thirdweb SDK with Next.js App router",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const showFlagBar = shouldShowFlagBar();

  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <ThirdwebProvider>
          {children}
          {showFlagBar && <FeatureFlagBar />}
        </ThirdwebProvider>
      </body>
    </html>
  );
}
