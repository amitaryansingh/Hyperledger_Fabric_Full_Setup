// // fabric-network/chaincode/landcc/land.go
// package main

// import (
// 	"encoding/json"
// 	"fmt"
// 	"github.com/hyperledger/fabric-contract-api-go/contractapi"
// )

// // SmartContract provides functions for managing land records.
// type SmartContract struct {
// 	contractapi.Contract
// }

// // InitLedger adds a base set of land parcels to the ledger.
// func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
// 	// Sample data can be added here for testing purposes
// 	fmt.Println("Land Ledger Initialized")
// 	return nil
// }

// // CreateLandParcel issues a new land parcel to the world state with given details.
// // This is the core function for digitizing a new record[cite: 14].
// func (s *SmartContract) CreateLandParcel(ctx contractapi.TransactionContextInterface, parcelJSON string) error {
// 	var parcel LandParcel
// 	err := json.Unmarshal([]byte(parcelJSON), &parcel)
// 	if err != nil {
// 		return fmt.Errorf("failed to unmarshal JSON: %v", err)
// 	}

// 	exists, err := s.LandParcelExists(ctx, parcel.ID)
// 	if err != nil {
// 		return err
// 	}
// 	if exists {
// 		return fmt.Errorf("the land parcel %s already exists", parcel.ID)
// 	}

// 	parcelAsBytes, err := json.Marshal(parcel)
// 	if err != nil {
// 		return err
// 	}

// 	return ctx.GetStub().PutState(parcel.ID, parcelAsBytes)
// }

// // QueryLandParcel returns the land parcel stored in the world state with given id.
// func (s *SmartContract) QueryLandParcel(ctx contractapi.TransactionContextInterface, id string) (*LandParcel, error) {
// 	parcelAsBytes, err := ctx.GetStub().GetState(id)
// 	if err != nil {
// 		return nil, fmt.Errorf("failed to read from world state: %v", err)
// 	}
// 	if parcelAsBytes == nil {
// 		return nil, fmt.Errorf("the land parcel %s does not exist", id)
// 	}

// 	var parcel LandParcel
// 	err = json.Unmarshal(parcelAsBytes, &parcel)
// 	if err != nil {
// 		return nil, err
// 	}

// 	return &parcel, nil
// }

// // RecordCompensationPayment updates the status of a parcel to 'Compensated'[cite: 36].
// func (s *SmartContract) RecordCompensationPayment(ctx contractapi.TransactionContextInterface, id string) error {
// 	parcel, err := s.QueryLandParcel(ctx, id)
// 	if err != nil {
// 		return err
// 	}

// 	parcel.AcquisitionStatus = "Compensated"
// 	// Logic to mark individual owners as paid can be added here
// 	for i := range parcel.Owners {
// 		parcel.Owners[i].IsPaid = true
// 	}

// 	parcelAsBytes, err := json.Marshal(parcel)
// 	if err != nil {
// 		return err
// 	}

// 	return ctx.GetStub().PutState(id, parcelAsBytes)
// }

// // LandParcelExists returns true when a land parcel with given ID exists in world state.
// func (s *SmartContract) LandParcelExists(ctx contractapi.TransactionContextInterface, id string) (bool, error) {
// 	parcelAsBytes, err := ctx.GetStub().GetState(id)
// 	if err != nil {
// 		return false, fmt.Errorf("failed to read from world state: %v", err)
// 	}

// 	return parcelAsBytes != nil, nil
// }

// // Main function to start the chaincode
// func main() {
// 	chaincode, err := contractapi.NewChaincode(&SmartContract{})
// 	if err != nil {
// 		fmt.Printf("Error creating landcc chaincode: %v", err)
// 		return
// 	}

// 	if err := chaincode.Start(); err != nil {
// 		fmt.Printf("Error starting landcc chaincode: %v", err)
// 	}
// }

package main

import (
	"encoding/json"
	"fmt"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// SmartContract provides functions for managing land records.
type SmartContract struct {
	contractapi.Contract
}

// A helper function to get submitter's identity
func getSubmitter(ctx contractapi.TransactionContextInterface) (string, error) {
	id, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return "", fmt.Errorf("failed to get client ID: %v", err)
	}
	return id, nil
}

// A helper function to add an entry to the parcel's history
func addHistory(ctx contractapi.TransactionContextInterface, parcel *LandParcel, message string) error {
	submitter, err := getSubmitter(ctx)
	if err != nil {
		return err
	}
	ts, _ := ctx.GetStub().GetTxTimestamp()
	entry := HistoryEntry{
		TxId:      ctx.GetStub().GetTxID(),
		Timestamp: ts.AsTime(),
		Message:   message,
		Submitter: submitter,
	}
	parcel.History = append(parcel.History, entry)
	parcel.LastUpdated = entry.Timestamp
	parcel.LastUpdatedBy = submitter
	return nil
}

// A helper function to emit a chaincode event
func emitEvent(ctx contractapi.TransactionContextInterface, eventType, parcelID, message string) error {
	eventPayload := ParcelEvent{
		ParcelID: parcelID,
		Type:     eventType,
		Message:  message,
	}
	payloadBytes, err := json.Marshal(eventPayload)
	if err != nil {
		return fmt.Errorf("failed to marshal event payload: %v", err)
	}
	return ctx.GetStub().SetEvent(eventType, payloadBytes)
}

// CreateLandParcel issues a new land parcel to the world state.
func (s *SmartContract) CreateLandParcel(ctx contractapi.TransactionContextInterface, parcelJSON string) error {
	var parcel LandParcel
	if err := json.Unmarshal([]byte(parcelJSON), &parcel); err != nil {
		return fmt.Errorf("failed to unmarshal JSON: %v", err)
	}

	exists, err := s.LandParcelExists(ctx, parcel.ID)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("the land parcel %s already exists", parcel.ID)
	}

	if err := addHistory(ctx, &parcel, "Land parcel record created and digitized."); err != nil {
		return err
	}
	parcel.AcquisitionStatus = "Notified"

	parcelAsBytes, _ := json.Marshal(parcel)
	if err := emitEvent(ctx, "ParcelCreated", parcel.ID, "A new land parcel was digitized."); err != nil {
		return err
	}
	return ctx.GetStub().PutState(parcel.ID, parcelAsBytes)
}

// DeclareAward updates the status of a parcel to 'Awarded'.
func (s *SmartContract) DeclareAward(ctx contractapi.TransactionContextInterface, id string, compensationJSON string) error {
	parcel, err := s.QueryLandParcel(ctx, id)
	if err != nil {
		return err
	}

	var comp CompensationDetails
	if err := json.Unmarshal([]byte(compensationJSON), &comp); err != nil {
		return fmt.Errorf("failed to unmarshal compensation JSON: %v", err)
	}
	parcel.CompensationDetails = comp
	parcel.AcquisitionStatus = "Awarded"
	if err := addHistory(ctx, parcel, fmt.Sprintf("Award declared with total compensation of %.2f", comp.TotalAmount)); err != nil {
		return err
	}

	parcelAsBytes, _ := json.Marshal(parcel)
	if err := emitEvent(ctx, "AwardDeclared", parcel.ID, "Compensation award was declared."); err != nil {
		return err
	}
	return ctx.GetStub().PutState(id, parcelAsBytes)
}

// Replace the existing function with this one
func (s *SmartContract) RecordIndividualCompensation(ctx contractapi.TransactionContextInterface, id string, ownerAadhaar string, amount float64) (string, error) {
	parcel, err := s.QueryLandParcel(ctx, id)
	if err != nil {
		return "", err
	}

	ownerFound := false
	allPaid := true
	for i, owner := range parcel.Owners {
		if owner.Aadhaar == ownerAadhaar {
			parcel.Owners[i].IsPaid = true
			parcel.Owners[i].PaidAmount = amount // <-- SET THE PAID AMOUNT
			parcel.Owners[i].PaymentTxId = ctx.GetStub().GetTxID()
			ownerFound = true
		}
		if !parcel.Owners[i].IsPaid {
			allPaid = false
		}
	}
	if !ownerFound {
		return "", fmt.Errorf("owner with Aadhaar %s not found for this parcel", ownerAadhaar)
	}

	if allPaid {
		parcel.AcquisitionStatus = "Compensated"
	}

	message := fmt.Sprintf("Compensation of %.2f paid to owner with Aadhaar %s", amount, ownerAadhaar)
	if err := addHistory(ctx, parcel, message); err != nil {
		return "", err
	}

	parcelAsBytes, _ := json.Marshal(parcel)
	if err := emitEvent(ctx, "PaymentRecorded", parcel.ID, message); err != nil {
		return "", err
	}

	err = ctx.GetStub().PutState(id, parcelAsBytes)
	if err != nil {
		return "", err
	}
	return ctx.GetStub().GetTxID(), nil
}

// RaiseDispute records a litigation issue against a parcel.
func (s *SmartContract) RaiseDispute(ctx contractapi.TransactionContextInterface, id string, litigationJSON string) error {
	parcel, err := s.QueryLandParcel(ctx, id)
	if err != nil {
		return err
	}

	var lit LitigationRecord
	if err := json.Unmarshal([]byte(litigationJSON), &lit); err != nil {
		return fmt.Errorf("failed to unmarshal litigation JSON: %v", err)
	}
	lit.IsDisputed = true
	parcel.Litigation = &lit
	parcel.AcquisitionStatus = "Disputed"

	if err := addHistory(ctx, parcel, fmt.Sprintf("Litigation dispute raised. Case No: %s", lit.CaseNumber)); err != nil {
		return err
	}

	parcelAsBytes, _ := json.Marshal(parcel)
	if err := emitEvent(ctx, "DisputeRaised", parcel.ID, "A litigation dispute was raised."); err != nil {
		return err
	}
	return ctx.GetStub().PutState(id, parcelAsBytes)
}

// GetAllParcels returns all land parcels on the ledger.
func (s *SmartContract) GetAllParcels(ctx contractapi.TransactionContextInterface) ([]*LandParcel, error) {
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var parcels []*LandParcel
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var parcel LandParcel
		if err := json.Unmarshal(queryResponse.Value, &parcel); err != nil {
			return nil, err
		}
		parcels = append(parcels, &parcel)
	}
	return parcels, nil
}

// GetHistoryForParcel returns the full history of changes for a parcel.
func (s *SmartContract) GetHistoryForParcel(ctx contractapi.TransactionContextInterface, id string) (string, error) {
	resultsIterator, err := ctx.GetStub().GetHistoryForKey(id)
	if err != nil {
		return "", err
	}
	defer resultsIterator.Close()

	var history []json.RawMessage
	for resultsIterator.HasNext() {
		response, err := resultsIterator.Next()
		if err != nil {
			return "", err
		}

		// Unmarshal the historic value into a raw message
		var value json.RawMessage
		if err := json.Unmarshal(response.Value, &value); err != nil {
			return "", err
		}
		history = append(history, value)
	}

	historyBytes, _ := json.Marshal(history)
	return string(historyBytes), nil
}

// --- Utility and Query Functions ---

func (s *SmartContract) QueryLandParcel(ctx contractapi.TransactionContextInterface, id string) (*LandParcel, error) {
	parcelAsBytes, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if parcelAsBytes == nil {
		return nil, fmt.Errorf("the land parcel %s does not exist", id)
	}

	var parcel LandParcel
	if err := json.Unmarshal(parcelAsBytes, &parcel); err != nil {
		return nil, err
	}

	return &parcel, nil
}

func (s *SmartContract) LandParcelExists(ctx contractapi.TransactionContextInterface, id string) (bool, error) {
	parcelAsBytes, err := ctx.GetStub().GetState(id)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %v", err)
	}

	return parcelAsBytes != nil, nil
}

func main() {
	chaincode, err := contractapi.NewChaincode(&SmartContract{})
	if err != nil {
		fmt.Printf("Error creating landcc chaincode: %v", err)
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting landcc chaincode: %v", err)
	}
}
