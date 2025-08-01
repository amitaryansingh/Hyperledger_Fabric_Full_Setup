"use client";

import { useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { PlusCircle, Trash2, FileUp, Paperclip, LandPlot, Users, Coins, Scale, FilePlus } from 'lucide-react';

// Define TypeScript types for our form data
interface Owner {
  name: string;
  aadhaar: string;
  bankInfo: string;
}

interface LandParcelData {
  surveyNumber: string;
  village: string;
  tehsil: string;
  area: number;
  acquisitionStatus: string;
  owners: Owner[];
}

interface LandParcelFormProps {
  onFormSubmit: () => void;
}

export function LandParcelForm({ onFormSubmit }: LandParcelFormProps) {
  const [formData, setFormData] = useState<LandParcelData>({
    surveyNumber: "",
    village: "",
    tehsil: "",
    area: 0,
    acquisitionStatus: "Notified",
    owners: [{ name: "", aadhaar: "", bankInfo: "" }],
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOwnerChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newOwners = [...formData.owners];
    newOwners[index] = { ...newOwners[index], [name]: value };
    setFormData((prev) => ({ ...prev, owners: newOwners }));
  };

  const addOwner = () => {
    setFormData((prev) => ({
      ...prev,
      owners: [...prev.owners, { name: "", aadhaar: "", bankInfo: "" }],
    }));
  };

  const removeOwner = (index: number) => {
    const newOwners = formData.owners.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, owners: newOwners }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:8080/api/parcels", formData);

      toast.success("Success!", {
        description: `Land Parcel ${response.data.surveyNumber} created and logged to the blockchain.`,
        duration: 5000,
      });

      setFormData({
        surveyNumber: "", village: "", tehsil: "", area: 0, acquisitionStatus: "Notified",
        owners: [{ name: "", aadhaar: "", bankInfo: "" }],
      });

      onFormSubmit();

    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error("Error Creating Parcel", {
        description: error.response?.data || error.message || "An unknown error occurred.",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-5xl mx-auto border-2 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <FilePlus /> New Land Acquisition Entry
        </CardTitle>
        <CardDescription>
          Enter the details for a new land parcel to digitize the record and log it on the blockchain.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-8">

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2"><LandPlot className="h-5 w-5" /> Parcel Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-slate-50/50">
              <div>
                <Label htmlFor="surveyNumber">Survey No.</Label>
                <Input id="surveyNumber" name="surveyNumber" placeholder="e.g., WARDHA-451" value={formData.surveyNumber} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="tehsil">Tehsil</Label>
                <Select name="tehsil" onValueChange={(value) => handleSelectChange('tehsil', value)} required>
                  <SelectTrigger><SelectValue placeholder="Select Tehsil" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Wardha">Wardha</SelectItem>
                    <SelectItem value="Deoli">Deoli</SelectItem>
                    <SelectItem value="Hinganghat">Hinganghat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="village">Village</Label>
                <Input id="village" name="village" placeholder="Village Name" value={formData.village} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="area">Area (in Hectare)</Label>
                <Input id="area" name="area" type="number" step="0.01" placeholder="e.g., 5.7" value={formData.area} onChange={handleInputChange} required />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2"><Users className="h-5 w-5" /> Owner Details</h3>
            {formData.owners.map((owner, index) => (
              <div key={index} className="flex flex-col md:flex-row items-center gap-4 p-4 border rounded-lg bg-slate-50/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow">
                  <div>
                    <Label htmlFor={`owner-name-${index}`}>Owner Name</Label>
                    <Input id={`owner-name-${index}`} name="name" placeholder="Full Name" value={owner.name} onChange={(e) => handleOwnerChange(index, e)} required />
                  </div>
                  <div>
                    <Label htmlFor={`owner-aadhaar-${index}`}>Aadhaar Number</Label>
                    <Input id={`owner-aadhaar-${index}`} name="aadhaar" placeholder="12-digit Number" value={owner.aadhaar} onChange={(e) => handleOwnerChange(index, e)} required />
                  </div>
                  <div>
                    <Label htmlFor={`owner-bank-${index}`}>Bank Info</Label>
                    <Input id={`owner-bank-${index}`} name="bankInfo" placeholder="e.g., SBI-12345" value={owner.bankInfo} onChange={(e) => handleOwnerChange(index, e)} required />
                  </div>
                </div>
                {formData.owners.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeOwner(index)} className="mt-4 md:mt-0 text-red-500 hover:bg-red-100 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addOwner}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Another Owner
            </Button>
          </div>

          <Separator />

          <div className="space-y-4 opacity-50 cursor-not-allowed">
             <h3 className="text-lg font-semibold flex items-center gap-2"><Coins className="h-5 w-5" /> Compensation Details (Future Feature)</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-slate-50/50">
                <div><Label>Land Value (₹)</Label><Input disabled placeholder="Auto-calculated" /></div>
                <div><Label>Structure Value (₹)</Label><Input type="number" disabled placeholder="Enter value" /></div>
                <div><Label>Tree/Crop Value (₹)</Label><Input type="number" disabled placeholder="Enter value" /></div>
                <div className="font-bold"><Label>Total Amount (₹)</Label><Input disabled placeholder="Auto-calculated" /></div>
             </div>
          </div>

          <div className="space-y-4 opacity-50 cursor-not-allowed">
            <h3 className="text-lg font-semibold flex items-center gap-2"><Scale className="h-5 w-5" /> Litigation Info (Future Feature)</h3>
            <div className="p-4 border rounded-lg bg-slate-50/50">
              <Label>Dispute Details</Label>
              <Input disabled placeholder="Enter court reference, dates, etc." />
            </div>
          </div>

          <div className="space-y-4 opacity-50 cursor-not-allowed">
            <h3 className="text-lg font-semibold flex items-center gap-2"><Paperclip className="h-5 w-5" /> Document Uploads (Future Feature)</h3>
            <div className="p-4 border rounded-lg bg-slate-50/50">
              <Label htmlFor="map-upload">Upload Scanned Maps & Files</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input id="map-upload" type="file" disabled className="flex-grow"/>
                <Button type="button" disabled><FileUp className="mr-2 h-4 w-4" /> Upload</Button>
              </div>
            </div>
          </div>

        </CardContent>
        <CardFooter className="flex justify-end gap-2 border-t pt-6">
          <Button type="button" variant="outline">Save as Draft</Button>
          <Button type="submit" disabled={isLoading}>{isLoading ? "Submitting..." : "Submit & Log to Blockchain"}</Button>
        </CardFooter>
      </form>
    </Card>
  );
}