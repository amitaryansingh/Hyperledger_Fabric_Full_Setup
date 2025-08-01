// "use client";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";

// export function DetailInspector({ block }: any) {
//   if (!block) return (
//     <Card className="h-full flex items-center justify-center">
//       <p className="text-muted-foreground">Select a block to see details</p>
//     </Card>
//   );

//   return (
//     <Card className="h-full">
//       <CardHeader>
//         <CardTitle>Block #{block.height}</CardTitle>
//         <CardDescription className="font-mono text-xs break-all">{block.hash}</CardDescription>
//       </CardHeader>
//       <CardContent className="space-y-3 text-sm">
//         <div className="flex justify-between">
//           <span className="text-muted-foreground">Timestamp</span>
//           <span>{block.timestamp}</span>
//         </div>
//         <Separator />
//         <div className="flex justify-between">
//           <span className="text-muted-foreground">Transactions</span>
//           <span>{block.txCount}</span>
//         </div>
//         <Separator />
//         <div>
//           <span className="text-muted-foreground">Previous Hash</span>
//           <p className="font-mono text-xs break-all">{block.parentHash}</p>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }



"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Block } from "@/app/types";

function isJson(str: string) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

const ArgViewer = ({ arg }: { arg: string }) => {
    if (isJson(arg)) {
        return (
            <pre className="mt-1 p-2 bg-gray-800 text-white rounded-md text-xs whitespace-pre-wrap break-all">
                {JSON.stringify(JSON.parse(arg), null, 2)}
            </pre>
        );
    }
    return <li className="font-mono text-xs break-all">{arg}</li>;
};

export function DetailInspector({ block }: { block: Block | null }) {
    if (!block) {
        return (
            <Card className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">Select a block to see details</p>
            </Card>
        );
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Block #{block.blockNumber}</CardTitle>
                <CardDescription className="font-mono text-xs break-all">{block.dataHash}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Timestamp</span>
                    <span>{new Date(block.timestamp).toLocaleString()}</span>
                </div>
                <Separator />
                <div>
                    <span className="text-muted-foreground">Previous Hash</span>
                    <p className="font-mono text-xs break-all">{block.previousHash}</p>
                </div>
                <Separator />
                <div>
                    <h4 className="text-lg font-semibold mb-2">Transactions ({block.transactions?.length || 0})</h4>
                    <div className="space-y-3">
                        {block.transactions?.map((tx) => (
                            <div key={tx.transactionId} className="text-xs border p-3 rounded-lg bg-slate-50">
                                <p className="font-bold text-base text-blue-700">{tx.functionName}</p>
                                <p className="font-mono break-all text-slate-500 text-[10px] my-1">{tx.transactionId}</p>
                                <p>Submitted by: <span className="font-semibold">{tx.creatorMspId}</span></p>
                                <p>Chaincode: <span className="font-semibold">{tx.chaincodeName}</span></p>
                                
                                {tx.functionArgs && tx.functionArgs.length > 0 && (
                                    <div className="mt-2 pt-2 border-t">
                                        <p className="font-semibold text-sm mb-1">Arguments:</p>
                                        <ul className="space-y-2">
                                            {tx.functionArgs.map((arg: string, index: number) => (
                                                <ArgViewer key={index} arg={arg} />
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}