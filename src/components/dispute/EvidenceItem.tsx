
import React, { useState } from "react";
import { Link2, User, ChevronDown, ChevronUp, FileText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { shortenAddress } from "@/lib/formatters";
import { Evidence } from "../DisputeView";
import { Skeleton } from "@/components/ui/skeleton";

interface EvidenceItemProps {
  evidence: Evidence;
  getCompleteURI: (uri: string) => string;
}

const EvidenceItem: React.FC<EvidenceItemProps> = ({ evidence, getCompleteURI }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Check if description is long enough to need collapsing
  const isLongDescription = evidence.URI_contents?.description && 
    evidence.URI_contents.description.length > 200;
  
  const toggleExpand = () => setExpanded(!expanded);

  if (evidence.isLoading) {
    return (
      <div className="border rounded-md p-3 space-y-2">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    );
  }

  if (evidence.error) {
    return (
      <div className="border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800/50 rounded-md p-3 space-y-2">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4" />
          <h5 className="font-medium">Failed to load evidence</h5>
        </div>
        <p className="text-sm text-muted-foreground">{evidence.error}</p>
        <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>Submitted by {shortenAddress(evidence.sender)}</span>
          </div>
          {evidence.creationTime && (
            <span className="text-xs">
              {new Date(parseInt(evidence.creationTime) * 1000).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="border rounded-md p-3 space-y-2 hover:border-accent/50 transition-all">
      <div className="flex justify-between items-center">
        <h5 className="font-medium">{evidence.URI_contents?.name || "Untitled Evidence"}</h5>
        <div className="flex items-center gap-1">
          {evidence.URI_contents?.fileURI && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 p-1" 
              onClick={() => window.open(getCompleteURI(evidence.URI_contents?.fileURI || ''), '_blank')}
              title="View attached file"
            >
              <FileText className="h-3 w-3" />
            </Button>
          )}
          {evidence.URI && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 p-1" 
              onClick={() => window.open(getCompleteURI(evidence.URI), '_blank')}
              title="View evidence source"
            >
              <Link2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      
      {evidence.URI_contents?.description ? (
        <div className="space-y-2">
          <div className={`relative text-sm text-muted-foreground whitespace-pre-line bg-muted/20 p-2 rounded-md border border-muted ${!expanded && isLongDescription ? 'max-h-24 overflow-hidden' : ''}`}>
            {evidence.URI_contents.description}
            
            {/* Fade-out effect for collapsed text */}
            {!expanded && isLongDescription && (
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background/90 to-transparent pointer-events-none" />
            )}
          </div>
          
          {isLongDescription && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs text-muted-foreground hover:text-foreground flex items-center justify-center"
              onClick={toggleExpand}
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Show more
                </>
              )}
            </Button>
          )}
          
          {evidence.URI_contents?.evidenceSide !== undefined && (
            <div className="text-xs bg-muted/30 p-1 rounded">
              <span className="font-medium">Evidence Side:</span> {evidence.URI_contents.evidenceSide === 0 ? "Requester" : "Challenger"}
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">No description provided</p>
      )}
      
      <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
        <div className="flex items-center gap-1">
          <User className="h-3 w-3" />
          <span>Submitted by {shortenAddress(evidence.sender)}</span>
        </div>
        {evidence.creationTime && (
          <span className="text-xs">
            {new Date(parseInt(evidence.creationTime) * 1000).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
};

export default EvidenceItem;
