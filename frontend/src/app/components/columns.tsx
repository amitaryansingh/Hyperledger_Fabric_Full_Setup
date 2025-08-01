// "use client"

// import { ColumnDef } from "@tanstack/react-table"

// export type Parcel = {
//   id: number
//   surveyNumber: string
//   village: string
//   tehsil: string
//   area: number
//   acquisitionStatus: string
// }

// export const columns: ColumnDef<Parcel>[] = [
//   { accessorKey: "surveyNumber", header: "Survey No." },
//   { accessorKey: "village", header: "Village" },
//   { accessorKey: "tehsil", header: "Tehsil" },
//   { accessorKey: "area", header: "Area (Hectare)" },
//   { accessorKey: "acquisitionStatus", header: "Status" },
// ]



// "use client"

// import { ColumnDef } from "@tanstack/react-table"
// import { Button } from "@/components/ui/button";

// export type Parcel = {
//   id: number
//   surveyNumber: string
//   village: string
//   tehsil: string
//   area: number
//   acquisitionStatus: string
// }

// export const columns: ColumnDef<Parcel>[] = [
//   { accessorKey: "surveyNumber", header: "Survey No." },
//   { accessorKey: "village", header: "Village" },
//   { accessorKey: "tehsil", header: "Tehsil" },
//   { accessorKey: "area", header: "Area (Hectare)" },
//   { accessorKey: "acquisitionStatus", header: "Status" },
//   {
//     id: "actions",
//     cell: ({ row }) => {
//       const parcel = row.original

//       return (
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={() => {
//             // Here you would typically open a dialog or navigate to a new page
//             // to perform actions like "Declare Award" or "Pay Compensation"
//             // For now, we'll just log to the console.
//             console.log("Manage parcel:", parcel.surveyNumber);
//           }}
//         >
//           Manage
//         </Button>
//       )
//     },
//   },
// ]


"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ParcelActions } from "./ParcelActions"; // Import the new component

export type Parcel = {
  owners: any;
  id: number;
  surveyNumber: string;
  village: string;
  tehsil: string;
  area: number;
  acquisitionStatus: string;
  // Add other fields from the backend model that you might need
}

export const columns = (onActionComplete: () => void): ColumnDef<Parcel>[] => [
  { accessorKey: "surveyNumber", header: "Survey No." },
  { accessorKey: "village", header: "Village" },
  { accessorKey: "tehsil", header: "Tehsil" },
  { accessorKey: "area", header: "Area (Hectare)" },
  { accessorKey: "acquisitionStatus", header: "Status" },
  {
    id: "actions",
    cell: ({ row }) => {
      const parcel = row.original;
      return <ParcelActions parcel={parcel} onActionComplete={onActionComplete} />;
    },
  },
];