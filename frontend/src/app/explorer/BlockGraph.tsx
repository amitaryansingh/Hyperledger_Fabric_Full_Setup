// "use client";
// import ReactFlow, { MiniMap, Controls, Background, Node, Edge } from 'reactflow';
// import 'reactflow/dist/style.css';

// const getNodeColor = (eventType: string) => {
//     switch (eventType) {
//         case "Payment": return '!bg-green-500';
//         case "Litigation": return '!bg-red-500';
//         case "Award":
//         default: return '!bg-blue-500';
//     }
// }

// export function BlockGraph({ blocks, onBlockSelect }: any) {
//     const initialNodes: Node[] = blocks.map((block: any, index: number) => ({
//         id: block.id,
//         position: { x: index * 200, y: 150 },
//         data: { label: `Block #${block.height}` },
//         className: getNodeColor(block.eventType),
//     }));

//     const initialEdges: Edge[] = blocks.slice(0, -1).map((block: any, index: number) => ({
//         id: `e${block.id}-${blocks[index + 1].id}`,
//         source: block.id,
//         target: blocks[index + 1].id,
//         animated: true,
//     }));

//     return (
//         <ReactFlow
//             nodes={initialNodes}
//             edges={initialEdges}
//             onNodeClick={(_, node) => onBlockSelect(blocks.find((b:any) => b.id === node.id))}
//             fitView
//         >
//             <MiniMap />
//             <Controls />
//             <Background />
//         </ReactFlow>
//     );
// }

"use client";

// Correct imports for the 'reactflow' library
import ReactFlow, { MiniMap, Controls, Background, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { Block } from '@/app/types';

interface BlockGraphProps {
  blocks: Block[];
  onBlockSelect: (block: Block) => void;
}

export function BlockGraph({ blocks, onBlockSelect }: BlockGraphProps) {
  if (!blocks || blocks.length === 0) {
    return <div className="text-muted-foreground">No blocks to display.</div>;
  }

  // Create nodes from blocks using the correct `blockNumber` as a string ID
  const initialNodes: Node[] = blocks.map((block: Block, i: number) => ({
    id: String(block.blockNumber), // Use blockNumber as the unique ID
    type: 'default',
    data: { label: `Block #${block.blockNumber}` },
    position: { x: i * -200, y: 0 }, // Adjust layout for better flow
  }));

  // Create edges to link the nodes
  const initialEdges: Edge[] = [];
  for (let i = 0; i < blocks.length - 1; i++) {
    const sourceBlock = blocks[i];
    const targetBlock = blocks[i+1];
    initialEdges.push({
      id: `e${sourceBlock.blockNumber}-${targetBlock.blockNumber}`, // Use blockNumbers for a unique edge ID
      source: String(sourceBlock.blockNumber),
      target: String(targetBlock.blockNumber),
      animated: true,
    });
  }

  const handleNodeClick = (_: React.MouseEvent, node: Node) => {
    const selected = blocks.find((b: Block) => String(b.blockNumber) === node.id);
    if (selected) {
      onBlockSelect(selected);
    }
  };

  return (
    <ReactFlow
      nodes={initialNodes}
      edges={initialEdges}
      onNodeClick={handleNodeClick}
      fitView
    >
      <Controls />
      <MiniMap />
      <Background color="#aaa" gap={16} />
    </ReactFlow>
  );
}