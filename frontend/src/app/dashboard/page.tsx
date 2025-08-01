// "use client"

// import axios from "axios";
// import { useEffect, useState } from "react";
// import { Parcel, columns } from "./columns";
// import { ParcelDataTable } from "./data-table";

// export default function DashboardPage() {
//   const [parcels, setParcels] = useState<Parcel[]>([]);
//   const [isLoading, setIsLoading] = useState(true);

//   async function getData(): Promise<Parcel[]> {
//     try {
//       const response = await axios.get("http://localhost:8080/api/parcels");
//       return response.data;
//     } catch (error) {
//       console.error("Failed to fetch parcels:", error);
//       return [];
//     }
//   }

//   useEffect(() => {
//     setIsLoading(true);
//     getData().then(data => {
//       setParcels(data);
//       setIsLoading(false);
//     });
//   }, []);

//   if (isLoading) {
//     return <div className="container mx-auto py-10">Loading data...</div>;
//   }

//   return (
//     <div className="container mx-auto py-10">
//       <h1 className="text-3xl font-bold mb-6">Land Acquisition Dashboard</h1>
//       <ParcelDataTable columns={columns} data={parcels} />
//     </div>
//   );
// }


"use client"

import { ParcelDataTable } from "./data-table";
import { Parcel, columns } from "./columns";
import { useEffect, useState } from "react";
import axios from "axios";

export default function DashboardPage() {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataVersion, setDataVersion] = useState(0);

  // This function will be passed to the columns definition
  const refreshData = () => setDataVersion(v => v + 1);

  async function getData(): Promise<Parcel[]> {
    try {
      const response = await axios.get("http://localhost:8080/api/parcels");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch parcels:", error);
      return [];
    }
  }

  useEffect(() => {
    setIsLoading(true);
    getData().then(data => {
      setParcels(data);
      setIsLoading(false);
    });
  }, [dataVersion]);
  
  // Call columns as a function with refreshData to get the columns array
  const tableColumns = columns(refreshData);

  if (isLoading) {
    return <div className="container mx-auto py-10">Loading data...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Land Acquisition Dashboard</h1>
      <ParcelDataTable columns={tableColumns} data={parcels} />
    </div>
  );
}