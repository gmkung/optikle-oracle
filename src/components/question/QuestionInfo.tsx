
import React, { useEffect } from "react";
import { Question } from "../QuestionsList";

interface QuestionInfoProps {
  question: Question;
}

const QuestionInfo: React.FC<QuestionInfoProps> = ({ question }) => {
  useEffect(() => {
    console.log("QuestionInfo - question.chain:", question.chain);
  }, [question]);

  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-medium tracking-tight">{question.title}</h1>
      <p className="text-muted-foreground whitespace-pre-line">{question.description || "No description"}</p>
    </div>
  );
};

export default QuestionInfo;
