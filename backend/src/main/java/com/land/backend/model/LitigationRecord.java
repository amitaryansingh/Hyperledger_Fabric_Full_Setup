package com.land.backend.model;

import jakarta.persistence.*;

import java.time.Instant;

@Embeddable
public class LitigationRecord {
    private Boolean isDisputed = false;
    private String caseNumber;
    private String courtName;
    private Instant filedOn;
    private String description;


    // Getters and Setters
    public Boolean getIsDisputed() { return isDisputed; }
    public void setIsDisputed(Boolean disputed) { isDisputed = disputed; }
    public String getCaseNumber() { return caseNumber; }
    public void setCaseNumber(String caseNumber) { this.caseNumber = caseNumber; }
    public String getCourtName() { return courtName; }
    public void setCourtName(String courtName) { this.courtName = courtName; }
    public Instant getFiledOn() { return filedOn; }
    public void setFiledOn(Instant filedOn) { this.filedOn = filedOn; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}