"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { Parcel, columns } from "./columns";
import { ParcelDataTable } from "./ParcelDataTable";

export function ParcelDataView({ dataVersion }: { dataVersion: number }) {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("http://localhost:8080/api/parcels");
        setParcels(response.data);
      } catch (error) {
        console.error("Failed to fetch parcels:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dataVersion]); // Re-fetch whenever dataVersion changes

  return (
    <div className="w-full">
      {isLoading ? <p>Loading data...</p> : <ParcelDataTable columns={columns} data={parcels} />}
    </div>
  );
}