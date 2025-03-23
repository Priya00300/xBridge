// app/transactions/page.tsx
import TransactionHistory from "@/components/transaction-history"
import FloatingSymbols from "@/components/floating-symbols"

export default function TransactionsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#09122C] to-black relative overflow-hidden pt-20">
      <FloatingSymbols />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-[#BE3144] mb-6">Transaction History</h1>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
          <TransactionHistory />
        </div>
      </div>
    </main>
  )
}