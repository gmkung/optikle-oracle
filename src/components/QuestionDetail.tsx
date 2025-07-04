
import React, { useState } from "react";
import { AlertTriangle, Scale } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Question } from "./QuestionsList";
import DisputeView, { Dispute, Evidence } from "./DisputeView";
import TimelineView from "./TimelineView";
import QuestionHeader from "./question/QuestionHeader";
import QuestionInfo from "./question/QuestionInfo";
import QuestionDetails from "./question/QuestionDetails";
import AnswerOptions from "./question/AnswerOptions";
import AnswerHistory from "./question/AnswerHistory";
import QuestionFooter from "./question/QuestionFooter";
import ArbitrationRequestModal from "./ArbitrationRequestModal";
import { canRequestArbitration, isArbitrationRequested } from "@/utils/contractAddresses";

interface QuestionDetailProps {
  question: Question;
  onBack: () => void;
  disputeId: string | null;
  dispute: Dispute | undefined;
  disputeLoading: boolean;
  evidences: Evidence[];
  metaEvidence: any;
  arbitrableContractAddress: string | undefined;
}

const QuestionDetail: React.FC<QuestionDetailProps> = ({
  question,
  onBack,
  disputeId,
  dispute,
  disputeLoading,
  evidences,
  metaEvidence,
  arbitrableContractAddress,
}) => {
  const [showArbitrationModal, setShowArbitrationModal] = useState(false);

  const handleArbitrationRequested = (txHash: string) => {
    setShowArbitrationModal(false);
    console.log('Arbitration requested:', txHash);
  };

  const canRequestArbitrationForQuestion = canRequestArbitration(question);
  const isArbitrationAlreadyRequested = isArbitrationRequested(question);

  return (
    <div className="space-y-6 animate-fade-in">
      <QuestionHeader question={question} onBack={onBack} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-2">
          <QuestionInfo question={question} />
        </div>
        
        <div className="md:col-span-1">
          <TimelineView question={question} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="space-y-4">
          <QuestionDetails question={question} />
          <AnswerOptions question={question} />
          <AnswerHistory question={question} />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Dispute Information
            </h2>
            
            {/* Arbitration Request Button */}
            <Button
              variant={isArbitrationAlreadyRequested ? "outline" : "default"}
              size="sm"
              className="flex items-center gap-2"
              onClick={() => setShowArbitrationModal(true)}
              disabled={!canRequestArbitrationForQuestion}
            >
              <Scale className="h-4 w-4" />
              {isArbitrationAlreadyRequested ? "View Arbitration" : "Request Arbitration"}
            </Button>
          </div>
          
          <DisputeView
            question={question}
            disputeId={disputeId}
            dispute={dispute}
            disputeLoading={disputeLoading}
            evidences={evidences}
            metaEvidence={metaEvidence}
            arbitrableContractAddress={arbitrableContractAddress}
          />
          
          <QuestionFooter question={question} />
        </div>
      </div>

      {/* Arbitration Request Modal */}
      <ArbitrationRequestModal
        isOpen={showArbitrationModal}
        onClose={() => setShowArbitrationModal(false)}
        question={question}
        onArbitrationRequested={handleArbitrationRequested}
      />
    </div>
  );
};

export default QuestionDetail;
