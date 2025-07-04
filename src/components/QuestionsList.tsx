
import React from "react";
import { ArrowRight, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatBond, formatTimeRemaining, getPhaseColor, shortenAddress, truncateText } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import LoadingState from "./LoadingState";

export interface Question {
  id: string;
  title: string;
  description: string;
  arbitrator: string;
  options: string[];
  qType: string;
  phase: string;
  currentAnswer: string;
  openingTimestamp: number;
  arbitrationStatus?: string;
  currentBond: string;
  timeToOpen: number;
  timeRemaining: number;
  answers: any[];
  contract: string;
  createdTimestamp: number;
  currentScheduledFinalizationTimestamp?: string;
  finalAnswer?: string;
  disputeId?: number;
  appealPeriodEnd?: number;
  minimumBond: string;
  arbitrationRequestedBy?: string;
  responses: {
    value: string;
    timestamp: number;
    bond: string;
    user: string;
  }[];
  chain: {
    id: string;
    name: string;
    subgraphUrl: string;
    public_rpc_url: string;
    native_currency?: string;
  };
  template?: {
    templateId: string;
    questionText: string;
    creationTimestamp: string;
    creator: string;
  };
}

interface QuestionsListProps {
  questions: Question[];
  loading: boolean;
  error: string | null;
  onSelectQuestion: (question: Question) => void;
  loadMore: () => void;
  hasMore: boolean;
  loadingMore: boolean;
  className?: string;
}

const QuestionsList: React.FC<QuestionsListProps> = ({
  questions = [],
  loading = false,
  error = null,
  onSelectQuestion,
  loadMore,
  hasMore = false,
  loadingMore = false,
  className,
}) => {
  console.log("QuestionsList - questions:", questions?.length);
  console.log("QuestionsList - loading:", loading);
  console.log("QuestionsList - error:", error);
  
  // Add detailed logging for the first question's chain object
  if (questions && questions.length > 0) {
    console.log("First question chain object:", questions[0].chain);
    console.log("First question native_currency:", questions[0].chain?.native_currency);
  }

  if (loading && (!questions || questions.length === 0)) {
    return <LoadingState type="list" className={className} />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-40 rounded-lg border border-destructive/20 bg-destructive/5 text-destructive">
        <div className="flex flex-col items-center text-center p-4">
          <AlertTriangle className="h-8 w-8 mb-2" />
          <p className="font-medium">Error loading questions</p>
          <p className="text-sm text-destructive/80 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 rounded-lg border border-muted bg-muted/5 text-muted-foreground">
        <div className="flex flex-col items-center text-center p-4">
          <p className="font-medium">No questions found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full space-y-4", className)}>
      {questions.map((question) => (
        <div
          key={question.id}
          className="p-4 rounded-lg border hover:border-accent/50 transition-all hover:shadow-sm cursor-pointer animate-fade-in"
          onClick={() => onSelectQuestion(question)}
        >
          <div className="flex justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-lg">{truncateText(question.title || "Untitled Question", 80)}</h3>
              <p className="text-muted-foreground text-sm mt-1">
                {truncateText(question.description || "No description", 150)}
              </p>
              
              <div className="mt-3 flex flex-wrap gap-2 items-center">
                <Badge className={cn("font-normal", getPhaseColor(question.phase || "UNKNOWN"))}>
                  {question.phase || "Unknown"}
                </Badge>
                
                {question.timeRemaining > 0 && question.phase !== "FINALIZED" && (
                  <div className="text-xs flex items-center text-muted-foreground gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTimeRemaining(question.timeRemaining)}
                  </div>
                )}
                
                {question.phase === "FINALIZED" && (
                  <div className="text-xs flex items-center text-green-600 dark:text-green-400 gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Finalized
                  </div>
                )}
                
                {question.arbitrationRequestedBy && (
                  <Badge variant="outline" className="text-xs font-normal">
                    Arbitration Requested
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-end justify-between ml-4">
              <div className="text-sm text-right text-muted-foreground">
                Bond: {formatBond(question.currentBond || "0", question.chain?.native_currency)}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-4 ml-auto text-xs p-0 h-8 w-8 rounded-full hover:bg-accent/10"
              >
                <ArrowRight className="h-4 w-4" />
                <span className="sr-only">View Details</span>
              </Button>
            </div>
          </div>
        </div>
      ))}
      
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={loadingMore}
            className="w-40"
          >
            {loadingMore ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default QuestionsList;
