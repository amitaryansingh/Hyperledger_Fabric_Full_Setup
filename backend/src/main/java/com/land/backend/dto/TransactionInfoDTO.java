package com.land.backend.dto;

import java.time.Instant;
import java.util.List;

public class TransactionInfoDTO {
    private String transactionId;
    private Instant timestamp;
    private String creatorMspId;
    private String chaincodeName;
    private String functionName;
    private List<String> functionArgs;

    // Getters and Setters
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
    public String getCreatorMspId() { return creatorMspId; }
    public void setCreatorMspId(String creatorMspId) { this.creatorMspId = creatorMspId; }
    public String getChaincodeName() { return chaincodeName; }
    public void setChaincodeName(String chaincodeName) { this.chaincodeName = chaincodeName; }
    public List<String> getFunctionArgs() { return functionArgs; }
    public void setFunctionArgs(List<String> functionArgs) { this.functionArgs = functionArgs; }
}