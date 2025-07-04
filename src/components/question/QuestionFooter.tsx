
import React from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { shortenAddress } from "@/lib/formatters";
import { Question } from "../QuestionsList";

interface QuestionFooterProps {
  question: Question;
}

const QuestionFooter: React.FC<QuestionFooterProps> = ({ question }) => {
  return (
    <>
      <div className="mt-4 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>Chain: {question.chain.name}</span>
          <Button 
            variant="link" 
            size="sm" 
            className="h-6 p-0 text-xs flex items-center gap-1 text-muted-foreground hover:text-accent"
          >
            <ExternalLink className="h-3 w-3" />
            <span>View on-chain</span>
          </Button>
        </div>
      </div>
      
      <Separator className="my-6" />
      
      <div className="text-xs text-muted-foreground">
        <p>Question ID: {question.id}</p>
        <p>Contract: {shortenAddress(question.contract)}</p>
      </div>
    </>
  );
};

export default QuestionFooter;
