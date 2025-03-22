"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { chains } from "@/shared/constants/chains" // Updated import

// Use LiFi API for chain icons
const getChainIcon = (chain: any) => {
    return chain.logoURI || "/fallback-icon.png";
};

interface ChainSelectorProps {
  selectedChain: any;
  onSelectChain: (chain: any) => void;
  zIndex?: number;
}

export default function ChainSelector({ selectedChain, onSelectChain, zIndex = 30 }: ChainSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="relative z-40">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <button className="bg-gray-50 rounded-lg p-3 w-full flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src={getChainIcon(selectedChain)} 
                alt={selectedChain.name} 
                className="w-6 h-6 mr-2 rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/fallback-icon.png";
                }}
              />
              <span className="font-medium">{selectedChain.name}</span>
            </div>
            <ChevronDown size={20} className="text-gray-400" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[240px] p-2 z-50">
          <input
            type="text"
            placeholder="Search chains"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 text-sm border rounded-md focus:ring-2 focus:ring-red-500 mb-2"
          />
          <div className="max-h-[300px] overflow-y-auto">
            {chains
              .filter(chain =>
                chain.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map(chain => (
                <ChainItem
                  key={chain.id}
                  chain={chain}
                  onSelect={() => {
                    onSelectChain(chain)
                    setIsOpen(false)
                    setSearchQuery("")
                  }}
                />
              ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function ChainItem({ chain, onSelect }: { chain: any, onSelect: () => void }) {
  return (
    <div 
      className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer"
      onClick={onSelect}
    >
      <img 
        src={getChainIcon(chain)} 
        alt={chain.name} 
        className="w-6 h-6 mr-2 rounded-full"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "/fallback-icon.png";
        }}
      />
      <span>{chain.name}</span>
    </div>
  )
}
