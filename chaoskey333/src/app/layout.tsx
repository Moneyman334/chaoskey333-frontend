import type { Metadata } from "next";
import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";

export const metadata: Metadata = {
  title: "ChaosKey333 Casino - Legendary Relics Store",
  description:
    "Discover legendary relics and artifacts imbued with chaotic energy. Buy rare collectibles and NFTs with crypto payments.",
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
