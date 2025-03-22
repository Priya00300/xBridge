"use client"

import { ArrowDownRight, ArrowUpRight } from "lucide-react"

type MarketStat = {
  label: string
  value: string
  change: number
}

export default function MarketStats() {
  const stats: MarketStat[] = [
    {
      label: "Total Market Cap",
      value: "$2.77T",
      change: 0.6,
    },
    {
      label: "24h Volume",
      value: "$78.5B",
      change: -1.23,
    },
    {
      label: "BTC Dominance",
      value: "51.2%",
      change: 0.45,
    },
    {
      label: "Active Cryptocurrencies",
      value: "9,834",
      change: 0.12,
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
          <p className="text-white/60 text-sm">{stat.label}</p>
          <div className="flex items-end justify-between mt-2">
            <p className="text-white text-2xl font-bold">{stat.value}</p>
            <div className={`flex items-center text-sm ${stat.change >= 0 ? "text-green-400" : "text-red-400"}`}>
              {stat.change >= 0 ? (
                <ArrowUpRight className="w-3 h-3 mr-1" />
              ) : (
                <ArrowDownRight className="w-3 h-3 mr-1" />
              )}
              <span>{Math.abs(stat.change)}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

