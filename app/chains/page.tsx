"use client";

import { useState } from "react";
import FloatingSymbols from "./app/components/floating-symbols";
import CryptoBubbles from "./app/components/crypto-bubbles";
import MarketStats from "./app/components/market-stats";
import { top20Cryptocurrencies } from "./data/cryptocurrencies"; // 

const supportedChains = [
  { name: "Ethereum", symbol: "ETH", color: "#627EEA", description: "The original smart contract platform" },
  { name: "Bitcoin", symbol: "BTC", color: "#F7931A", description: "The first and most valuable cryptocurrency" },
  { name: "Solana", symbol: "SOL", color: "#00FFA3", description: "High-performance blockchain with fast transactions" },
  { name: "Polygon", symbol: "MATIC", color: "#8247E5", description: "Ethereum scaling platform" },
  { name: "Avalanche", symbol: "AVAX", color: "#E84142", description: "Platform for decentralized applications" },
  { name: "BNB Chain", symbol: "BNB", color: "#F0B90B", description: "Binance's blockchain ecosystem" },
];

type TimeFrame = "hour" | "day" | "week" | "month" | "year";

export default function ChainsPage() {
  const [viewMode, setViewMode] = useState<"list" | "bubbles">("bubbles");
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("day");

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#09122C] to-black relative overflow-hidden pt-20">
      <FloatingSymbols />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-[#BE3144] mb-6 text-center">CryptoBubbles</h1>
        <p className="text-white text-center max-w-2xl mx-auto mb-10">
          Price change visualization TOP 20 cryptocurrencies.
        </p>

        <MarketStats />

        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-full p-1 inline-flex">
            <button
              onClick={() => setViewMode("bubbles")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                viewMode === "bubbles" ? "bg-[#BE3144] text-white" : "text-white/70 hover:text-white"
              }`}
            >
              Bubbles view
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                viewMode === "list" ? "bg-[#BE3144] text-white" : "text-white/70 hover:text-white"
              }`}
            >
              Table view
            </button>
          </div>
        </div>

        {viewMode === "bubbles" && (
          <>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 mb-10 overflow-hidden">
              <CryptoBubbles cryptocurrencies={top20Cryptocurrencies} timeframe={timeFrame} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
