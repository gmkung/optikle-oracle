
import React from "react";
import { Calendar, User } from "lucide-react";
import { formatBond, formatDate, shortenAddress } from "@/lib/formatters";
import { Question } from "../QuestionsList";

interface AnswerHistoryProps {
  question: Question;
}

const AnswerHistory: React.FC<AnswerHistoryProps> = ({ question }) => {
  if (!question.responses || question.responses.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-lg font-medium mb-2 flex items-center gap-2">
        <Calendar className="h-5 w-5" />
        Answer History
      </h2>
      
      <div className="space-y-2 rounded-lg border p-4 max-h-80 overflow-y-auto custom-scrollbar">
        {question.responses.map((response, index) => (
          <div key={index} className="flex justify-between items-center p-2 text-sm border-b last:border-0">
            <div className="flex items-center gap-2">
              <User className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium">{shortenAddress(response.user)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{formatBond(response.bond, question.chain?.native_currency)}</span>
              <span className="text-xs text-muted-foreground">{formatDate(response.timestamp)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnswerHistory;
