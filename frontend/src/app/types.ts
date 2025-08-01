export interface Transaction {
    transactionId: string;
    timestamp: string;
    creatorMspId: string;
    chaincodeName: string;
    functionName: string;
    functionArgs: string[];
}

export interface Block {
    blockNumber: number;
    dataHash: string;
    previousHash: string;
    timestamp: string;
    transactions: Transaction[];
}