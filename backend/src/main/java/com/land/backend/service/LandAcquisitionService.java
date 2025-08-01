package com.land.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.land.backend.model.CompensationDetails;
import com.land.backend.model.LandParcel;
import com.land.backend.model.LitigationRecord;
import com.land.backend.model.Owner;
import com.land.backend.repository.LandParcelRepository;
import org.hyperledger.fabric.gateway.Contract;
import org.hyperledger.fabric.gateway.Gateway;
import org.hyperledger.fabric.gateway.Network;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;

@Service
public class LandAcquisitionService {

    private final LandParcelRepository landParcelRepository;
    private final Gateway fabricGateway;
    private final ObjectMapper objectMapper;

    @Autowired
    public LandAcquisitionService(LandParcelRepository landParcelRepository, Gateway fabricGateway) {
        this.landParcelRepository = landParcelRepository;
        this.fabricGateway = fabricGateway;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        this.objectMapper.configure(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
    }

    // Helper method to get the Blockchain ID from a LandParcel object
    private String getBlockchainId(LandParcel parcel) {
        return getBlockchainId(parcel.getTehsil(), parcel.getSurveyNumber());
    }

    // *** THIS IS THE FIX: An overloaded version of the method for when we only have strings ***
    private String getBlockchainId(String tehsil, String surveyNumber) {
        String cleanSurveyNumber = surveyNumber.toUpperCase();
        String cleanTehsil = tehsil.toUpperCase();
        // Prevent duplication if the prefix is already there
        if (cleanSurveyNumber.startsWith(cleanTehsil + "-")) {
            return cleanSurveyNumber;
        }
        return String.format("%s-%s", cleanTehsil, cleanSurveyNumber);
    }

    @Transactional
    public LandParcel createLandParcel(LandParcel landParcel) throws Exception {
        if (landParcelRepository.findBySurveyNumber(landParcel.getSurveyNumber()).isPresent()) {
            throw new IllegalStateException("A land parcel with survey number '" + landParcel.getSurveyNumber() + "' already exists.");
        }
        if (landParcel.getOwners() != null) {
            for (Owner owner : landParcel.getOwners()) {
                owner.setLandParcel(landParcel);
            }
        }
        LandParcel savedParcel = landParcelRepository.save(landParcel);
        try {
            Network network = fabricGateway.getNetwork("landchannel");
            Contract contract = network.getContract("landcc");

            // *** THIS IS THE FIX ***
            // We now pass each argument individually to the chaincode function.
            String blockchainId = getBlockchainId(savedParcel);
            String surveyNumber = savedParcel.getSurveyNumber();
            String village = savedParcel.getVillage();
            String tehsil = savedParcel.getTehsil();
            String area = String.valueOf(savedParcel.getArea());
            String ownersJson = objectMapper.writeValueAsString(savedParcel.getOwners());

            contract.submitTransaction("CreateLandParcel", blockchainId, surveyNumber, village, tehsil, area, ownersJson);

        } catch (Exception e) {
            throw new RuntimeException("Blockchain transaction failed: " + e.getMessage(), e);
        }
        return savedParcel;
    }

    @Transactional
    public LandParcel declareAward(String surveyNumber, CompensationDetails compensationDetails) throws Exception {
        LandParcel parcel = landParcelRepository.findBySurveyNumber(surveyNumber)
                .orElseThrow(() -> new RuntimeException("Parcel not found with survey number: " + surveyNumber));
        parcel.setCompensationDetails(compensationDetails);
        parcel.setAcquisitionStatus("Awarded");
        LandParcel updatedParcel = landParcelRepository.save(parcel);
        try {
            Network network = fabricGateway.getNetwork("landchannel");
            Contract contract = network.getContract("landcc");
            String compensationJson = objectMapper.writeValueAsString(compensationDetails);
            contract.submitTransaction("DeclareAward", getBlockchainId(updatedParcel), compensationJson);
        } catch (Exception e) {
            throw new RuntimeException("Blockchain transaction failed: " + e.getMessage(), e);
        }
        return updatedParcel;
    }

    @Transactional
    public LandParcel recordIndividualCompensation(String surveyNumber, String ownerAadhaar, Double amount) throws Exception {
        LandParcel parcel = landParcelRepository.findBySurveyNumber(surveyNumber)
                .orElseThrow(() -> new RuntimeException("Parcel not found with survey number: " + surveyNumber));
        String blockchainId = getBlockchainId(parcel);
        String txId;
        try {
            Network network = fabricGateway.getNetwork("landchannel");
            Contract contract = network.getContract("landcc");
            byte[] result = contract.submitTransaction("RecordIndividualCompensation", blockchainId, ownerAadhaar, String.valueOf(amount));
            txId = new String(result, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Blockchain transaction failed: " + e.getMessage(), e);
        }
        Owner ownerToUpdate = parcel.getOwners().stream()
                .filter(o -> o.getAadhaar().equals(ownerAadhaar))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Owner with Aadhaar " + ownerAadhaar + " not found."));
        ownerToUpdate.setIsPaid(true);
        ownerToUpdate.setPaidAmount(amount);
        ownerToUpdate.setPaymentTxId(txId);
        boolean allPaid = parcel.getOwners().stream().allMatch(o -> o.getIsPaid() != null && o.getIsPaid());
        if (allPaid) {
            parcel.setAcquisitionStatus("Compensated");
        }
        return landParcelRepository.save(parcel);
    }

    @Transactional
    public LandParcel raiseDispute(String surveyNumber, LitigationRecord litigationRecord) throws Exception {
        LandParcel parcel = landParcelRepository.findBySurveyNumber(surveyNumber)
                .orElseThrow(() -> new RuntimeException("Parcel not found with survey number: " + surveyNumber));
        String blockchainId = getBlockchainId(parcel);
        parcel.setLitigation(litigationRecord);
        parcel.setAcquisitionStatus("Disputed");
        LandParcel updatedParcel = landParcelRepository.save(parcel);
        try {
            Network network = fabricGateway.getNetwork("landchannel");
            Contract contract = network.getContract("landcc");
            String litigationJson = objectMapper.writeValueAsString(litigationRecord);
            contract.submitTransaction("RaiseDispute", blockchainId, litigationJson);
        } catch (Exception e) {
            throw new RuntimeException("Blockchain transaction failed: " + e.getMessage(), e);
        }
        return updatedParcel;
    }

    public List<LandParcel> getAllParcels() { return landParcelRepository.findAll(); }
    public Optional<LandParcel> getParcelBySurveyNumber(String surveyNumber) { return landParcelRepository.findBySurveyNumber(surveyNumber); }

    public String getParcelFromLedger(String surveyNumber, String tehsil) throws Exception {
        // We keep the robust ID generation logic
        String blockchainId = getBlockchainId(tehsil, surveyNumber);
        try {
            Network network = fabricGateway.getNetwork("landchannel");
            Contract contract = network.getContract("landcc");

            // Fetch the raw JSON data from the ledger
            byte[] result = contract.evaluateTransaction("QueryLandParcel", blockchainId);

            // Return the raw JSON string directly, without trying to parse it.
            // This is more robust and avoids schema mismatch errors.
            return new String(result, StandardCharsets.UTF_8);

        } catch (Exception e) {
            throw new RuntimeException("Failed to query the blockchain: " + e.getMessage(), e);
        }
    }
}