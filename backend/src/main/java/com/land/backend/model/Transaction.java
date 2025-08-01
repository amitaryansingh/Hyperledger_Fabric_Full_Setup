package com.land.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    private String transactionId;

    private String creatorMspId;
    private String chaincodeName;
    private String functionName;

    @Column(columnDefinition = "TEXT")
    private String functionArgs; // Storing args as a simple string for now

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "block_number")
    @JsonIgnore
    private Block block;


    // Getters and Setters
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    public String getCreatorMspId() { return creatorMspId; }
    public void setCreatorMspId(String creatorMspId) { this.creatorMspId = creatorMspId; }
    public String getChaincodeName() { return chaincodeName; }
    public void setChaincodeName(String chaincodeName) { this.chaincodeName = chaincodeName; }
    public String getFunctionName() { return functionName; }
    public void setFunctionName(String functionName) { this.functionName = functionName; }
    public String getFunctionArgs() { return functionArgs; }
    public void setFunctionArgs(String functionArgs) { this.functionArgs = functionArgs; }
    public Block getBlock() { return block; }
    public void setBlock(Block block) { this.block = block; }
}