"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, CalendarDays } from "lucide-react";

export function ExplorerControls() {
  return (
    <div className="flex flex-col md:flex-row items-center gap-4 mt-6">
      <div className="relative flex-grow w-full">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by Block Number, Tx ID, or Parcel ID..." className="pl-9" />
      </div>
      <div className="flex gap-2">
        <Button variant="outline"><CalendarDays className="mr-2 h-4 w-4" /> Date Range</Button>
        <Button variant="outline"><SlidersHorizontal className="mr-2 h-4 w-4" /> Filter Type</Button>
      </div>
    </div>
  );
}