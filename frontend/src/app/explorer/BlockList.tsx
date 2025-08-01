// // "use client";
// // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // import { cn } from "@/lib/utils";

// // export function BlockList({ blocks, onBlockSelect, selectedBlock }: any) {
// //   return (
// //     <Card className="h-full">
// //       <CardHeader>
// //         <CardTitle>Recent Blocks</CardTitle>
// //       </CardHeader>
// //       <CardContent>
// //         <ul className="space-y-2">
// //           {blocks.map((block: any) => (
// //             <li
// //               key={block.id}
// //               onClick={() => onBlockSelect(block)}
// //               className={cn(
// //                 "p-3 rounded-md cursor-pointer hover:bg-slate-100 transition-colors",
// //                 selectedBlock?.id === block.id && "bg-blue-100 border-blue-400 border"
// //               )}
// //             >
// //               <div className="flex justify-between items-center">
// //                 <p className="font-semibold">Block #{block.height}</p>
// //                 <span className="text-xs px-2 py-1 rounded-full bg-slate-200 text-slate-700">{block.txCount} TXs</span>
// //               </div>
// //               <p className="text-xs text-muted-foreground mt-1">{block.timestamp}</p>
// //             </li>
// //           ))}
// //         </ul>
// //       </CardContent>
// //     </Card>
// //   );
// // }



// "use client";
// import { Card, CardContent } from "@/components/ui/card";
// import { Block } from "@/app/types";
// import { cn } from "@/lib/utils";

// interface BlockListProps {
//   blocks: Block[];
//   selectedBlock: Block | null;
//   onBlockSelect: (block: Block) => void;
// }

// export function BlockList({ blocks, selectedBlock, onBlockSelect }: BlockListProps) {
//   return (
//     <Card>
//       <CardContent className="p-3">
//         <h3 className="text-lg font-semibold mb-2 px-3">Recent Blocks</h3>
//         <div className="space-y-2">
//           {blocks.map((block) => (
//             <div
//               key={block.blockNumber}
//               onClick={() => onBlockSelect(block)}
//               className={cn(
//                 "p-3 rounded-md cursor-pointer hover:bg-slate-100",
//                 selectedBlock?.blockNumber === block.blockNumber && "bg-blue-100 hover:bg-blue-100"
//               )}
//             >
//               <div className="flex justify-between items-center">
//                 <p className="font-bold">Block #{block.blockNumber}</p>
//                 <p className="text-xs text-muted-foreground">{block.transactions.length} TXs</p>
//               </div>
//               <p className="text-xs text-muted-foreground">{new Date(block.timestamp).toLocaleTimeString()}</p>
//             </div>
//           ))}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }



// src/app/explorer/BlockList.tsx

"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Block } from "@/app/types";
import { cn } from "@/lib/utils";

interface BlockListProps {
  blocks: Block[];
  selectedBlock: Block | null;
  onBlockSelect: (block: Block) => void;
}

export function BlockList({ blocks, selectedBlock, onBlockSelect }: BlockListProps) {
  return (
    <Card>
      <CardContent className="p-3">
        <h3 className="text-lg font-semibold mb-2 px-3">Blocks</h3>
        <div className="space-y-2">
          {blocks.map((block) => (
            // Use block.blockNumber for the key
            <div
              key={block.blockNumber} 
              onClick={() => onBlockSelect(block)}
              className={cn(
                "p-3 rounded-md cursor-pointer hover:bg-slate-100",
                selectedBlock?.blockNumber === block.blockNumber && "bg-blue-100 hover:bg-blue-100"
              )}
            >
              <div className="flex justify-between items-center">
                <p className="font-bold">Block #{block.blockNumber}</p>
                <p className="text-xs text-muted-foreground">{block.transactions.length} TXs</p>
              </div>
              <p className="text-xs text-muted-foreground">{new Date(block.timestamp).toLocaleTimeString()}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}