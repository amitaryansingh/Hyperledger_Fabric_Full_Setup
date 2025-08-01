"use client";
import ReactFlow, { MiniMap, Controls, Background, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';

const getNodeColor = (eventType: string) => {
    switch (eventType) {
        case "Payment": return '!bg-green-500';
        case "Litigation": return '!bg-red-500';
        case "Award":
        default: return '!bg-blue-500';
    }
}

export function BlockGraph({ blocks, onBlockSelect }: any) {
    const initialNodes: Node[] = blocks.map((block: any, index: number) => ({
        id: block.id,
        position: { x: index * 200, y: 150 },
        data: { label: `Block #${block.height}` },
        className: getNodeColor(block.eventType),
    }));

    const initialEdges: Edge[] = blocks.slice(0, -1).map((block: any, index: number) => ({
        id: `e${block.id}-${blocks[index + 1].id}`,
        source: block.id,
        target: blocks[index + 1].id,
        animated: true,
    }));

    return (
        <ReactFlow
            nodes={initialNodes}
            edges={initialEdges}
            onNodeClick={(_, node) => onBlockSelect(blocks.find((b:any) => b.id === node.id))}
            fitView
        >
            <MiniMap />
            <Controls />
            <Background />
        </ReactFlow>
    );
}