//package com.land.backend.service;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.land.backend.model.LandParcel;
//import com.land.backend.model.Owner;
//import com.land.backend.repository.LandParcelRepository;
//import org.hyperledger.fabric.gateway.Contract;
//import org.hyperledger.fabric.gateway.Gateway;
//import org.hyperledger.fabric.gateway.Network;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.nio.charset.StandardCharsets;
//import java.util.List;
//import java.util.Optional;
//
//@Service
//public class LandAcquisitionService {
//
//    private final LandParcelRepository landParcelRepository;
//    private final Gateway fabricGateway;
//    private final ObjectMapper objectMapper = new ObjectMapper();
//
//    @Autowired
//    public LandAcquisitionService(LandParcelRepository landParcelRepository, Gateway fabricGateway) {
//        this.landParcelRepository = landParcelRepository;
//        this.fabricGateway = fabricGateway;
//    }
//
//    /**
//     * Creates a new land parcel record.
//     * 1. Saves the digitized record to the PostgreSQL database.
//     * 2. Submits an immutable transaction to the Hyperledger Fabric ledger.
//     *
//     * @param landParcel The LandParcel object to be created.
//     * @return The saved LandParcel object from the database.
//     * @throws Exception if the blockchain transaction fails.
//     */
//    @Transactional
//    public LandParcel createLandParcel(LandParcel landParcel) throws Exception {
//        // Ensure bidirectional relationship is set for JPA persistence
//        if (landParcel.getOwners() != null) {
//            for (Owner owner : landParcel.getOwners()) {
//                owner.setLandParcel(landParcel);
//            }
//        }
//
//        // Step 1: Save the record to the primary (PostgreSQL) database.
//        // The 'id' field will be auto-generated as a Long here.
//        LandParcel savedParcel = landParcelRepository.save(landParcel);
//
//        // Step 2: Log the creation on the blockchain.
//        try {
//            Network network = fabricGateway.getNetwork("landchannel");
//            Contract contract = network.getContract("landcc");
//
//            // --- THE FIX IS HERE ---
//            // Create the unique String ID required by the chaincode.
//            String blockchainId = String.format("%s-%s", savedParcel.getTehsil().toUpperCase(), savedParcel.getSurveyNumber());
//
//            // Use a temporary Map to create the JSON payload for the chaincode.
//            // This keeps the database object clean and sends the correct ID format to the blockchain.
//            java.util.Map<String, Object> blockchainData = objectMapper.convertValue(savedParcel, java.util.Map.class);
//            blockchainData.put("id", blockchainId); // Overwrite the numeric ID with the String ID
//            String parcelJson = objectMapper.writeValueAsString(blockchainData);
//            // --- END OF FIX ---
//
//            // Submit the transaction to the 'CreateLandParcel' function in the smart contract
//            contract.submitTransaction("CreateLandParcel", parcelJson);
//
//        } catch (Exception e) {
//            // If blockchain transaction fails, the @Transactional annotation will roll back the database save.
//            throw new RuntimeException("Failed to submit transaction to the blockchain: " + e.getMessage(), e);
//        }
//
//        return savedParcel;
//    }
//
//    // We will add more methods here later for searching, updating, etc.
//
//    /**
//     * Retrieves all land parcels from the PostgreSQL database.
//     * @return A list of all LandParcel objects.
//     */
//    public List<LandParcel> getAllParcels() {
//        return landParcelRepository.findAll();
//    }
//
//    /**
//     * Retrieves a single land parcel from the PostgreSQL database by its survey number.
//     * @param surveyNumber The unique survey number.
//     * @return An Optional containing the LandParcel if found.
//     */
//    public Optional<LandParcel> getParcelBySurveyNumber(String surveyNumber) {
//        return landParcelRepository.findBySurveyNumber(surveyNumber);
//    }
//
//    /**
//     * Queries the blockchain ledger to get the immutable record of a land parcel.
//     * @param surveyNumber The survey number of the parcel.
//     * @param tehsil The tehsil of the parcel.
//     * @return The land parcel data as a JSON string from the ledger.
//     * @throws Exception if the transaction fails.
//     */
//    public String getParcelFromLedger(String surveyNumber, String tehsil) throws Exception {
//        try {
//            Network network = fabricGateway.getNetwork("landchannel");
//            Contract contract = network.getContract("landcc");
//
//            String blockchainId = String.format("%s-%s", tehsil.toUpperCase(), surveyNumber);
//            byte[] result = contract.evaluateTransaction("QueryLandParcel", blockchainId);
//
//            return new String(result, StandardCharsets.UTF_8);
//        } catch (Exception e) {
//            throw new RuntimeException("Failed to query the blockchain: " + e.getMessage(), e);
//        }
//    }
//}










//package com.land.backend.service;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
//import com.land.backend.model.CompensationDetails;
//import com.land.backend.model.LandParcel;
//import com.land.backend.model.LitigationRecord;
//import com.land.backend.model.Owner;
//import com.land.backend.repository.LandParcelRepository;
//import org.hyperledger.fabric.gateway.Contract;
//import org.hyperledger.fabric.gateway.Gateway;
//import org.hyperledger.fabric.gateway.Network;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.nio.charset.StandardCharsets;
//import java.util.List;
//import java.util.Optional;
//
//@Service
//public class LandAcquisitionService {
//
//    private final LandParcelRepository landParcelRepository;
//    private final Gateway fabricGateway;
//    private final ObjectMapper objectMapper;
//
//    @Autowired
//    public LandAcquisitionService(LandParcelRepository landParcelRepository, Gateway fabricGateway) {
//        this.landParcelRepository = landParcelRepository;
//        this.fabricGateway = fabricGateway;
//        // Configure ObjectMapper to handle Java Time objects correctly
//        this.objectMapper = new ObjectMapper();
//        this.objectMapper.registerModule(new JavaTimeModule());
//        this.objectMapper.configure(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
//    }
//
//    private String getBlockchainId(LandParcel parcel) {
//        return String.format("%s-%s", parcel.getTehsil().toUpperCase(), parcel.getSurveyNumber());
//    }
//
//    @Transactional
//    public LandParcel createLandParcel(LandParcel landParcel) throws Exception {
//        if (landParcel.getOwners() != null) {
//            for (Owner owner : landParcel.getOwners()) {
//                owner.setLandParcel(landParcel);
//            }
//        }
//        LandParcel savedParcel = landParcelRepository.save(landParcel);
//        try {
//            Network network = fabricGateway.getNetwork("landchannel");
//            Contract contract = network.getContract("landcc");
//            java.util.Map<String, Object> blockchainData = objectMapper.convertValue(savedParcel, java.util.Map.class);
//            blockchainData.put("id", getBlockchainId(savedParcel));
//            String parcelJson = objectMapper.writeValueAsString(blockchainData);
//            contract.submitTransaction("CreateLandParcel", parcelJson);
//        } catch (Exception e) {
//            throw new RuntimeException("Blockchain transaction failed: " + e.getMessage(), e);
//        }
//        return savedParcel;
//    }
//
//    @Transactional
//    public LandParcel declareAward(String surveyNumber, CompensationDetails compensationDetails) throws Exception {
//        LandParcel parcel = landParcelRepository.findBySurveyNumber(surveyNumber)
//                .orElseThrow(() -> new RuntimeException("Parcel not found with survey number: " + surveyNumber));
//        parcel.setCompensationDetails(compensationDetails);
//        parcel.setAcquisitionStatus("Awarded");
//        LandParcel updatedParcel = landParcelRepository.save(parcel);
//        try {
//            Network network = fabricGateway.getNetwork("landchannel");
//            Contract contract = network.getContract("landcc");
//            String compensationJson = objectMapper.writeValueAsString(compensationDetails);
//            contract.submitTransaction("DeclareAward", getBlockchainId(updatedParcel), compensationJson);
//        } catch (Exception e) {
//            throw new RuntimeException("Blockchain transaction failed: " + e.getMessage(), e);
//        }
//        return updatedParcel;
//    }
//
//    // --- THIS IS THE CORRECTED METHOD ---
//    // In LandAcquisitionService.java
//    @Transactional
//    public LandParcel recordIndividualCompensation(String surveyNumber, String ownerAadhaar, Double amount) throws Exception {
//        LandParcel parcel = landParcelRepository.findBySurveyNumber(surveyNumber)
//                .orElseThrow(() -> new RuntimeException("Parcel not found with survey number: " + surveyNumber));
//
//        String txId;
//        try {
//            Network network = fabricGateway.getNetwork("landchannel");
//            Contract contract = network.getContract("landcc");
//            // Pass the amount as the third argument
//            byte[] result = contract.submitTransaction("RecordIndividualCompensation", getBlockchainId(parcel), ownerAadhaar, String.valueOf(amount));
//            txId = new String(result, StandardCharsets.UTF_8);
//        } catch (Exception e) {
//            throw new RuntimeException("Blockchain transaction failed: " + e.getMessage(), e);
//        }
//
//        Owner ownerToUpdate = parcel.getOwners().stream()
//                .filter(o -> o.getAadhaar().equals(ownerAadhaar))
//                .findFirst()
//                .orElseThrow(() -> new RuntimeException("Owner with Aadhaar " + ownerAadhaar + " not found."));
//
//        ownerToUpdate.setIsPaid(true);
//        ownerToUpdate.setPaidAmount(amount);
//        ownerToUpdate.setPaymentTxId(txId);
//
//        boolean allPaid = parcel.getOwners().stream().allMatch(o -> o.getIsPaid() != null && o.getIsPaid());
//        if (allPaid) {
//            parcel.setAcquisitionStatus("Compensated");
//        }
//
//        return landParcelRepository.save(parcel);
//    }
//
//    @Transactional
//    public LandParcel raiseDispute(String surveyNumber, LitigationRecord litigationRecord) throws Exception {
//        LandParcel parcel = landParcelRepository.findBySurveyNumber(surveyNumber)
//                .orElseThrow(() -> new RuntimeException("Parcel not found with survey number: " + surveyNumber));
//
//        parcel.setLitigation(litigationRecord);
//        parcel.setAcquisitionStatus("Disputed");
//        LandParcel updatedParcel = landParcelRepository.save(parcel);
//
//        try {
//            Network network = fabricGateway.getNetwork("landchannel");
//            Contract contract = network.getContract("landcc");
//            String litigationJson = objectMapper.writeValueAsString(litigationRecord);
//            contract.submitTransaction("RaiseDispute", getBlockchainId(updatedParcel), litigationJson);
//        } catch (Exception e) {
//            throw new RuntimeException("Blockchain transaction failed: " + e.getMessage(), e);
//        }
//        return updatedParcel;
//    }
//
//    // --- Query Methods (already implemented) ---
//    public List<LandParcel> getAllParcels() { return landParcelRepository.findAll(); }
//    public Optional<LandParcel> getParcelBySurveyNumber(String surveyNumber) { return landParcelRepository.findBySurveyNumber(surveyNumber); }
//
//        public String getParcelFromLedger(String surveyNumber, String tehsil) throws Exception {
//        try {
//            Network network = fabricGateway.getNetwork("landchannel");
//            Contract contract = network.getContract("landcc");
//
//            String blockchainId = String.format("%s-%s", tehsil.toUpperCase(), surveyNumber);
//            byte[] result = contract.evaluateTransaction("QueryLandParcel", blockchainId);
//
//            return new String(result, StandardCharsets.UTF_8);
//        } catch (Exception e) {
//            throw new RuntimeException("Failed to query the blockchain: " + e.getMessage(), e);
//        }
//    }
//}


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
            java.util.Map<String, Object> blockchainData = objectMapper.convertValue(savedParcel, java.util.Map.class);
            blockchainData.put("id", getBlockchainId(savedParcel));
            String parcelJson = objectMapper.writeValueAsString(blockchainData);
            contract.submitTransaction("CreateLandParcel", parcelJson);
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