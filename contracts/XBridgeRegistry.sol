// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title XBridgeRegistry
 * @dev A simple registry contract that records cross-chain transactions initiated through xBridge UI
 */
contract XBridgeRegistry {
    address public owner;
    uint256 public transactionCount;
    
    // Structure to store transaction details
    struct Transaction {
        address user;
        uint256 timestamp;
        string sourceChain;
        string targetChain;
        string sourceToken;
        string targetToken;
        uint256 amountIn;
        uint256 amountOut;
        string transactionHash;
        bool successful;
    }
    
    // Mapping from transaction ID to Transaction struct
    mapping(uint256 => Transaction) public transactions;
    
    // Mapping from user address to their transaction IDs
    mapping(address => uint256[]) public userTransactions;
    
    // Events
    event TransactionRegistered(
        uint256 indexed transactionId,
        address indexed user,
        string sourceChain,
        string targetChain
    );
    
    event TransactionStatusUpdated(
        uint256 indexed transactionId,
        bool successful
    );
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    /**
     * @dev Constructor to set owner
     */
    constructor() {
        owner = msg.sender;
        transactionCount = 0;
    }
    
    /**
     * @dev Register a new cross-chain transaction
     * @param _sourceChain The source blockchain name
     * @param _targetChain The target blockchain name
     * @param _sourceToken The token swapped from
     * @param _targetToken The token swapped to
     * @param _amountIn The input amount in smallest unit
     * @param _amountOut The output amount in smallest unit
     * @param _transactionHash The hash of the transaction on the source chain
     */
    function registerTransaction(
        string memory _sourceChain,
        string memory _targetChain,
        string memory _sourceToken,
        string memory _targetToken,
        uint256 _amountIn,
        uint256 _amountOut,
        string memory _transactionHash
    ) external returns (uint256) {
        uint256 transactionId = transactionCount;
        
        transactions[transactionId] = Transaction({
            user: msg.sender,
            timestamp: block.timestamp,
            sourceChain: _sourceChain,
            targetChain: _targetChain,
            sourceToken: _sourceToken,
            targetToken: _targetToken,
            amountIn: _amountIn,
            amountOut: _amountOut,
            transactionHash: _transactionHash,
            successful: false
        });
        
        userTransactions[msg.sender].push(transactionId);
        transactionCount++;
        
        emit TransactionRegistered(transactionId, msg.sender, _sourceChain, _targetChain);
        
        return transactionId;
    }
    
    /**
     * @dev Update the status of a transaction
     * @param _transactionId The ID of the transaction to update
     * @param _successful Whether the transaction was successful
     */
    function updateTransactionStatus(uint256 _transactionId, bool _successful) external {
        require(msg.sender == owner || msg.sender == transactions[_transactionId].user, "Unauthorized");
        require(_transactionId < transactionCount, "Transaction does not exist");
        
        transactions[_transactionId].successful = _successful;
        
        emit TransactionStatusUpdated(_transactionId, _successful);
    }
    
    /**
     * @dev Get transaction details by ID
     * @param _transactionId The ID of the transaction
     */
    function getTransaction(uint256 _transactionId) external view returns (
        address user,
        uint256 timestamp,
        string memory sourceChain,
        string memory targetChain,
        string memory sourceToken,
        string memory targetToken,
        uint256 amountIn,
        uint256 amountOut,
        string memory transactionHash,
        bool successful
    ) {
        require(_transactionId < transactionCount, "Transaction does not exist");
        Transaction memory txn = transactions[_transactionId];
        
        return (
            txn.user,
            txn.timestamp,
            txn.sourceChain,
            txn.targetChain,
            txn.sourceToken,
            txn.targetToken,
            txn.amountIn,
            txn.amountOut,
            txn.transactionHash,
            txn.successful
        );
    }
    
    /**
     * @dev Get all transaction IDs for a user
     * @param _user The address of the user
     */
    function getUserTransactions(address _user) external view returns (uint256[] memory) {
        return userTransactions[_user];
    }
    
    /**
     * @dev Get transaction count for a user
     * @param _user The address of the user
     */
    function getUserTransactionCount(address _user) external view returns (uint256) {
        return userTransactions[_user].length;
    }
    
    /**
     * @dev Transfer ownership of the contract
     * @param _newOwner The address of the new owner
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "New owner cannot be zero address");
        owner = _newOwner;
    }
}