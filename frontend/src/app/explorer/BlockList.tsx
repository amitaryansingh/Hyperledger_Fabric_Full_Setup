"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function BlockList({ blocks, onBlockSelect, selectedBlock }: any) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Blocks</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {blocks.map((block: any) => (
            <li
              key={block.id}
              onClick={() => onBlockSelect(block)}
              className={cn(
                "p-3 rounded-md cursor-pointer hover:bg-slate-100 transition-colors",
                selectedBlock?.id === block.id && "bg-blue-100 border-blue-400 border"
              )}
            >
              <div className="flex justify-between items-center">
                <p className="font-semibold">Block #{block.height}</p>
                <span className="text-xs px-2 py-1 rounded-full bg-slate-200 text-slate-700">{block.txCount} TXs</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{block.timestamp}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}