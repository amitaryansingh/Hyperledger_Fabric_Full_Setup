// "use client"

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Building, LandPlot, HandCoins, Scale } from "lucide-react"

// export function DashboardStats() {
//   return (
//     <div>
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">
//               Total Plots Acquired
//             </CardTitle>
//             <LandPlot className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">1,254</div>
//             <p className="text-xs text-muted-foreground">
//               out of 3,000 total plots
//             </p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">
//               Beneficiaries Paid
//             </CardTitle>
//             <HandCoins className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">832</div>
//             <p className="text-xs text-muted-foreground">
//               +15% from last week
//             </p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
//             <Building className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">422</div>
//              <p className="text-xs text-muted-foreground">
//               Awaiting verification
//             </p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Cases in Litigation</CardTitle>
//             <Scale className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">57</div>
//             <p className="text-xs text-muted-foreground">
//               Disputes filed
//             </p>
//           </CardContent>
//         </Card>
//       </div>
//       {/* We will add charts and more detailed reports here later */}
//     </div>
//   )
// }


"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Landmark, AlertTriangle, FileText } from 'lucide-react';

// Define the structure of a Parcel, mirroring the backend model
type Owner = {
  isPaid: boolean;
  aadhaar: string;
};

type Parcel = {
  acquisitionStatus: string;
  owners: Owner[];
};

// Define the structure for our calculated stats
interface Stats {
  totalPlots: number;
  paidBeneficiaries: number;
  pendingPayments: number;
  litigationCases: number;
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    totalPlots: 0,
    paidBeneficiaries: 0,
    pendingPayments: 0,
    litigationCases: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAndCalculateStats = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get<Parcel[]>("http://localhost:8080/api/parcels");
        const parcels = response.data;

        // --- STATS CALCULATION ---

        const totalPlots = parcels.length;

        const litigationCases = parcels.filter(
          p => p.acquisitionStatus === 'Disputed'
        ).length;

        const paidOwnerAadhaars = new Set<string>();
        const pendingOwnerAadhaars = new Set<string>();

        parcels.forEach(parcel => {
          parcel.owners.forEach(owner => {
            if (owner.isPaid) {
              paidOwnerAadhaars.add(owner.aadhaar);
            } else {
              pendingOwnerAadhaars.add(owner.aadhaar);
            }
          });
        });
        
        // Ensure a person isn't counted as both paid and pending
        paidOwnerAadhaars.forEach(aadhaar => {
            if(pendingOwnerAadhaars.has(aadhaar)){
                pendingOwnerAadhaars.delete(aadhaar);
            }
        });


        setStats({
          totalPlots,
          litigationCases,
          paidBeneficiaries: paidOwnerAadhaars.size,
          pendingPayments: pendingOwnerAadhaars.size,
        });

      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        // Optionally set stats to a default error state
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndCalculateStats();
  }, []); // The empty dependency array ensures this runs once on component mount

  const StatCard = ({ title, value, icon, description }: { title: string, value: string | number, icon: React.ReactNode, description: string }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
           <div className="h-8 w-1/4 bg-gray-200 rounded animate-pulse" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Plots Acquired"
        value={stats.totalPlots}
        icon={<Landmark className="h-4 w-4 text-muted-foreground" />}
        description="Total number of land parcels entered."
      />
      <StatCard
        title="Beneficiaries Paid"
        value={stats.paidBeneficiaries}
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
        description="Unique owners who received full payment."
      />
      <StatCard
        title="Pending Payments"
        value={stats.pendingPayments}
        icon={<FileText className="h-4 w-4 text-muted-foreground" />}
        description="Owners awaiting compensation payment."
      />
      <StatCard
        title="Cases in Litigation"
        value={stats.litigationCases}
        icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
        description="Parcels currently marked as disputed."
      />
    </div>
  );
}