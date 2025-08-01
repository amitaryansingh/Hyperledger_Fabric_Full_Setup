// // import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// // import { Input } from "@/components/ui/input";
// // import { Separator } from "@/components/ui/separator";
// // import { Blocks, ArrowRightLeft, Search, Network } from "lucide-react";
// // import { BlockChainView } from "./BlockChainView"; // Import the new component

// // // Dummy Data for UI Mockup
// // const dummyTransactions = [
// //     { hash: "0x123…eef", type: "CreateLandParcel", parcelId: "NAGPUR-101", timestamp: "3 mins ago" },
// //     { hash: "0x456…dca", type: "CreateLandParcel", parcelId: "WARDHA-451", timestamp: "6 mins ago" },
// //     { hash: "0x789…bba", type: "UpdateCompensation", parcelId: "NAGPUR-101", timestamp: "9 mins ago" },
// // ];


// // export default function BlockchainExplorerPage() {
// //   return (
// //     <div className="container mx-auto py-10 space-y-8">
// //       <div>
// //         <h1 className="text-3xl font-bold tracking-tight">Blockchain Ledger Explorer</h1>
// //         <p className="text-muted-foreground">
// //           A real-time, immutable view of all ledger activities.
// //         </p>
// //       </div>

// //       {/* Metrics Panel */}
// //       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
// //           {/* Cards remain the same */}
// //       </div>

// //       {/* Search Bar */}
// //       <Card>
// //         {/* Search bar remains the same */}
// //       </Card>

// //       {/* --- THE FIX IS HERE --- */}
// //       {/* Replace the old block list with the new graphical view */}
// //       <BlockChainView />

// //       <Separator />

// //       {/* Recent Transactions Card */}
// //       <Card>
// //         <CardHeader>
// //           <CardTitle>Recent Transactions</CardTitle>
// //           <CardDescription>The latest transactions recorded on the blockchain.</CardDescription>
// //         </CardHeader>
// //         <CardContent>
// //              <ul className="space-y-4">
// //               {dummyTransactions.map((tx) => (
// //                 <li key={tx.hash} className="flex items-center justify-between">
// //                   <div className="flex items-center gap-4">
// //                     <div className="bg-slate-100 p-3 rounded-md">
// //                       <ArrowRightLeft className="h-5 w-5 text-slate-600" />
// //                     </div>
// //                     <div>
// //                       <p className="font-semibold hover:underline cursor-pointer font-mono text-sm">{tx.hash}</p>
// //                       <p className="text-sm text-muted-foreground">Type: <span className="font-semibold text-primary">{tx.type}</span></p>
// //                     </div>
// //                   </div>
// //                   <div className="text-right">
// //                      <p className="text-sm">Parcel: <span className="font-semibold">{tx.parcelId}</span></p>
// //                      <p className="text-xs text-muted-foreground">{tx.timestamp}</p>
// //                   </div>
// //                 </li>
// //               ))}
// //             </ul>
// //           </CardContent>
// //       </Card>
// //     </div>
// //   );
// // }


// "use client";

// import { useState } from "react";
// import { BlockGraph } from "./BlockGraph"; // We will create this
// import { BlockList } from "./BlockList";   // We will create this
// import { DetailInspector } from "./DetailInspector"; // We will create this
// import { ExplorerControls } from "./ExplorerControls"; // We will create this

// // This is our dummy data, structured to power all components
// const dummyBlocks = [
//   { id: '102', height: 102, hash: "0xabc…f12", txCount: 3, timestamp: "2 mins ago", parentHash: "0xdef…a45", eventType: "Payment" },
//   { id: '101', height: 101, hash: "0xdef…a45", txCount: 1, timestamp: "5 mins ago", parentHash: "0xghi…c78", eventType: "Award" },
//   { id: '100', height: 100, hash: "0xghi…c78", txCount: 5, timestamp: "8 mins ago", parentHash: "0xjkl…b01", eventType: "Litigation" },
//   { id: '99', height: 99, hash: "0xjkl…b01", txCount: 2, timestamp: "12 mins ago", parentHash: "0x mno…345", eventType: "Award" },
// ];

// export default function BlockchainExplorerPage() {
//   // State to manage which block is currently selected
//   const [selectedBlock, setSelectedBlock] = useState(dummyBlocks[0]);

//   return (
//     <div className="container mx-auto py-10 h-screen flex flex-col">
//       <div>
//         <h1 className="text-3xl font-bold tracking-tight">Blockchain Ledger Explorer</h1>
//         <p className="text-muted-foreground">
//           An interactive, real-time view of all ledger activities.
//         </p>
//       </div>

//       <ExplorerControls />

//       <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 overflow-hidden">
//         {/* Left Pane: Block List */}
//         <div className="lg:col-span-3 h-full overflow-y-auto">
//           <BlockList blocks={dummyBlocks} onBlockSelect={setSelectedBlock} selectedBlock={selectedBlock} />
//         </div>

//         {/* Center Pane: Graph View */}
//         <div className="lg:col-span-6 h-full rounded-lg border bg-slate-50">
//           <BlockGraph blocks={dummyBlocks} onBlockSelect={setSelectedBlock} />
//         </div>

//         {/* Right Pane: Detail Inspector */}
//         <div className="lg:col-span-3 h-full overflow-y-auto">
//           <DetailInspector block={selectedBlock} />
//         </div>
//       </div>
//     </div>
//   );
// }











"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { CompatClient, Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import { BlockGraph } from "./BlockGraph";
import { BlockList } from "./BlockList";
import { DetailInspector } from "./DetailInspector";
import { ExplorerControls } from "./ExplorerControls";
import { Block } from "@/app/types";

export default function BlockchainExplorerPage() {
    const [allBlocks, setAllBlocks] = useState<Block[]>([]);
    const [filteredBlocks, setFilteredBlocks] = useState<Block[]>([]);
    const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [stompClient, setStompClient] = useState<CompatClient | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const infoResponse = await axios.get("http://localhost:8080/api/explorer/info");
                const blockHeight = infoResponse.data.height;

                const blockPromises = [];
                // Fetch the last 15 blocks, or all if less than 15
                for (let i = blockHeight - 1; i >= 0 && i > blockHeight - 16; i--) {
                    blockPromises.push(axios.get(`http://localhost:8080/api/explorer/block/${i}`));
                }
                const blockResponses = await Promise.all(blockPromises);
                const fetchedBlocks: Block[] = blockResponses.map(res => res.data);

                setAllBlocks(fetchedBlocks);
                if (fetchedBlocks.length > 0) {
                    setSelectedBlock(fetchedBlocks[0]);
                }
            } catch (error) {
                console.error("Failed to fetch initial block data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();

        // Establish WebSocket connection
        const socket = new SockJS('http://localhost:8080/ws-land-ledger');
        const client = Stomp.over(socket);
        client.reconnect_delay = 5000;

        client.connect({}, () => {
            console.log('Connected to WebSocket for real-time block updates.');
            client.subscribe('/topic/new-blocks', (message) => {
                const newBlock: Block = JSON.parse(message.body);
                console.log("New block received via WebSocket:", newBlock);
                setAllBlocks(prevBlocks => [newBlock, ...prevBlocks]);
            });
        });

        setStompClient(client);

        return () => {
            if (client && client.connected) {
                client.disconnect();
                console.log('Disconnected WebSocket.');
            }
        };
    }, []);

    // Effect for filtering blocks based on search term
    useEffect(() => {
        if (!searchTerm) {
            setFilteredBlocks(allBlocks);
            return;
        }

        const lowercasedFilter = searchTerm.toLowerCase();
        const filtered = allBlocks.filter(block => {
            // Search by Block Number
            if (block.blockNumber.toString().includes(lowercasedFilter)) {
                return true;
            }
            // Search within Transactions
            return block.transactions.some(tx => 
                tx.transactionId.toLowerCase().includes(lowercasedFilter) ||
                tx.functionName.toLowerCase().includes(lowercasedFilter) ||
                // Search within function arguments
                tx.functionArgs.some(arg => arg.toLowerCase().includes(lowercasedFilter))
            );
        });
        setFilteredBlocks(filtered);
    }, [searchTerm, allBlocks]);


    if (isLoading) {
        return <div className="container mx-auto p-10 text-center">Loading Ledger Data...</div>;
    }

    return (
        <div className="container mx-auto py-10 h-[calc(100vh-2rem)] flex flex-col">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Real-Time Ledger Explorer</h1>
                <p className="text-muted-foreground">
                    An interactive, real-time view of all ledger activities.
                </p>
            </div>
            
            <ExplorerControls onSearch={setSearchTerm} />
            
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 overflow-hidden">
                <div className="lg:col-span-3 h-full overflow-y-auto pr-2">
                    <BlockList 
                        blocks={filteredBlocks} 
                        onBlockSelect={setSelectedBlock} 
                        selectedBlock={selectedBlock} 
                    />
                </div>
                <div className="lg:col-span-6 h-full rounded-lg border bg-slate-50 flex items-center justify-center">
                    <BlockGraph blocks={filteredBlocks} onBlockSelect={setSelectedBlock} />
                </div>
                <div className="lg:col-span-3 h-full overflow-y-auto">
                    <DetailInspector block={selectedBlock} />
                </div>
            </div>
        </div>
    );
}