import type { Metadata } from "next";
import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";

export const metadata: Metadata = {
  title: "ChaosKey333 - Superman Relic Store",
  description:
    "Get your exclusive Superman Relic NFT with seamless crypto payments",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans">
        <ThirdwebProvider>{children}</ThirdwebProvider>
      </body>
    </html>
  );
}
