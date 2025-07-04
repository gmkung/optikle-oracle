
import React from "react";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { shortenAddress } from "@/lib/formatters";
import { Dispute } from "../DisputeView";

interface DisputeDetailsProps {
  dispute: Dispute;
  getPeriodName: (period: number) => string;
}

const DisputeDetails: React.FC<DisputeDetailsProps> = ({ dispute, getPeriodName }) => {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Dispute Details</h4>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex flex-col p-3 rounded-md bg-secondary/50">
          <span className="text-xs text-muted-foreground">Number of Rounds</span>
          <span className="font-medium">{dispute.nbRounds}</span>
        </div>
        <div className="flex flex-col p-3 rounded-md bg-secondary/50">
          <span className="text-xs text-muted-foreground">Number of Choices</span>
          <span className="font-medium">{dispute.nbChoices}</span>
        </div>
        <div className="flex flex-col p-3 rounded-md bg-secondary/50">
          <span className="text-xs text-muted-foreground">Arbitrable Contract</span>
          <span className="font-medium truncate">{shortenAddress(dispute.arbitrated)}</span>
        </div>
        {dispute.ruled && (
          <div className="flex flex-col p-3 rounded-md bg-secondary/50">
            <span className="text-xs text-muted-foreground">Ruling</span>
            <span className="font-medium">{dispute.ruling}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DisputeDetails;
