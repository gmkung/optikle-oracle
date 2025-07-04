
import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getPhaseColor } from "@/lib/formatters";
import { Question } from "../QuestionsList";

interface QuestionHeaderProps {
  question: Question;
  onBack: () => void;
}

const QuestionHeader: React.FC<QuestionHeaderProps> = ({ question, onBack }) => {
  return (
    <div className="flex items-center gap-4">
      <Button 
        variant="ghost" 
        size="sm" 
        className="flex items-center gap-1 hover:bg-muted/30"
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Questions</span>
      </Button>
      
      <Badge className={cn("ml-auto", getPhaseColor(question.phase))}>
        {question.phase}
      </Badge>
    </div>
  );
};

export default QuestionHeader;
