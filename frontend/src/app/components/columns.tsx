"use client"

import { ColumnDef } from "@tanstack/react-table"

export type Parcel = {
  id: number
  surveyNumber: string
  village: string
  tehsil: string
  area: number
  acquisitionStatus: string
}

export const columns: ColumnDef<Parcel>[] = [
  { accessorKey: "surveyNumber", header: "Survey No." },
  { accessorKey: "village", header: "Village" },
  { accessorKey: "tehsil", header: "Tehsil" },
  { accessorKey: "area", header: "Area (Hectare)" },
  { accessorKey: "acquisitionStatus", header: "Status" },
]