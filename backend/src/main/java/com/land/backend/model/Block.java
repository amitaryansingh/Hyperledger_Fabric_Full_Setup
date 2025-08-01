package com.land.backend.model;

import jakarta.persistence.*;
import org.hyperledger.fabric.protos.peer.TransactionPackage;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "blocks")
public class Block {

    @Id
    private Long blockNumber;

    @Column(unique = true)
    private String dataHash;
    private String previousHash;
    private Instant timestamp;

    @OneToMany(mappedBy = "block", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Transaction> transactions = new ArrayList<>();

    // Getters and Setters
    public Long getBlockNumber() { return blockNumber; }
    public void setBlockNumber(Long blockNumber) { this.blockNumber = blockNumber; }
    public String getDataHash() { return dataHash; }
    public void setDataHash(String dataHash) { this.dataHash = dataHash; }
    public String getPreviousHash() { return previousHash; }
    public void setPreviousHash(String previousHash) { this.previousHash = previousHash; }
    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
    public List<Transaction> getTransactions() { return transactions; }
    public void setTransactions(List<Transaction> transactions) { this.transactions = transactions; }
}