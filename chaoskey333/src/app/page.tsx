"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "5rem" }}>
      <h1>⚡️ ChaosKey333 Vault</h1>
      <p>Operations Console available at <Link href="/admin/ops" className="text-blue-600 underline">/admin/ops</Link></p>
    </div>
  );
}