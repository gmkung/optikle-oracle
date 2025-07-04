
import React from "react";
import { HelpCircle } from "lucide-react";
import { formatBond, formatDate, shortenAddress } from "@/lib/formatters";
import { Question } from "../QuestionsList";

interface QuestionDetailsProps {
  question: Question;
}

const QuestionDetails: React.FC<QuestionDetailsProps> = ({ question }) => {
  return (
    <div>
      <h2 className="text-lg font-medium mb-2 flex items-center gap-2">
        <HelpCircle className="h-5 w-5" />
        Question Details
      </h2>
      
      <div className="space-y-3 rounded-lg border p-4">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Created</span>
          <span className="text-sm font-medium">{formatDate(question.createdTimestamp)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Type</span>
          <span className="text-sm font-medium">{question.qType || "Not specified"}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Current Bond</span>
          <span className="text-sm font-medium">{formatBond(question.currentBond, question.chain?.native_currency)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Minimum Bond</span>
          <span className="text-sm font-medium">{formatBond(question.minimumBond, question.chain?.native_currency)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Arbitrator</span>
          <span className="text-sm font-medium">{shortenAddress(question.arbitrator)}</span>
        </div>
        
        {question.arbitrationRequestedBy && (
          <div className="flex justify-between text-amber-600 dark:text-amber-400">
            <span className="text-sm">Arbitration Requested By</span>
            <span className="text-sm font-medium">{shortenAddress(question.arbitrationRequestedBy)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionDetails;
