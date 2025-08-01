package com.land.backend.model;

import jakarta.persistence.Embeddable;

@Embeddable
public class CompensationDetails {
    private Double landValue = 0.0;
    private Double structureValue = 0.0;
    private Double treeValue = 0.0;
    private Double cropValue = 0.0;
    private Double totalAmount = 0.0;

    // Getters and Setters
    public Double getLandValue() { return landValue; }
    public void setLandValue(Double landValue) { this.landValue = landValue; }
    public Double getStructureValue() { return structureValue; }
    public void setStructureValue(Double structureValue) { this.structureValue = structureValue; }
    public Double getTreeValue() { return treeValue; }
    public void setTreeValue(Double treeValue) { this.treeValue = treeValue; }
    public Double getCropValue() { return cropValue; }
    public void setCropValue(Double cropValue) { this.cropValue = cropValue; }
    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
}