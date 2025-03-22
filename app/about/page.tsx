import FloatingSymbols from "@/components/floating-symbols"

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#09122C] to-black relative overflow-hidden pt-20">
      <FloatingSymbols />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-[#BE3144] mb-6">About xBridge</h1>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
          <p className="mb-4">
          xBridge is more than just a cross-chain bridging platform—it’s a gateway to a truly interconnected blockchain 
          ecosystem. Our mission is simple to make secure, fast, and hassle-free asset transfers across multiple
           blockchains accessible to everyone, whether you’re a developer, trader, or just stepping into the world of 
           DeFi.
          </p>
          <p className="mb-4">
          Powered by the Li-Fi Diamond contract, xBridge eliminates the usual headaches of bridging, such as high fees, slow
           transactions, and complex processes. Our platform seamlessly connects major blockchain networks like Ethereum, 
           Binance Smart Chain, Polygon, and more, allowing users to move assets effortlessly while optimizing liquidity and
            minimizing slippage.
          </p>
          <p className="mb-4">
          With an intuitive interface and real-time transaction tracking, xBridge ensures a frictionless experience 
          for users at all levels. Security is at the core of our platform, with robust smart contract audits and
           cutting-edge encryption protecting every transaction.
          </p>
          <h2 className="text-2xl font-bold text-[#BE3144] mt-8 mb-4">Our Vision</h2>
          <p>
          We believe in a future where blockchains are seamlessly connected, unlocking new opportunities for
           decentralized finance. xBridge is committed to building the infrastructure that makes this vision a reality, 
           empowering users with a truly open, interoperable, and decentralized financial ecosystem.
          </p>
        </div>
      </div>
    </main>
  )
}

