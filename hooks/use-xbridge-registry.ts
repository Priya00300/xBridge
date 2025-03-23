// hooks/use-xbridge-registry.ts
import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '@/hooks/use-wallet';

// Replace with your deployed contract address
const REGISTRY_CONTRACT_ADDRESS = '0x45f15e62cC71b8aba7b133D7A08CC1E14D7fa218';
const EDUCHAIN_RPC_URL = 'https://open-campus-codex-sepolia.drpc.org';

// ABI for your XBridgeRegistry contract (simplified for essential functions)
const REGISTRY_ABI = [
  "function registerTransaction(string _sourceChain, string _targetChain, string _sourceToken, string _targetToken, uint256 _amountIn, uint256 _amountOut, string _transactionHash) external returns (uint256)",
  "function updateTransactionStatus(uint256 _transactionId, bool _successful) external",
  "function getUserTransactions(address _user) external view returns (uint256[])",
  "function getTransaction(uint256 _transactionId) external view returns (address user, uint256 timestamp, string sourceChain, string targetChain, string sourceToken, string targetToken, uint256 amountIn, uint256 amountOut, string transactionHash, bool successful)"
];

interface Transaction {
  id: string;
  user: string;
  timestamp: Date;
  sourceChain: string;
  targetChain: string;
  sourceToken: string;
  targetToken: string;
  amountIn: string;
  amountOut: string;
  transactionHash: string;
  successful: boolean;
}

interface PendingTransaction {
  sourceChain: string;
  targetChain: string;
  sourceToken: string;
  targetToken: string;
  amountIn: string;
  amountOut: string;
  transactionHash: string;
  timestamp: number;
}

export const useXBridgeRegistry = () => {
  const { address, isConnected } = useWallet();
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTxId, setLastTxId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Create a contract instance for interacting with Educhain
  const getContract = useCallback(async () => {
    try {
      // Create a read-only provider for Educhain testnet
      const provider = new ethers.JsonRpcProvider(EDUCHAIN_RPC_URL);
      
      // Create contract instance - initially read-only
      let contract = new ethers.Contract(
        REGISTRY_CONTRACT_ADDRESS, 
        REGISTRY_ABI,
        provider
      );
      
      // If user is connected and has a browser wallet, try to get a signer
      if (window.ethereum && isConnected) {
        try {
          // Try to connect to Educhain testnet
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xA027C' }], // 656476 in hex
          });
          
          // Get signer from browser wallet
          const walletProvider = new ethers.BrowserProvider(window.ethereum);
          const signer = await walletProvider.getSigner();
          
          // Create contract with signer for write operations
          contract = new ethers.Contract(
            REGISTRY_CONTRACT_ADDRESS,
            REGISTRY_ABI,
            signer
          );
          
          return { contract, provider, signer, connected: true };
        } catch (switchError: any) {
          // If user rejects the network switch or it fails
          console.log("Failed to switch to Educhain:", switchError);
          return { contract, provider, connected: false };
        }
      }
      
      return { contract, provider, connected: false };
    } catch (err) {
      console.error('Error creating contract instance:', err);
      setError('Failed to connect to the registry contract');
      return { contract: null, provider: null, connected: false };
    }
  }, [isConnected]);

  // Register a new cross-chain transaction
  const registerTransaction = useCallback(async (
    sourceChain: string,
    targetChain: string,
    sourceToken: string,
    targetToken: string,
    amountIn: string,
    amountOut: string,
    transactionHash: string
  ) => {
    setIsRegistering(true);
    setError(null);
    
    try {
      const { contract, connected } = await getContract();
      
      if (!contract) {
        throw new Error('Failed to initialize contract');
      }
      
      if (!connected) {
        console.warn("Not connected to Educhain - using fallback method");
        // If not connected to Educhain, we can still record the transaction details
        // in local storage as a fallback, and try to submit them later
        const pendingTx: PendingTransaction = {
          sourceChain,
          targetChain,
          sourceToken,
          targetToken,
          amountIn,
          amountOut,
          transactionHash,
          timestamp: Date.now()
        };
        
        // Store pending transaction in local storage
        const pendingTxs = JSON.parse(localStorage.getItem('pendingRegistryTxs') || '[]');
        pendingTxs.push(pendingTx);
        localStorage.setItem('pendingRegistryTxs', JSON.stringify(pendingTxs));
        
        console.log("Transaction saved to local storage for later submission");
        return "pending";
      }
      
      // Convert amounts to wei format
      const amountInWei = ethers.parseUnits(amountIn.toString(), 18);
      const amountOutWei = ethers.parseUnits(amountOut.toString(), 18);
      
      // Call the contract function
      const tx = await contract.registerTransaction(
        sourceChain,
        targetChain,
        sourceToken,
        targetToken,
        amountInWei,
        amountOutWei,
        transactionHash
      );
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      // Find the transaction ID from the event logs
      const transactionRegisteredEvent = receipt.logs.find((log: any) => {
        try {
          const parsedLog = contract.interface.parseLog(log);
          return parsedLog?.name === 'TransactionRegistered';
        } catch {
          return false;
        }
      });
      
      let txId = null;
      if (transactionRegisteredEvent) {
        const parsedLog = contract.interface.parseLog(transactionRegisteredEvent);
        if (parsedLog) {
          txId = parsedLog.args[0].toString();
          setLastTxId(txId);
        }
      }
      
      return txId;
    } catch (err: any) {
      console.error('Error registering transaction:', err);
      setError(err.message || 'Failed to register transaction on Educhain');
      return null;
    } finally {
      setIsRegistering(false);
    }
  }, [getContract]);

  // Fetch all transactions for the current user
  const fetchUserTransactions = useCallback(async () => {
    if (!address) return [];
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { contract } = await getContract();
      
      if (!contract) {
        throw new Error('Contract not available');
      }
      
      // Get transaction IDs for the user
      const txIds = await contract.getUserTransactions(address);
      
      // Fetch details for each transaction
      const txPromises = txIds.map(async (id: bigint) => {
        const txDetails = await contract.getTransaction(id);
        
        // Format the transaction object
        return {
          id: id.toString(),
          user: txDetails[0],
          timestamp: new Date(Number(txDetails[1]) * 1000),
          sourceChain: txDetails[2],
          targetChain: txDetails[3],
          sourceToken: txDetails[4],
          targetToken: txDetails[5],
          amountIn: ethers.formatUnits(txDetails[6], 18),
          amountOut: ethers.formatUnits(txDetails[7], 18),
          transactionHash: txDetails[8],
          successful: txDetails[9]
        };
      });
      
      const transactions = await Promise.all(txPromises);
      setTransactions(transactions);
      return transactions;
    } catch (err: any) {
      console.error('Error fetching user transactions:', err);
      setError(err.message || 'Failed to fetch your transactions from Educhain');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [address, getContract]);

  // Update transaction status
  const updateStatus = useCallback(async (transactionId: string, successful: boolean) => {
    setError(null);
    
    try {
      const { contract, connected } = await getContract();
      
      if (!contract || !connected) {
        throw new Error('Contract not available or not connected to Educhain');
      }
      
      const tx = await contract.updateTransactionStatus(transactionId, successful);
      await tx.wait();
      
      // Refresh transactions after update
      await fetchUserTransactions();
      
      return true;
    } catch (err: any) {
      console.error('Error updating transaction status:', err);
      setError(err.message || 'Failed to update transaction status');
      return false;
    }
  }, [getContract, fetchUserTransactions]);

  // Try to submit any pending transactions stored in local storage
  const submitPendingTransactions = useCallback(async () => {
    const pendingTxs = JSON.parse(localStorage.getItem('pendingRegistryTxs') || '[]') as PendingTransaction[];
    if (pendingTxs.length === 0) return;
    
    const { contract, connected } = await getContract();
    if (!contract || !connected) return;
    
    const successfulSubmissions: PendingTransaction[] = [];
    
    for (const tx of pendingTxs) {
      try {
        const amountInWei = ethers.parseUnits(tx.amountIn.toString(), 18);
        const amountOutWei = ethers.parseUnits(tx.amountOut.toString(), 18);
        
        const txResponse = await contract.registerTransaction(
          tx.sourceChain,
          tx.targetChain,
          tx.sourceToken,
          tx.targetToken,
          amountInWei,
          amountOutWei,
          tx.transactionHash
        );
        
        await txResponse.wait();
        successfulSubmissions.push(tx);
      } catch (err) {
        console.error('Failed to submit pending transaction:', err);
      }
    }
    
    // Remove successful submissions from pending list
    if (successfulSubmissions.length > 0) {
      const remaining = pendingTxs.filter((tx) => 
        !successfulSubmissions.some((s) => s.transactionHash === tx.transactionHash)
      );
      localStorage.setItem('pendingRegistryTxs', JSON.stringify(remaining));
      
      // Refresh the transactions list
      await fetchUserTransactions();
    }
  }, [getContract, fetchUserTransactions]);

  // Check for pending transactions when hook is initialized
  useEffect(() => {
    if (isConnected) {
      submitPendingTransactions();
    }
  }, [isConnected, submitPendingTransactions]);

  return {
    registerTransaction,
    fetchUserTransactions,
    updateStatus,
    submitPendingTransactions,
    transactions,
    isRegistering,
    isLoading,
    error,
    lastTxId
  };
};