package com.land.backend.dto;

import java.time.Instant;
import java.util.List;

public class BlockInfoDTO {
    private long blockNumber;
    private String dataHash;
    private String previousHash;
    private Instant timestamp;
    private List<TransactionInfoDTO> transactions;

    // Getters and Setters
    public long getBlockNumber() { return blockNumber; }
    public void setBlockNumber(long blockNumber) { this.blockNumber = blockNumber; }
    public String getDataHash() { return dataHash; }
    public void setDataHash(String dataHash) { this.dataHash = dataHash; }
    public String getPreviousHash() { return previousHash; }
    public void setPreviousHash(String previousHash) { this.previousHash = previousHash; }
    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
    public List<TransactionInfoDTO> getTransactions() { return transactions; }
    public void setTransactions(List<TransactionInfoDTO> transactions) { this.transactions = transactions; }
}