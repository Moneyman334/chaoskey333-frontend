import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChaosKey333 Operations Console",
  description:
    "Operational readiness dashboard for ChaosKey333 platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans">
        {children}
      </body>
    </html>
  );
}
