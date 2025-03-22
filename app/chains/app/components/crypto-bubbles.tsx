"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

type Cryptocurrency = {
  name: string
  symbol: string
  price: number
  marketCap: number
  priceChange24h: number
  logoUrl?: string
}

type Props = {
  cryptocurrencies: Cryptocurrency[]
  timeframe?: "hour" | "day" | "week" | "month" | "year"
}

export default function CryptoBubbles({ cryptocurrencies, timeframe = "day" }: Props) {
  const [hoveredCrypto, setHoveredCrypto] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: Math.max(600, window.innerHeight * 0.7),
        })
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)

    return () => {
      window.removeEventListener("resize", updateDimensions)
    }
  }, [])

  // Calculate bubble sizes based on price
  const maxPrice = Math.max(...cryptocurrencies.map((c) => c.price))
  const minPrice = Math.min(...cryptocurrencies.map((c) => c.price))
  const minSize = 50
  const maxSize = 140

  const getBubbleSize = (price: number) => {
    // Using logarithmic scale for better visualization since prices can vary widely
    const logPrice = Math.log(price)
    const logMinPrice = Math.log(minPrice)
    const logMaxPrice = Math.log(maxPrice)

    // Calculate percentage on logarithmic scale
    const percentage = (logPrice - logMinPrice) / (logMaxPrice - logMinPrice)
    return minSize + percentage * (maxSize - minSize)
  }

  // Get color based on price change
  const getBubbleColor = (priceChange: number) => {
    // For negative changes: red with opacity based on magnitude
    if (priceChange < 0) {
      const opacity = Math.min(0.9, Math.max(0.3, Math.abs(priceChange) / 10))
      return `rgba(239, 68, 68, ${opacity})`
    }

    // For positive changes: green with opacity based on magnitude
    const opacity = Math.min(0.9, Math.max(0.3, priceChange / 10))
    return `rgba(34, 197, 94, ${opacity})`
  }

  // Get text color based on price change
  const getTextColor = (priceChange: number) => {
    return priceChange >= 0 ? "text-white" : "text-white"
  }

  // Generate non-overlapping positions using force-directed placement
  const [positions, setPositions] = useState<{ x: number; y: number }[]>([])

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return

    const bubbleSizes = cryptocurrencies.map((crypto) => getBubbleSize(crypto.price))

    // Initial positions in a grid-like pattern with some randomness
    const initialPositions = cryptocurrencies.map((_, index) => {
      const cols = Math.ceil(Math.sqrt(cryptocurrencies.length))
      const row = Math.floor(index / cols)
      const col = index % cols

      // Add some randomness to initial positions
      const randomX = (Math.random() - 0.5) * 100
      const randomY = (Math.random() - 0.5) * 100

      return {
        x: (dimensions.width / cols) * col + dimensions.width / cols / 2 + randomX,
        y: (dimensions.height / cols) * row + dimensions.height / cols / 2 + randomY,
      }
    })

    // Force-directed algorithm to prevent overlaps
    const simulateForces = () => {
      const newPositions = [...initialPositions]

      // Repulsion forces to prevent overlaps
      for (let i = 0; i < cryptocurrencies.length; i++) {
        for (let j = 0; j < cryptocurrencies.length; j++) {
          if (i === j) continue

          const dx = newPositions[i].x - newPositions[j].x
          const dy = newPositions[i].y - newPositions[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const minDistance = bubbleSizes[i] / 2 + bubbleSizes[j] / 2 + 10 // Add more padding

          if (distance < minDistance) {
            const force = (minDistance - distance) / distance

            // Apply stronger force to move bubbles away from each other
            newPositions[i].x += dx * force * 0.7
            newPositions[i].y += dy * force * 0.7
          }
        }

        // Boundary forces to keep bubbles within container
        const radius = bubbleSizes[i] / 2
        const padding = 20

        if (newPositions[i].x < radius + padding) {
          newPositions[i].x = radius + padding
        }
        if (newPositions[i].x > dimensions.width - radius - padding) {
          newPositions[i].x = dimensions.width - radius - padding
        }
        if (newPositions[i].y < radius + padding) {
          newPositions[i].y = radius + padding
        }
        if (newPositions[i].y > dimensions.height - radius - padding) {
          newPositions[i].y = dimensions.height - radius - padding
        }
      }

      return newPositions
    }

    // Run multiple iterations of force simulation
    let currentPositions = initialPositions
    for (let iteration = 0; iteration < 100; iteration++) {
      // More iterations for better separation
      currentPositions = simulateForces()
    }

    setPositions(currentPositions)
  }, [cryptocurrencies, dimensions])

  if (positions.length === 0) {
    return <div ref={containerRef} className="w-full h-[600px]" />
  }

  return (
    <div ref={containerRef} className="w-full h-[600px] relative bg-black/80 rounded-xl overflow-hidden">
      {cryptocurrencies.map((crypto, index) => {
        const size = getBubbleSize(crypto.price)
        const isHovered = hoveredCrypto === crypto.symbol
        const bubbleColor = getBubbleColor(crypto.priceChange24h)
        const textColorClass = getTextColor(crypto.priceChange24h)

        return (
          <motion.div
            key={crypto.symbol}
            initial={{ scale: 0, x: positions[index].x - size / 2, y: positions[index].y - size / 2 }}
            animate={{
              scale: 1,
              x: positions[index].x - size / 2,
              y: positions[index].y - size / 2,
              zIndex: isHovered ? 10 : 1,
            }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15,
              delay: index * 0.05,
            }}
            style={{
              width: size,
              height: size,
              backgroundColor: bubbleColor,
              position: "absolute",
              boxShadow: isHovered ? "0 0 20px rgba(255,255,255,0.3)" : "none",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
            className={`rounded-full flex items-center justify-center cursor-pointer
                       transition-all duration-300`}
            onMouseEnter={() => setHoveredCrypto(crypto.symbol)}
            onMouseLeave={() => setHoveredCrypto(null)}
          >
            <div className="flex flex-col items-center justify-center text-white p-2 text-center">
              <span className={`font-bold ${size > 70 ? "text-lg" : "text-sm"} ${textColorClass}`}>
                {crypto.symbol}
              </span>
              {(isHovered || size > 90) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <p className={`${size > 70 ? "text-xs" : "text-[10px]"} font-medium ${textColorClass}`}>
                    $
                    {crypto.price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: crypto.price < 1 ? 6 : 2,
                    })}
                  </p>
                  <p
                    className={`${size > 70 ? "text-xs" : "text-[10px]"} mt-1 font-bold ${crypto.priceChange24h >= 0 ? "text-green-300" : "text-red-300"}`}
                  >
                    {crypto.priceChange24h >= 0 ? "+" : ""}
                    {crypto.priceChange24h.toFixed(2)}%
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

