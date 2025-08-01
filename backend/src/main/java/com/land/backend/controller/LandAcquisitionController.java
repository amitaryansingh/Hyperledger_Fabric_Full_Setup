package com.land.backend.controller;

import com.land.backend.model.CompensationDetails;
import com.land.backend.model.LandParcel;
import com.land.backend.model.LitigationRecord;
import com.land.backend.service.LandAcquisitionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/parcels")
public class LandAcquisitionController {

    private final LandAcquisitionService landAcquisitionService;

    @Autowired
    public LandAcquisitionController(LandAcquisitionService landAcquisitionService) {
        this.landAcquisitionService = landAcquisitionService;
    }

    // POST /api/parcels
    @PostMapping
    public ResponseEntity<?> createLandParcel(@RequestBody LandParcel landParcel) {
        try {
            return new ResponseEntity<>(landAcquisitionService.createLandParcel(landParcel), HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>("Error creating land parcel: " + e.getCause().getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // GET /api/parcels
    @GetMapping
    public ResponseEntity<List<LandParcel>> getAllLandParcels() {
        return new ResponseEntity<>(landAcquisitionService.getAllParcels(), HttpStatus.OK);
    }

    // GET /api/parcels/{surveyNumber}
    @GetMapping("/{surveyNumber}")
    public ResponseEntity<?> getParcelBySurveyNumber(@PathVariable String surveyNumber) {
        Optional<LandParcel> parcel = landAcquisitionService.getParcelBySurveyNumber(surveyNumber);
        if (parcel.isPresent()) {
            return new ResponseEntity<>(parcel.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Parcel with survey number " + surveyNumber + " not found.", HttpStatus.NOT_FOUND);
        }
    }

    // GET /api/parcels/ledger/{tehsil}/{surveyNumber}
        @GetMapping("/ledger/{tehsil}/{surveyNumber}")
    public ResponseEntity<?> getParcelFromLedger(@PathVariable String tehsil, @PathVariable String surveyNumber) {
        try {
            String ledgerData = landAcquisitionService.getParcelFromLedger(surveyNumber, tehsil);
            return new ResponseEntity<>(ledgerData, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error querying ledger: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // --- NEW: Declare Award Endpoint ---
    // POST /api/parcels/{surveyNumber}/award
    @PostMapping("/{surveyNumber}/award")
    public ResponseEntity<?> declareAward(@PathVariable String surveyNumber, @RequestBody CompensationDetails details) {
        try {
            return new ResponseEntity<>(landAcquisitionService.declareAward(surveyNumber, details), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error declaring award: " + e.getCause().getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // --- NEW: Record Individual Compensation Endpoint ---
    // POST /api/parcels/{surveyNumber}/compensate/{ownerAadhaar}
    @PostMapping("/{surveyNumber}/compensate/{ownerAadhaar}")
    public ResponseEntity<?> recordCompensation(
            @PathVariable String surveyNumber,
            @PathVariable String ownerAadhaar,
            @RequestParam Double amount) { // <-- Accept amount as a request parameter
        try {
            return new ResponseEntity<>(landAcquisitionService.recordIndividualCompensation(surveyNumber, ownerAadhaar, amount), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error recording compensation: " + e.getCause().getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // --- NEW: Raise Dispute Endpoint ---
    // POST /api/parcels/{surveyNumber}/dispute
    @PostMapping("/{surveyNumber}/dispute")
    public ResponseEntity<?> raiseDispute(@PathVariable String surveyNumber, @RequestBody LitigationRecord details) {
        try {
            return new ResponseEntity<>(landAcquisitionService.raiseDispute(surveyNumber, details), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error raising dispute: " + e.getCause().getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}