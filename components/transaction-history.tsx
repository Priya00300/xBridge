// components/transaction-history.tsx
"use client"

import { useEffect, useState } from "react"
import { useXBridgeRegistry } from "@/hooks/use-xbridge-registry"
import { useWallet } from "@/hooks/use-wallet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExternalLink, RefreshCw, Clock } from "lucide-react"

export default function TransactionHistory() {
  const { isConnected, address } = useWallet()
  const { 
    fetchUserTransactions, 
    transactions, 
    isLoading, 
    error 
  } = useXBridgeRegistry()
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    if (isConnected && address) {
      fetchUserTransactions()
    }
  }, [isConnected, address, fetchUserTransactions])

  const handleRefresh = () => {
    fetchUserTransactions()
  }

  const filteredTransactions = transactions.filter(tx => {
    if (activeTab === "all") return true
    if (activeTab === "successful") return tx.successful
    if (activeTab === "pending") return !tx.successful
    return true
  })

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Connect your wallet to see your transaction history</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Your cross-chain transaction records on Educhain</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="successful">Successful</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
                {error}
              </div>
            )}
            
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No transactions found</p>
                <p className="text-sm">Your cross-chain transfers will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((tx) => (
                  <div key={tx.id} className="bg-gray-50 p-4 rounded-md border">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <span className="font-medium">{tx.sourceChain} → {tx.targetChain}</span>
                        <Badge 
                          className="ml-2" 
                          variant={tx.successful ? "default" : "outline"}
                        >
                          {tx.successful ? 'Success' : 'Pending'}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-500">
                        {tx.timestamp.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
                      <div>
                        <p className="text-sm text-gray-500">From</p>
                        <p>{tx.amountIn} {tx.sourceToken}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">To</p>
                        <p>{tx.amountOut} {tx.targetToken}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-2 border-t border-dashed flex justify-between">
                      <span className="text-xs text-gray-500">ID: {tx.id}</span>
                      <a 
                        href={`https://devnet.explorer.educhain.io/tx/${tx.transactionHash}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs flex items-center text-blue-600 hover:text-blue-800"
                      >
                        View on Explorer
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-xs text-gray-500 border-t pt-4">
        Transactions are stored on Educhain blockchain for verification and transparency
      </CardFooter>
    </Card>
  )
}