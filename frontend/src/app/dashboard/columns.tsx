// "use client"

// import { ColumnDef } from "@tanstack/react-table"

// // This type is used to define the shape of our data.
// export type Parcel = {
//   id: number
//   surveyNumber: string
//   village: string
//   tehsil: string
//   area: number
//   acquisitionStatus: string
// }

// export const columns: ColumnDef<Parcel>[] = [
//   {
//     accessorKey: "surveyNumber",
//     header: "Survey No.",
//   },
//   {
//     accessorKey: "village",
//     header: "Village",
//   },
//   {
//     accessorKey: "tehsil",
//     header: "Tehsil",
//   },
//    {
//     accessorKey: "area",
//     header: "Area (Hectare)",
//   },
//   {
//     accessorKey: "acquisitionStatus",
//     header: "Status",
//   },
// ]


"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ParcelActions } from "../components/ParcelActions"; // Import the new component

export type Owner = {
  id: number;
  name: string;
  aadhaar: string;
  bankInfo: string;
  share: number;
  isPaid: boolean;
  paidAmount: number;
  paymentTxId: string;
};


export type Parcel = {
  id: number;
  surveyNumber: string;
  village: string;

  tehsil: string;
  area: number;
  acquisitionStatus: string;
  owners: Owner[];
}

export const columns = (onActionComplete: () => void): ColumnDef<Parcel>[] => [
  { accessorKey: "surveyNumber", header: "Survey No." },
  { accessorKey: "village", header: "Village" },
  { accessorKey: "tehsil", header: "Tehsil" },
  { 
    accessorKey: "owners",
    header: "Owners",
    cell: ({ row }) => {
      const owners = row.getValue("owners") as Owner[];
      return <div>{owners.map(o => o.name).join(', ')}</div>;
    }
  },
  { 
    accessorKey: "area", 
    header: "Area (Ha)" 
  },
  { 
    accessorKey: "acquisitionStatus", 
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("acquisitionStatus") as string;
      // You can add color coding here based on status
      return <span className="font-medium">{status}</span>;
    }
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const parcel = row.original;
      return <ParcelActions parcel={parcel} onActionComplete={onActionComplete} />;
    },
  },
];