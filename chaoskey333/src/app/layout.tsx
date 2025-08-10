import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChaosKey333 Vault - Omni-Singularity Map",
  description: "Navigate the Omni-Singularity Map with keyboard and gamepad controls",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
