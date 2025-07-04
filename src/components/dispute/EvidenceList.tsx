
import React, { useState } from "react";
import { FileText, Search } from "lucide-react";
import EvidenceItem from "./EvidenceItem";
import { Evidence } from "../DisputeView";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface EvidenceListProps {
  evidences: Evidence[];
  getCompleteURI: (uri: string) => string;
}

const EvidenceList: React.FC<EvidenceListProps> = ({ evidences, getCompleteURI }) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter evidences based on search term
  const filteredEvidences = evidences.filter(evidence => {
    const name = evidence.URI_contents?.name || "";
    const description = evidence.URI_contents?.description || "";
    const searchLower = searchTerm.toLowerCase();
    
    return name.toLowerCase().includes(searchLower) || 
           description.toLowerCase().includes(searchLower);
  });
  
  const isLoadingEvidences = evidences.some(evidence => evidence.isLoading);
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Evidence ({evidences.length})
        </h4>
        
        {evidences.length > 2 && (
          <div className="relative w-48">
            <Input
              placeholder="Search evidence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 text-xs pl-7"
            />
            <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
          </div>
        )}
      </div>
      
      {evidences.length === 0 ? (
        <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-md">
          No evidence has been submitted for this dispute.
        </div>
      ) : isLoadingEvidences ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="border rounded-md p-3 space-y-2">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      ) : filteredEvidences.length === 0 ? (
        <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-md">
          No evidence matching "{searchTerm}".
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEvidences.map((evidence) => (
            <EvidenceItem 
              key={evidence.id} 
              evidence={evidence} 
              getCompleteURI={getCompleteURI} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EvidenceList;
