"use client"

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Blocks, ArrowRight, Timer, ArrowRightLeft } from "lucide-react";

// Dummy data for the chain view
const dummyChain = [
  { height: 102, hash: "0xabc…f12", txCount: 3, timestamp: "2 mins ago" },
  { height: 101, hash: "0xdef…a45", txCount: 1, timestamp: "5 mins ago" },
  { height: 100, hash: "0xghi…c78", txCount: 5, timestamp: "8 mins ago" },
  { height: 99, hash: "0xjkl…b01", txCount: 2, timestamp: "12 mins ago" },
];

export function BlockChainView() {
  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight mb-4">Block History</h2>
      <div className="relative flex items-center space-x-8 overflow-x-auto pb-4">
        {dummyChain.map((block, index) => (
          <div key={block.height} className="flex items-center">

            {/* The Block Card */}
            <Link href={`/explorer/block/${block.height}`} passHref>
              <Card className="w-80 flex-shrink-0 hover:shadow-lg hover:border-primary transition-all cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Block #{block.height}</span>
                    <Blocks className="h-5 w-5 text-muted-foreground" />
                  </CardTitle>
                  <CardDescription className="font-mono text-xs truncate">{block.hash}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <ArrowRightLeft className="h-4 w-4" />
                    <span>{block.txCount} Transactions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4" />
                    <span>{block.timestamp}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* The Arrow connecting the blocks */}
            {index < dummyChain.length - 1 && (
              <ArrowRight className="h-8 w-8 text-slate-300 mx-4" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}