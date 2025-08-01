"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Blocks, ArrowRightLeft, Timer, Hash, FileJson, Fingerprint } from "lucide-react";

// Dummy Data for a single block
const dummyBlockDetails = {
    height: 102,
    hash: "0xabc123def456ghi789jkl012mno345pqr678stu901vwx234yz567abc890f12",
    parentHash: "0xdef456ghi789jkl012mno345pqr678stu901vwx234yz567abc890a45",
    timestamp: "2024-07-31T12:34:56Z",
    txCount: 3,
    transactions: [
        { hash: "0x123…eef", type: "CreateLandParcel", details: "Parcel NAGPUR-101 created for Amit Ryan" },
        { hash: "0x456…dca", type: "UpdateCompensation", details: "Compensation for WARDHA-451 set to ₹500,000" },
        { hash: "0x789…bba", type: "AddOwner", details: "Jane Doe added as co-owner to NAGPUR-101" },
    ]
};

// Note: { params } is automatically passed by Next.js for dynamic routes
export default function BlockDetailPage({ params }: { params: { blockNumber: string } }) {
  const block = { ...dummyBlockDetails, height: parseInt(params.blockNumber) };

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Blocks /> Block #{block.height}
        </h1>
        <p className="text-muted-foreground font-mono mt-2 text-sm">{block.hash}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Block Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-muted-foreground flex items-center gap-2"><Hash className="h-4 w-4"/> Block Hash</span>
            <span className="font-mono text-sm">{block.hash}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="font-semibold text-muted-foreground flex items-center gap-2"><Fingerprint className="h-4 w-4"/> Parent Hash</span>
            <span className="font-mono text-sm hover:underline cursor-pointer">{block.parentHash}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="font-semibold text-muted-foreground flex items-center gap-2"><Timer className="h-4 w-4"/> Timestamp</span>
            <span>{new Date(block.timestamp).toUTCString()}</span>
          </div>
           <Separator />
          <div className="flex justify-between items-center">
            <span className="font-semibold text-muted-foreground flex items-center gap-2"><ArrowRightLeft className="h-4 w-4"/> Transactions</span>
            <span className="font-bold">{block.txCount} transactions in this block</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>Details of the changes recorded in this block.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {block.transactions.map((tx) => (
               <li key={tx.hash} className="p-4 border rounded-md hover:bg-slate-50 transition-colors">
                  <p className="font-semibold font-mono text-primary hover:underline cursor-pointer">{tx.hash}</p>
                  <p className="text-sm">Type: <span className="font-semibold">{tx.type}</span></p>
                  <p className="text-sm text-muted-foreground">Changes: <span className="text-slate-800">{tx.details}</span></p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}