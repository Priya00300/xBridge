"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowDown } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import TokenSelector from "@/components/token-selector";
import ChainSelector from "@/components/chain-selector";
import { chains } from "@/shared/constants/chains";
import debounce from "lodash.debounce";
import { parseUnits, formatUnits } from "ethers";
import { useXBridgeRegistry } from "@/hooks/use-xbridge-registry";
import { useToast } from "@/hooks/use-toast";

export default function SwapInterface() {
  const { isConnected, balance, address } = useWallet();
  const { registerTransaction } = useXBridgeRegistry();
  const { toast } = useToast();
  
  const [fromChain, setFromChain] = useState<any>(chains[0]);
  const [toChain, setToChain] = useState<any>(chains[1]);
  const [fromToken, setFromToken] = useState<any>(null);
  const [toToken, setToToken] = useState<any>(null);
  const [fromAmount, setFromAmount] = useState<string>("");
  const [toAmount, setToAmount] = useState<string>("");
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [transactionFee, setTransactionFee] = useState<number | null>(null);
  const [insufficientBalance, setInsufficientBalance] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fromChain || !toChain) return;

    async function fetchTokens() {
      try {
        // Use the API route to avoid CORS issues
        const response = await fetch("/api/lifi/tokens");
        if (!response.ok) throw new Error("Failed to fetch tokens");
        const data = await response.json();

        const fromTokens = data.tokens[fromChain.id] || [];
        const toTokens = data.tokens[toChain.id] || [];

        setFromToken(fromTokens.find((token: any) => token.symbol === "ETH") || fromTokens[0]);
        setToToken(toTokens.find((token: any) => token.symbol === "ETH") || toTokens[0]);
      } catch (error) {
        console.error("Error fetching tokens:", error);
        setError("Failed to load tokens. Please try again later.");
      }
    }

    fetchTokens();
  }, [fromChain, toChain]);

  // Debounced fetch function
  const fetchSwapDetails = useCallback(
    debounce(async () => {
      if (!fromChain || !toChain || !fromToken || !toToken || !fromAmount || parseFloat(fromAmount) === 0) {
        setToAmount("");
        setExchangeRate(null);
        setTransactionFee(null);
        return;
      }
      
      if (!address) {
        console.error("Wallet not connected");
        setError("Please connect your wallet first");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Convert amount to Wei using the token's decimals
        const amountInWei = parseUnits(fromAmount, fromToken.decimals).toString();

        const response = await fetch(
          `/api/lifi/quote?fromChain=${fromChain.id}&toChain=${toChain.id}&fromToken=${fromToken.address}&toToken=${toToken.address}&fromAmount=${amountInWei}&fromAddress=${address}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch quote");
        }
        
        const data = await response.json();

        // Process the response data - FIXED: Properly format toAmount using formatUnits
        setToAmount(data.estimate?.toAmount 
          ? parseFloat(formatUnits(data.estimate.toAmount, toToken.decimals)).toFixed(6) 
          : "0.000000");
        
        // Calculate exchange rate if both amounts are available
        if (data.estimate?.toAmount && fromAmount) {
          const toAmountFormatted = parseFloat(formatUnits(data.estimate.toAmount, toToken.decimals));
          const rate = toAmountFormatted / parseFloat(fromAmount);
          setExchangeRate(rate);
        } else {
          setExchangeRate(null);
        }
        
        // Extract fee information if available
        setTransactionFee(data.estimate?.feeCosts?.[0]?.amountUSD 
          ? parseFloat(data.estimate.feeCosts[0].amountUSD) 
          : null);
      } catch (error) {
        console.error("Error fetching swap details:", error);
        setError("Failed to get swap quote. Please try again.");
        setToAmount("");
        setExchangeRate(null);
        setTransactionFee(null);
      } finally {
        setIsLoading(false);
      }
    }, 500),
    [fromChain, toChain, fromToken, toToken, fromAmount, address]
  );

  useEffect(() => {
    fetchSwapDetails();
    
    // Clear error when input changes
    if (error) setError(null);
  }, [fromAmount, fetchSwapDetails, error]);

  // Validate balance
  useEffect(() => {
    if (!fromToken || !balance || !fromAmount) {
      setInsufficientBalance(false);
      return;
    }

    const userBalance = parseFloat(balance[fromToken.address] || "0");
    const inputAmount = parseFloat(fromAmount);

    setInsufficientBalance(inputAmount > userBalance);
  }, [fromAmount, fromToken, balance]);

  const handleSwap = async () => {
    if (!isConnected || insufficientBalance || isLoading || isSwapping) return;
    
    setIsSwapping(true);
    setError(null);
    
    try {
      console.log("Swapping", fromAmount, fromToken?.symbol, "from", fromChain.name, "to", toChain.name);
      
      // Perform the actual swap here using the Li.Fi API
      const amountInWei = parseUnits(fromAmount, fromToken.decimals).toString();
      
      const response = await fetch(
        `/api/lifi/swap?fromChain=${fromChain.id}&toChain=${toChain.id}&fromToken=${fromToken.address}&toToken=${toToken.address}&fromAmount=${amountInWei}&fromAddress=${address}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to execute swap");
      }
      
      const swapData = await response.json();
      
      // Get the transaction hash from the response
      const txHash = swapData.transactionHash || swapData.hash || swapData.txHash;
      
      if (!txHash) {
        throw new Error("No transaction hash returned from swap");
      }
      
      // Register the transaction with Educhain
      const txId = await registerTransaction(
        fromChain.name,
        toChain.name,
        fromToken.symbol,
        toToken.symbol,
        fromAmount,
        toAmount || "0",
        txHash
      );
      
      if (txId) {
        toast({
          title: "Transaction Recorded",
          description: txId === "pending" 
            ? "Your transaction will be recorded on Educhain when you connect to that network"
            : "Your transaction has been recorded on Educhain for transparency",
        });
      }
      
      // Show success message
      toast({
        title: "Swap Successful",
        description: `Successfully swapped ${fromAmount} ${fromToken.symbol} to approximately ${toAmount} ${toToken.symbol}`,
      });
      
      // Reset form
      setFromAmount("");
      setToAmount("");
      
    } catch (error: any) {
      console.error("Error during swap:", error);
      setError(error.message || "Failed to complete the swap");
      
      toast({
        title: "Swap Failed",
        description: error.message || "Failed to complete the swap",
        variant: "destructive",
      });
    } finally {
      setIsSwapping(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and a single decimal point
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setFromAmount(value);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-4 z-10">
      {/* From Section */}
      <div className="mb-4">
        <ChainSelector selectedChain={fromChain} onSelectChain={setFromChain} zIndex={30} />
        <div className="flex justify-between items-end mb-1 mt-3">
          <input
            type="text"
            value={fromAmount}
            onChange={handleAmountChange}
            placeholder="0.001"
            className={`w-3/5 text-3xl bg-transparent outline-none ${insufficientBalance ? "text-red-500" : ""}`}
          />
          <TokenSelector
            selectedToken={fromToken}
            onSelectToken={setFromToken}
            selectedChain={fromChain}
            isConnected={isConnected}
          />
        </div>
        {insufficientBalance && <p className="text-red-500 text-sm mt-1">Insufficient balance</p>}
      </div>

      {/* Swap Button */}
      <div className="flex justify-center -my-2 relative z-20">
        <button
          onClick={() => {
            setFromChain(toChain);
            setToChain(fromChain);
            setFromToken(toToken);
            setToToken(fromToken);
            setFromAmount(toAmount);
            setToAmount(fromAmount);
          }}
          className="bg-white rounded-full p-2 shadow hover:shadow-md transition-shadow"
        >
          <ArrowDown size={20} className="text-gray-400" />
        </button>
      </div>

      {/* To Section */}
      <div className="mb-4 mt-2">
        <ChainSelector selectedChain={toChain} onSelectChain={setToChain} zIndex={10} />
        <div className="flex justify-between items-end mb-1 mt-3">
          <input 
            type="text" 
            value={isLoading ? "Loading..." : toAmount} 
            readOnly 
            placeholder="0.000000" 
            className="w-3/5 text-3xl bg-transparent outline-none" 
          />
          <TokenSelector 
            selectedToken={toToken} 
            onSelectToken={setToToken} 
            selectedChain={toChain} 
            isConnected={isConnected} 
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-red-500 text-sm mb-4 p-2 bg-red-50 rounded">
          {error}
        </div>
      )}

      {/* Live Calculation Details */}
      <div className="text-sm text-gray-500 mb-4">
        {fromAmount && fromToken && (
          <p>
            You entered: <span className="font-medium">{fromAmount} {fromToken?.symbol}</span>
          </p>
        )}
        {exchangeRate && fromToken && toToken && (
          <p>
            1 {fromToken?.symbol} ≈ {exchangeRate.toFixed(6)} {toToken?.symbol}
          </p>
        )}
        {transactionFee !== null && (
          <p>
            Estimated Fee: <span className="font-medium">${transactionFee.toFixed(4)}</span>
          </p>
        )}
      </div>

      {/* Swap Button */}
      <button
        onClick={handleSwap}
        className={`w-full py-3 rounded-lg font-medium transition-colors ${
          !isConnected || insufficientBalance || isLoading || isSwapping
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-[#BE3144] text-white hover:bg-[#c33e50]"
        }`}
        disabled={!isConnected || insufficientBalance || isLoading || isSwapping}
      >
        {isLoading
          ? "Loading..."
          : isSwapping
          ? "Processing..."
          : insufficientBalance
          ? "Insufficient Balance"
          : "Swap"}
      </button>
    </div>
  );
}