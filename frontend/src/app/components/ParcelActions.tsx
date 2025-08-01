// "use client";

// import { useState } from "react";
// import axios from "axios";
// import { toast } from "sonner";
// import { Button } from "@/components/ui/button";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Parcel } from "./columns";

// interface ParcelActionsProps {
//   parcel: Parcel;
//   onActionComplete: () => void;
// }

// export function ParcelActions({ parcel, onActionComplete }: ParcelActionsProps) {
//   const [isAwardDialogOpen, setIsAwardDialogOpen] = useState(false);
//   const [isDisputeDialogOpen, setIsDisputeDialogOpen] = useState(false);
//   const [isCompensateDialogOpen, setIsCompensateDialogOpen] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   // State for award form
//   const [compensationDetails, setCompensationDetails] = useState({
//     landValue: 0,
//     structureValue: 0,
//     treeValue: 0,
//     cropValue: 0,
//     totalAmount: 0,
//   });

//   // State for dispute form
//   const [litigationRecord, setLitigationRecord] = useState({
//     caseNumber: "",
//     courtName: "",
//     description: "",
//   });
  
//   // State for compensation form
//   const [compensationData, setCompensationData] = useState({
//     ownerAadhaar: "",
//     amount: 0,
//   });

//   const handleAwardSubmit = async () => {
//     setIsLoading(true);
//     try {
//       await axios.post(`http://localhost:8080/api/parcels/${parcel.surveyNumber}/award`, compensationDetails);
//       toast.success("Award Declared!", { description: `Compensation award for ${parcel.surveyNumber} has been logged.` });
//       onActionComplete();
//       setIsAwardDialogOpen(false);
//     } catch (error: any) {
//       toast.error("Error Declaring Award", { description: error.response?.data || "An error occurred." });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleDisputeSubmit = async () => {
//     setIsLoading(true);
//     try {
//         await axios.post(`http://localhost:8080/api/parcels/${parcel.surveyNumber}/dispute`, litigationRecord);
//         toast.success("Dispute Raised!", { description: `Dispute for ${parcel.surveyNumber} has been logged.` });
//         onActionComplete();
//         setIsDisputeDialogOpen(false);
//     } catch (error: any) {
//         toast.error("Error Raising Dispute", { description: error.response?.data || "An error occurred." });
//     } finally {
//         setIsLoading(false);
//     }
//   };
  
//   const handleCompensateSubmit = async () => {
//     setIsLoading(true);
//     try {
//         await axios.post(`http://localhost:8080/api/parcels/${parcel.surveyNumber}/compensate/${compensationData.ownerAadhaar}?amount=${compensationData.amount}`);
//         toast.success("Compensation Paid!", { description: `Payment for ${compensationData.ownerAadhaar} has been logged.` });
//         onActionComplete();
//         setIsCompensateDialogOpen(false);
//     } catch (error: any) {
//         toast.error("Error Recording Compensation", { description: error.response?.data || "An error occurred." });
//     } finally {
//         setIsLoading(false);
//     }
//   };


//   return (
//     <div className="space-x-2">
//       {parcel.acquisitionStatus === "Notified" && (
//         <Button size="sm" onClick={() => setIsAwardDialogOpen(true)}>Declare Award</Button>
//       )}
//       {parcel.acquisitionStatus === "Awarded" && (
//          <Button size="sm" onClick={() => setIsCompensateDialogOpen(true)}>Pay Compensation</Button>
//       )}
//       {(parcel.acquisitionStatus === "Notified" || parcel.acquisitionStatus === "Awarded") && (
//         <Button size="sm" variant="destructive" onClick={() => setIsDisputeDialogOpen(true)}>Raise Dispute</Button>
//       )}

//       {/* Award Dialog */}
//       <Dialog open={isAwardDialogOpen} onOpenChange={setIsAwardDialogOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Declare Award for {parcel.surveyNumber}</DialogTitle>
//             <DialogDescription>Enter compensation details. This will be recorded on the blockchain.</DialogDescription>
//           </DialogHeader>
//           <div className="grid gap-4 py-4">
//             {Object.keys(compensationDetails).map((key) => (
//               key !== 'totalAmount' && (
//                 <div key={key} className="grid grid-cols-4 items-center gap-4">
//                   <Label htmlFor={key} className="text-right">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</Label>
//                   <Input
//                     id={key}
//                     type="number"
//                     value={compensationDetails[key as keyof typeof compensationDetails]}
//                     onChange={(e) => {
//                       const newDetails = { ...compensationDetails, [key]: parseFloat(e.target.value) || 0 };
//                       newDetails.totalAmount = newDetails.landValue + newDetails.structureValue + newDetails.treeValue + newDetails.cropValue;
//                       setCompensationDetails(newDetails);
//                     }}
//                     className="col-span-3"
//                   />
//                 </div>
//               )
//             ))}
//              <div className="grid grid-cols-4 items-center gap-4 font-bold">
//                 <Label className="text-right">Total Amount</Label>
//                 <Input value={compensationDetails.totalAmount.toFixed(2)} disabled className="col-span-3" />
//              </div>
//           </div>
//           <DialogFooter>
//             <Button onClick={handleAwardSubmit} disabled={isLoading}>{isLoading ? "Submitting..." : "Declare Award"}</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
      
//       {/* Dispute Dialog */}
//        <Dialog open={isDisputeDialogOpen} onOpenChange={setIsDisputeDialogOpen}>
//             <DialogContent>
//                 <DialogHeader>
//                     <DialogTitle>Raise Dispute for {parcel.surveyNumber}</DialogTitle>
//                     <DialogDescription>Record a legal dispute against this parcel.</DialogDescription>
//                 </DialogHeader>
//                 <div className="grid gap-4 py-4">
//                     <div className="grid grid-cols-4 items-center gap-4">
//                         <Label htmlFor="caseNumber" className="text-right">Case Number</Label>
//                         <Input id="caseNumber" value={litigationRecord.caseNumber} onChange={(e) => setLitigationRecord({...litigationRecord, caseNumber: e.target.value})} className="col-span-3" />
//                     </div>
//                     <div className="grid grid-cols-4 items-center gap-4">
//                         <Label htmlFor="courtName" className="text-right">Court Name</Label>
//                         <Input id="courtName" value={litigationRecord.courtName} onChange={(e) => setLitigationRecord({...litigationRecord, courtName: e.target.value})} className="col-span-3" />
//                     </div>
//                     <div className="grid grid-cols-4 items-center gap-4">
//                         <Label htmlFor="description" className="text-right">Description</Label>
//                         <Input id="description" value={litigationRecord.description} onChange={(e) => setLitigationRecord({...litigationRecord, description: e.target.value})} className="col-span-3" />
//                     </div>
//                 </div>
//                 <DialogFooter>
//                     <Button onClick={handleDisputeSubmit} disabled={isLoading}>{isLoading ? "Submitting..." : "Raise Dispute"}</Button>
//                 </DialogFooter>
//             </DialogContent>
//         </Dialog>
        
//         {/* Compensate Dialog */}
//         <Dialog open={isCompensateDialogOpen} onOpenChange={setIsCompensateDialogOpen}>
//             <DialogContent>
//                 <DialogHeader>
//                     <DialogTitle>Record Compensation for {parcel.surveyNumber}</DialogTitle>
//                     <DialogDescription>Log a payment to an individual owner.</DialogDescription>
//                 </DialogHeader>
//                 <div className="grid gap-4 py-4">
//                     <div className="grid grid-cols-4 items-center gap-4">
//                         <Label htmlFor="ownerAadhaar" className="text-right">Owner Aadhaar</Label>
//                         <Input id="ownerAadhaar" value={compensationData.ownerAadhaar} onChange={(e) => setCompensationData({...compensationData, ownerAadhaar: e.target.value})} className="col-span-3" />
//                     </div>
//                     <div className="grid grid-cols-4 items-center gap-4">
//                         <Label htmlFor="amount" className="text-right">Amount</Label>
//                         <Input id="amount" type="number" value={compensationData.amount} onChange={(e) => setCompensationData({...compensationData, amount: parseFloat(e.target.value) || 0})} className="col-span-3" />
//                     </div>
//                 </div>
//                 <DialogFooter>
//                     <Button onClick={handleCompensateSubmit} disabled={isLoading}>{isLoading ? "Submitting..." : "Record Payment"}</Button>
//                 </DialogFooter>
//             </DialogContent>
//         </Dialog>

//     </div>
//   );
// }


"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Parcel } from "./columns";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ParcelActionsProps {
  parcel: Parcel;
  onActionComplete: () => void;
}

// Sub-component for the Award Form
const AwardForm = ({ parcel, onActionComplete, setIsLoading, isLoading }: any) => {
    const [details, setDetails] = useState({ landValue: 0, structureValue: 0, treeValue: 0, cropValue: 0, totalAmount: 0 });

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            await axios.post(`http://localhost:8080/api/parcels/${parcel.surveyNumber}/award`, details);
            toast.success("Award Declared!", { description: `Compensation award for ${parcel.surveyNumber} has been logged.` });
            onActionComplete();
        } catch (error: any) {
            toast.error("Error Declaring Award", { description: error.response?.data || "An error occurred." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-4 space-y-4 pt-4 border-t">
            <h4 className="font-semibold">Declare Award</h4>
            <div className="grid grid-cols-2 gap-4">
                 {Object.keys(details).map((key) => (
                    key !== 'totalAmount' && (
                        <div key={key}>
                            <Label htmlFor={key}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</Label>
                            <Input
                                id={key}
                                type="number"
                                value={details[key as keyof typeof details]}
                                onChange={(e) => {
                                    const newDetails = { ...details, [key]: parseFloat(e.target.value) || 0 };
                                    newDetails.totalAmount = newDetails.landValue + newDetails.structureValue + newDetails.treeValue + newDetails.cropValue;
                                    setDetails(newDetails);
                                }}
                            />
                        </div>
                    )
                ))}
            </div>
            <div className="font-bold">
                <Label>Total Amount</Label>
                <Input value={`₹ ${details.totalAmount.toFixed(2)}`} disabled />
            </div>
            <Button onClick={handleSubmit} disabled={isLoading}>{isLoading ? "Submitting..." : "Submit Award"}</Button>
        </div>
    );
};

// Sub-component for the Compensation Form
const CompensationForm = ({ parcel, onActionComplete, setIsLoading, isLoading }: any) => {
    const [data, setData] = useState({ ownerAadhaar: "", amount: 0 });

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            await axios.post(`http://localhost:8080/api/parcels/${parcel.surveyNumber}/compensate/${data.ownerAadhaar}?amount=${data.amount}`);
            toast.success("Compensation Paid!", { description: `Payment for ${data.ownerAadhaar} has been logged.` });
            onActionComplete();
        } catch (error: any) {
            toast.error("Error Recording Compensation", { description: error.response?.data || "An error occurred." });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
         <div className="mt-4 space-y-4 pt-4 border-t">
            <h4 className="font-semibold">Give Compensation</h4>
            <div>
                <Label htmlFor="ownerAadhaar">Owner Aadhaar</Label>
                <Select onValueChange={(value) => setData({...data, ownerAadhaar: value})}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Owner" />
                    </SelectTrigger>
                    <SelectContent>
                        {parcel.owners?.map((owner: any) => (
                            <SelectItem key={owner.aadhaar} value={owner.aadhaar}>{owner.name} ({owner.aadhaar})</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input id="amount" type="number" value={data.amount} onChange={(e) => setData({...data, amount: parseFloat(e.target.value) || 0})} />
            </div>
            <Button onClick={handleSubmit} disabled={isLoading}>{isLoading ? "Submitting..." : "Record Payment"}</Button>
        </div>
    );
};


// Sub-component for the Dispute Form
const DisputeForm = ({ parcel, onActionComplete, setIsLoading, isLoading }: any) => {
    const [details, setDetails] = useState({ caseNumber: "", courtName: "", description: "" });

     const handleSubmit = async () => {
        setIsLoading(true);
        try {
            await axios.post(`http://localhost:8080/api/parcels/${parcel.surveyNumber}/dispute`, details);
            toast.success("Dispute Raised!", { description: `Dispute for ${parcel.surveyNumber} has been logged.` });
            onActionComplete();
        } catch (error: any) {
            toast.error("Error Raising Dispute", { description: error.response?.data || "An error occurred." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-4 space-y-4 pt-4 border-t">
            <h4 className="font-semibold">Raise a Dispute</h4>
            <div><Label htmlFor="caseNumber">Case Number</Label><Input id="caseNumber" value={details.caseNumber} onChange={(e) => setDetails({...details, caseNumber: e.target.value})} /></div>
            <div><Label htmlFor="courtName">Court Name</Label><Input id="courtName" value={details.courtName} onChange={(e) => setDetails({...details, courtName: e.target.value})} /></div>
            <div><Label htmlFor="description">Description</Label><Input id="description" value={details.description} onChange={(e) => setDetails({...details, description: e.target.value})} /></div>
            <Button variant="destructive" onClick={handleSubmit} disabled={isLoading}>{isLoading ? "Submitting..." : "Submit Dispute"}</Button>
        </div>
    );
};


// Main Component
export function ParcelActions({ parcel, onActionComplete }: ParcelActionsProps) {
  const [view, setView] = useState<'details' | 'award' | 'compensate' | 'dispute'>('details');
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Dialog onOpenChange={() => setView('details')}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">Manage</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manage Parcel: {parcel.surveyNumber}</DialogTitle>
          <DialogDescription>
            View details and perform actions for this land parcel. Current status: <strong>{parcel.acquisitionStatus}</strong>
          </DialogDescription>
        </DialogHeader>
        
        {/* Details View */}
        {view === 'details' && (
          <div className="space-y-4 py-4">
            <div>
                <h4 className="font-semibold text-sm mb-2">Parcel Information</h4>
                <div className="text-sm text-muted-foreground grid grid-cols-2 gap-2">
                    <p><strong>Village:</strong> {parcel.village}</p>
                    <p><strong>Tehsil:</strong> {parcel.tehsil}</p>
                    <p><strong>Area:</strong> {parcel.area} Hectare</p>
                </div>
            </div>
            <Separator />
            <div>
                <h4 className="font-semibold text-sm mb-2">Owners</h4>
                <ul className="text-sm text-muted-foreground list-disc pl-5">
                    {parcel.owners?.map((owner: any) => (
                        <li key={owner.aadhaar}>
                            {owner.name} ({owner.share}%) - A/C: {owner.bankInfo}
                        </li>
                    ))}
                </ul>
            </div>
             <Separator />
             <div className="flex gap-2 pt-4">
                {parcel.acquisitionStatus === "Notified" && (
                    <Button onClick={() => setView('award')}>Declare Award</Button>
                )}
                {parcel.acquisitionStatus === "Awarded" && (
                    <Button onClick={() => setView('compensate')}>Give Compensation</Button>
                )}
                 {(parcel.acquisitionStatus === "Notified" || parcel.acquisitionStatus === "Awarded") && (
                    <Button variant="destructive" onClick={() => setView('dispute')}>Raise a Dispute</Button>
                )}
             </div>
          </div>
        )}

        {/* Action Forms */}
        {view === 'award' && <AwardForm parcel={parcel} onActionComplete={onActionComplete} setIsLoading={setIsLoading} isLoading={isLoading} />}
        {view === 'compensate' && <CompensationForm parcel={parcel} onActionComplete={onActionComplete} setIsLoading={setIsLoading} isLoading={isLoading} />}
        {view === 'dispute' && <DisputeForm parcel={parcel} onActionComplete={onActionComplete} setIsLoading={setIsLoading} isLoading={isLoading} />}
        
      </DialogContent>
    </Dialog>
  );
}