"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAccount, useBalance } from "wagmi";
import { chains } from "@/shared/constants/chains";
import Image from "next/image";

const balanceCache = new Map();
const CACHE_DURATION = 10 * 60 * 1000;
const TOKENS_PER_BATCH = 10;

const getTokenIcon = (token: any) => token.logoURI?.startsWith("http") ? token.logoURI : "";

interface TokenSelectorProps {
  selectedToken: any;
  onSelectToken: (token: any) => void;
  selectedChain: any;
  isConnected: boolean;
}

export default function TokenSelector({ selectedToken, onSelectToken, selectedChain, isConnected }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { address } = useAccount();
  const [tokens, setTokens] = useState<any[]>([]);
  const [displayTokens, setDisplayTokens] = useState<any[]>([]);
  const [loadedCount, setLoadedCount] = useState(TOKENS_PER_BATCH);
  const observerRef = useRef(null);

  useEffect(() => {
    async function fetchTokens() {
      if (!selectedChain?.id) return;
      try {
        const response = await fetch(`https://li.quest/v1/tokens`);
        if (!response.ok) throw new Error("Failed to fetch tokens");

        const data = await response.json();
        const filteredTokens = data.tokens[selectedChain.id] || [];

        // Ensure ETH is the first token in the list
        const ethToken = filteredTokens.find((token: any) => token.symbol === "ETH") || filteredTokens[0];
        const sortedTokens = [ethToken, ...filteredTokens.filter((t: any) => t.address !== ethToken.address)];

        setTokens(sortedTokens);
        setDisplayTokens(sortedTokens.slice(0, TOKENS_PER_BATCH));

        // Auto-select ETH or the first available token
        if (sortedTokens.length > 0) onSelectToken(sortedTokens[0]);
      } catch (error) {
        console.error(`Error fetching tokens for ${selectedChain.name}:`, error);
        setTokens([]);
      }
    }
    fetchTokens();
  }, [selectedChain]);

  const loadMoreTokens = useCallback(() => {
    if (loadedCount >= tokens.length) return;
    const newCount = Math.min(loadedCount + TOKENS_PER_BATCH, tokens.length);
    setDisplayTokens(tokens.slice(0, newCount));
    setLoadedCount(newCount);
  }, [loadedCount, tokens]);

  useEffect(() => {
    if (!observerRef.current || loadedCount >= tokens.length) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) loadMoreTokens();
    });
    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [loadMoreTokens]);

  return (
    <div className="relative z-40">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center space-x-1 bg-gray-100 px-3 py-2 rounded-lg">
            {selectedToken?.logoURI?.startsWith("http") ? (
              <Image src={selectedToken.logoURI} alt={selectedToken?.symbol || "Token"} width={24} height={24} />
            ) : (
              <div className="w-6 h-6 bg-gray-300 rounded-full" />
            )}
            <span className="font-medium">{selectedToken?.symbol || "Select Token"}</span>
            <ChevronDown size={16} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[240px] p-2 z-50">
          <input
            type="text"
            placeholder="Search tokens"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 text-sm border rounded-md focus:ring-2 focus:ring-red-500 mb-2"
          />
          <div className="max-h-[300px] overflow-y-auto">
            {displayTokens.length > 0 ? (
              displayTokens
                .filter((token) =>
                  token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  token.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((token) => (
                  <TokenItem
                    key={token.address}
                    token={token}
                    selectedChain={selectedChain}
                    address={address}
                    isConnected={isConnected}
                    onSelect={() => {
                      onSelectToken(token);
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                  />
                ))
            ) : (
              <p className="text-gray-500 text-center">No tokens available</p>
            )}
            <div ref={observerRef} className="h-10 w-full"></div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function TokenItem({ token, selectedChain, address, isConnected, onSelect }: any) {
  const cacheKey = `${selectedChain.id}-${token.address}`;
  const cachedBalance = balanceCache.get(cacheKey);
  const [balance, setBalance] = useState(cachedBalance ? cachedBalance.balance : "0.0000");

  const { data: balanceData } = useBalance({
    address,
    token: token.address !== "0x0000000000000000000000000000000000000000" ? token.address : undefined,
    chainId: selectedChain.id,
  });

  useEffect(() => {
    if (balanceData?.formatted) {
      const formattedBalance = parseFloat(balanceData.formatted).toFixed(4);
      balanceCache.set(cacheKey, { balance: formattedBalance, timestamp: Date.now() });
      setBalance(formattedBalance);
    }
  }, [balanceData]);

  const balanceInUSD =
    token.priceUSD && balance
      ? (Number(balance) * Number(token.priceUSD)).toFixed(4)
      : "0.0000";

  return (
    <div className="flex justify-between items-center p-2 hover:bg-gray-100 rounded cursor-pointer" onClick={onSelect}>
      <div className="flex items-center space-x-2">
        {token.logoURI?.startsWith("http") ? (
          <Image src={token.logoURI} alt={token.symbol} width={24} height={24} />
        ) : (
          <div className="w-6 h-6 bg-gray-300 rounded-full" />
        )}
        <div>
          <div className="font-medium">{token.symbol}</div>
          <div className="text-xs text-gray-500">{token.name}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm">${Number(token.priceUSD).toFixed(4) || "0.0000"}</div>
        {isConnected && (
          <div className="text-xs text-gray-500">
            {balance} {token.symbol} (${balanceInUSD})
          </div>
        )}
      </div>
    </div>
  );
}
