"use client";
import { Input } from "@/components/ui/input";

interface ExplorerControlsProps {
    onSearch: (term: string) => void;
}

export function ExplorerControls({ onSearch }: ExplorerControlsProps) {
    return (
        <div className="py-4">
            <Input 
                placeholder="Search by Block #, Tx ID, Function Name, or Argument..."
                onChange={(e) => onSearch(e.target.value)}
            />
        </div>
    );
}