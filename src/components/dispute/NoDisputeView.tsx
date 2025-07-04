
import React from "react";
import { AlertCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { shortenAddress } from "@/lib/formatters";
import { Question } from "../QuestionsList";

interface NoDisputeViewProps {
  question: Question;
}

const NoDisputeView: React.FC<NoDisputeViewProps> = ({ question }) => {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          No Dispute Information
        </CardTitle>
        <CardDescription>
          This question does not have an active dispute or the dispute data could not be found.
        </CardDescription>
      </CardHeader>
      {question.arbitrationRequestedBy && (
        <CardContent>
          <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 p-3 text-sm">
            <p className="flex items-center gap-2 font-medium">
              <AlertTriangle className="h-4 w-4" />
              Arbitration was requested by {shortenAddress(question.arbitrationRequestedBy)}
            </p>
            <p className="mt-1 text-amber-600 dark:text-amber-500">
              The dispute data might still be indexing or unavailable at this time.
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default NoDisputeView;
