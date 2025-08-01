package com.land.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "owners")
public class Owner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String aadhaar;
    private String bankInfo;
    private Double share;
    private Boolean isPaid = false;
    private Double paidAmount = 0.0;
    private String paymentTxId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "land_parcel_id")
    @JsonIgnore // Prevents infinite recursion in JSON serialization
    private LandParcel landParcel;

    // Getters and Setters

    public Double getShare() {
        return share;
    }

    public void setShare(Double share) {
        this.share = share;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAadhaar() {
        return aadhaar;
    }

    public void setAadhaar(String aadhaar) {
        this.aadhaar = aadhaar;
    }

    public String getBankInfo() {
        return bankInfo;
    }

    public void setBankInfo(String bankInfo) {
        this.bankInfo = bankInfo;
    }

    public LandParcel getLandParcel() {
        return landParcel;
    }

    public void setLandParcel(LandParcel landParcel) {
        this.landParcel = landParcel;
    }

    public Double getPaidAmount() { return paidAmount; }
    public void setPaidAmount(Double paidAmount) { this.paidAmount = paidAmount; }

    public Boolean getIsPaid() { return isPaid; }
    public void setIsPaid(Boolean isPaid) { this.isPaid = isPaid; }

    public String getPaymentTxId() { return paymentTxId; }
    public void setPaymentTxId(String paymentTxId) { this.paymentTxId = paymentTxId; }



}