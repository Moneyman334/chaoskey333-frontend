"use client";

import Image from "next/image";
import { ConnectWallet } from "@thirdweb-dev/react";
import thirdwebIcon from "@public/thirdweb.svg";

export default function Home() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "5rem" }}>
      <h1>⚡️ ChaosKey333 Vault</h1>
      <ConnectWallet />
    </div>
  );
}