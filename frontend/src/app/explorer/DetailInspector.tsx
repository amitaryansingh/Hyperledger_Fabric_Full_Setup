"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function DetailInspector({ block }: any) {
  if (!block) return (
    <Card className="h-full flex items-center justify-center">
      <p className="text-muted-foreground">Select a block to see details</p>
    </Card>
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Block #{block.height}</CardTitle>
        <CardDescription className="font-mono text-xs break-all">{block.hash}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Timestamp</span>
          <span>{block.timestamp}</span>
        </div>
        <Separator />
        <div className="flex justify-between">
          <span className="text-muted-foreground">Transactions</span>
          <span>{block.txCount}</span>
        </div>
        <Separator />
        <div>
          <span className="text-muted-foreground">Previous Hash</span>
          <p className="font-mono text-xs break-all">{block.parentHash}</p>
        </div>
      </CardContent>
    </Card>
  );
}