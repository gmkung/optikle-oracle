
import React from "react";
import { Tags } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Question } from "../QuestionsList";

interface AnswerOptionsProps {
  question: Question;
}

const AnswerOptions: React.FC<AnswerOptionsProps> = ({ question }) => {
  return (
    <div>
      <h2 className="text-lg font-medium mb-2 flex items-center gap-2">
        <Tags className="h-5 w-5" />
        Answer Options
      </h2>
      
      <div className="space-y-2 rounded-lg border p-4">
        {question.options && question.options.length > 0 ? (
          question.options.map((option, index) => (
            <div 
              key={index}
              className={cn(
                "p-2 rounded-md text-sm",
                question.currentAnswer === String(index) 
                  ? "bg-accent/10 border border-accent/20" 
                  : "bg-muted/30"
              )}
            >
              <div className="flex justify-between items-center">
                <span>{option}</span>
                {question.currentAnswer === String(index) && (
                  <Badge variant="outline" className="text-xs bg-accent/5 border-accent/20">
                    Current Answer
                  </Badge>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-muted-foreground">No answer options available</div>
        )}
      </div>
    </div>
  );
};

export default AnswerOptions;
