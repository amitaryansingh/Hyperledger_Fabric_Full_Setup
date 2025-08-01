"use client"

import { ColumnDef } from "@tanstack/react-table"

// This type is used to define the shape of our data.
export type Parcel = {
  id: number
  surveyNumber: string
  village: string
  tehsil: string
  area: number
  acquisitionStatus: string
}

export const columns: ColumnDef<Parcel>[] = [
  {
    accessorKey: "surveyNumber",
    header: "Survey No.",
  },
  {
    accessorKey: "village",
    header: "Village",
  },
  {
    accessorKey: "tehsil",
    header: "Tehsil",
  },
   {
    accessorKey: "area",
    header: "Area (Hectare)",
  },
  {
    accessorKey: "acquisitionStatus",
    header: "Status",
  },
]