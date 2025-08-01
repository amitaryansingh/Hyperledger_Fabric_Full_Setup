// // fabric-network/chaincode/landcc/models.go
// package main

// import "time"

// // LandParcel represents a single plot of land with all its details.
// type LandParcel struct {
// 	ID                  string              `json:"id"`             // Unique ID, e.g., VILLAGE-SURVEYNO
// 	SurveyNumber        string              `json:"surveyNumber"`
// 	Village             string              `json:"village"`
// 	Tehsil              string              `json:"tehsil"`
// 	Owners              []Owner             `json:"owners"`
// 	Area                float64             `json:"area"`           // Area in square meters or acres
// 	AcquisitionStatus   string              `json:"acquisitionStatus"` // e.g., "Notified", "Awarded", "Compensated"
// 	CompensationDetails CompensationDetails `json:"compensationDetails"`
// 	Litigation          *LitigationRecord   `json:"litigation"`     // Pointer to allow for null value
// }

// // Owner represents a single owner of a land parcel, allowing for multiple owners[cite: 7].
// type Owner struct {
// 	Name        string  `json:"name"`
// 	Aadhaar     string  `json:"aadhaar"` // Or other unique identifier
// 	Share       float64 `json:"share"`   // Ownership percentage (e.g., 50.0 for 50%)
// 	BankInfo    string  `json:"bankInfo"`
// 	IsPaid      bool    `json:"isPaid"`
// }

// // CompensationDetails breaks down the valuation categories.
// type CompensationDetails struct {
// 	LandValue      float64 `json:"landValue"`
// 	StructureValue float64 `json:"structureValue"`
// 	TreeValue      float64 `json:"treeValue"`
// 	CropValue      float64 `json:"cropValue"`
// 	TotalAmount    float64 `json:"totalAmount"`
// }

// // LitigationRecord tracks any legal disputes related to the parcel[cite: 10, 37].
// type LitigationRecord struct {
// 	IsDisputed  bool      `json:"isDisputed"`
// 	CaseNumber  string    `json:"caseNumber"`
// 	CourtName   string    `json:"courtName"`
// 	FiledOn     time.Time `json:"filedOn"`
// 	Description string    `json:"description"`
// }

package main

import "time"

// HistoryEntry records a single change to a land parcel.
type HistoryEntry struct {
	TxId      string    `json:"txId"`
	Timestamp time.Time `json:"timestamp"`
	Message   string    `json:"message"`
	Submitter string    `json:"submitter"`
}

// LandParcel represents a single plot of land with all its details.
type LandParcel struct {
	ID                  string              `json:"id"` // Unique ID, e.g., TEHSIL-SURVEYNO
	SurveyNumber        string              `json:"surveyNumber"`
	Village             string              `json:"village"`
	Tehsil              string              `json:"tehsil"`
	Owners              []Owner             `json:"owners"`
	Area                float64             `json:"area"`
	AcquisitionStatus   string              `json:"acquisitionStatus"` // "Notified", "Awarded", "Compensated", "Disputed"
	MapImageURL         string              `json:"mapImageURL"`       // Link to scanned map image
	LastUpdated         time.Time           `json:"lastUpdated"`
	LastUpdatedBy       string              `json:"lastUpdatedBy"`
	CompensationDetails CompensationDetails `json:"compensationDetails"`
	Litigation          *LitigationRecord   `json:"litigation"`
	History             []HistoryEntry      `json:"history"` // Full history of changes
}

// Owner represents a single owner of a land parcel.
type Owner struct {
	Name        string  `json:"name"`
	Aadhaar     string  `json:"aadhaar"`
	Share       float64 `json:"share"`
	BankInfo    string  `json:"bankInfo"`
	IsPaid      bool    `json:"isPaid"`
	PaymentTxId string  `json:"paymentTxId"`
	PaidAmount  float64 `json:"paidAmount"`
}

// CompensationDetails breaks down the valuation categories.
type CompensationDetails struct {
	LandValue      float64 `json:"landValue"`
	StructureValue float64 `json:"structureValue"`
	TreeValue      float64 `json:"treeValue"`
	CropValue      float64 `json:"cropValue"`
	TotalAmount    float64 `json:"totalAmount"`
}

// LitigationRecord tracks any legal disputes related to the parcel.
type LitigationRecord struct {
	IsDisputed  bool      `json:"isDisputed"`
	CaseNumber  string    `json:"caseNumber"`
	CourtName   string    `json:"courtName"`
	FiledOn     time.Time `json:"filedOn"`
	Description string    `json:"description"`
}

// ParcelEvent represents the payload for a chaincode event
type ParcelEvent struct {
	ParcelID string `json:"parcelId"`
	Type     string `json:"type"`
	Message  string `json:"message"`
}
