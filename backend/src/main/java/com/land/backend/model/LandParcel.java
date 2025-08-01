package com.land.backend.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "land_parcels")
public class LandParcel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String surveyNumber;

    private String village;
    private String tehsil;
    private Double area;
    private String acquisitionStatus; // e.g., "Notified", "Awarded", "Compensated"

    @OneToMany(mappedBy = "landParcel", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<Owner> owners;

    @Embedded
    private CompensationDetails compensationDetails; // <-- ADD THIS

    @Embedded
    private LitigationRecord litigation; // <-- ADD THIS

    // Add Getters and Setters for the new fields
    public CompensationDetails getCompensationDetails() { return compensationDetails; }
    public void setCompensationDetails(CompensationDetails compensationDetails) { this.compensationDetails = compensationDetails; }
    public LitigationRecord getLitigation() { return litigation; }
    public void setLitigation(LitigationRecord litigation) { this.litigation = litigation; }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSurveyNumber() {
        return surveyNumber;
    }

    public void setSurveyNumber(String surveyNumber) {
        this.surveyNumber = surveyNumber;
    }

    public String getVillage() {
        return village;
    }

    public void setVillage(String village) {
        this.village = village;
    }

    public String getTehsil() {
        return tehsil;
    }

    public void setTehsil(String tehsil) {
        this.tehsil = tehsil;
    }

    public Double getArea() {
        return area;
    }

    public void setArea(Double area) {
        this.area = area;
    }

    public String getAcquisitionStatus() {
        return acquisitionStatus;
    }

    public void setAcquisitionStatus(String acquisitionStatus) {
        this.acquisitionStatus = acquisitionStatus;
    }

    public List<Owner> getOwners() {
        return owners;
    }

    public void setOwners(List<Owner> owners) {
        this.owners = owners;
    }


}