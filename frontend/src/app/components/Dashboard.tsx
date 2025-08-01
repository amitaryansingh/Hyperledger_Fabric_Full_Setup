"use client";

import { useState } from "react";
import Link from "next/link"; // Import the Link component
import { LandParcelForm } from "./LandParcelForm";
import { DashboardStats } from "./DashboardStats";
import { ParcelDataView } from "./ParcelDataView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilePlus, LayoutDashboard, Database, SearchCode } from "lucide-react"; // Add SearchCode icon

export function Dashboard() {
  const [dataVersion, setDataVersion] = useState(0);

  const handleFormSubmit = () => {
    setDataVersion(v => v + 1);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Land Acquisition Management System</h1>
        <p className="text-muted-foreground">The centralized dashboard for managing all acquisition data.</p>
      </div>
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4"> {/* Changed to 4 columns */}
          <TabsTrigger value="dashboard">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="new-entry">
            <FilePlus className="mr-2 h-4 w-4" />
            New Data Entry
          </TabsTrigger>
          <TabsTrigger value="view-records">
            <Database className="mr-2 h-4 w-4" />
            View All Records
          </TabsTrigger>
          {/* --- NEW EXPLORER TAB --- */}
          <TabsTrigger value="explorer" asChild>
            <Link href="/explorer">
              <SearchCode className="mr-2 h-4 w-4" />
              Ledger Explorer
            </Link>
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Stats Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <DashboardStats />
          {/* You could also show a smaller version of the ParcelDataView here */}
          <div className="mt-8">
             <h2 className="text-2xl font-bold tracking-tight mb-4">Recent Records</h2>
             <ParcelDataView dataVersion={dataVersion} />
          </div>
        </TabsContent>

        {/* New Data Entry Form Tab */}
        <TabsContent value="new-entry" className="space-y-4">
          <LandParcelForm onFormSubmit={handleFormSubmit} />
        </TabsContent>

        {/* View All Records Table Tab */}
        <TabsContent value="view-records" className="space-y-4">
          <ParcelDataView dataVersion={dataVersion} />
        </TabsContent>
      </Tabs>
    </div>
  );
}