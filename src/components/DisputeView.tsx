
import React, { useState, useEffect } from "react";
import { ExternalLink, Check, AlertCircle, Scale, Scroll } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import LoadingState from "./LoadingState";
import { Question } from "./QuestionsList";
import DisputeDetails from "./dispute/DisputeDetails";
import EvidenceList from "./dispute/EvidenceList";
import NoDisputeView from "./dispute/NoDisputeView";

export interface Evidence {
  id: string;
  URI: string;
  URI_contents?: {
    name?: string;
    description?: string;
    fileURI?: string;
    evidenceSide?: number;
  };
  creationTime: string;
  sender: string;
  isLoading?: boolean;
  error?: string;
}

export interface Dispute {
  id: string;
  period: number;
  periodDeadline: string;
  nbRounds: string;
  nbChoices: string;
  rounds: {
    jurors: string;
    isCurrentRound: boolean;
  }[];
  lastPeriodChangeTs: string;
  arbitrableHistory: {
    id: string;
    metaEvidence: string;
  }[];
  arbitrated: string;
  ruled: boolean;
  ruling: string;
  evidenceGroup: {
    id: string;
    length: string;
    evidence: Evidence[];
  };
}

interface DisputeViewProps {
  question: Question;
  disputeId: string | null;
  dispute: Dispute | undefined;
  disputeLoading: boolean;
  evidences: Evidence[];
  metaEvidence: any;
  arbitrableContractAddress: string | undefined;
}

const DisputeView: React.FC<DisputeViewProps> = ({
  question,
  disputeId,
  dispute,
  disputeLoading,
  evidences: initialEvidences,
  metaEvidence,
  arbitrableContractAddress,
}) => {
  const { toast } = useToast();
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  
  // Helper function to get complete URL for evidence URIs
  const getCompleteURI = (uri: string) => {
    if (!uri) return '';
    
    // Check if the URI already has a protocol
    if (uri.startsWith('http://') || uri.startsWith('https://')) {
      return uri;
    }
    
    // Append the CDN prefix to the URI
    return `https://cdn.kleros.link${uri.startsWith('/') ? '' : '/'}${uri}`;
  };

  // Fetch evidence data when component mounts or when evidence list changes
  useEffect(() => {
    const fetchEvidenceData = async () => {
      if (!initialEvidences || initialEvidences.length === 0) {
        setEvidences([]);
        return;
      }
      
      // Start with initial evidence data and mark all as loading
      const evidencesWithLoadingState = initialEvidences.map(evidence => ({
        ...evidence,
        isLoading: true,
        error: undefined
      }));
      setEvidences(evidencesWithLoadingState);
      
      // Fetch each evidence's JSON data
      const fetchPromises = initialEvidences.map(async (evidence, index) => {
        try {
          if (!evidence.URI) {
            return {
              ...evidence,
              isLoading: false,
              error: "No URI provided"
            };
          }
          
          const completeURI = getCompleteURI(evidence.URI);
          const response = await fetch(completeURI);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch evidence: ${response.status}`);
          }
          
          const data = await response.json();
          
          return {
            ...evidence,
            URI_contents: data,
            isLoading: false
          };
        } catch (error) {
          console.error(`Error fetching evidence ${evidence.id}:`, error);
          return {
            ...evidence,
            isLoading: false,
            error: error instanceof Error ? error.message : "Failed to fetch evidence data"
          };
        }
      });
      
      // Update state as each fetch completes
      const results = await Promise.all(fetchPromises);
      setEvidences(results);
    };
    
    fetchEvidenceData();
  }, [initialEvidences]);

  if (disputeLoading) {
    return <LoadingState type="detail" />;
  }

  if (!disputeId || !dispute) {
    return <NoDisputeView question={question} />;
  }

  // Format period status
  const getPeriodName = (period: number) => {
    const periods = [
      "Evidence Submission",
      "Commit",
      "Vote",
      "Appeal",
      "Execution"
    ];
    return periods[period] || "Unknown Phase";
  };

  return (
    <Card className="casino-card animate-fade-in overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-400/0 via-purple-400/30 to-purple-400/0"></div>
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Scale className="h-5 w-5 text-purple-400" />
              <span className="bg-gradient-to-r from-purple-200 to-purple-400 bg-clip-text text-transparent">
                Dispute #{dispute.id}
              </span>
              {dispute.ruled && (
                <Badge variant="outline" className="ml-2 bg-green-100/10 text-green-400 dark:bg-green-900/30 dark:text-green-400 border-green-400/30">
                  <Check className="h-3 w-3 mr-1" /> Ruled
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="flex items-center mt-1">
              <span className="inline-flex items-center justify-center bg-purple-500/10 rounded-full px-2 py-0.5 text-xs">
                <AlertCircle className="h-3 w-3 mr-1 text-purple-400" />
                Status: {getPeriodName(dispute.period)} {dispute.ruled ? "(Completed)" : "(In Progress)"}
              </span>
            </CardDescription>
          </div>
          
          {arbitrableContractAddress && (
            <Button variant="outline" size="sm" className="gap-1 border-purple-400/30 hover:bg-purple-400/10 text-purple-200" 
              onClick={() => window.open(`https://etherscan.io/address/${arbitrableContractAddress}`, '_blank')}
            >
              <ExternalLink className="h-3 w-3" />
              <span className="text-xs">View on Explorer</span>
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <DisputeDetails dispute={dispute} getPeriodName={getPeriodName} />
        
        <Separator className="bg-purple-400/20" />
        
        <div className="relative">
          <div className="absolute left-3 top-0">
            <Scroll className="h-4 w-4 text-purple-400/50" />
          </div>
          <EvidenceList evidences={evidences} getCompleteURI={getCompleteURI} />
        </div>
      </CardContent>
      
      <CardFooter className="border-t border-purple-400/20 pt-4 flex flex-col items-start">
        <div className="text-xs text-muted-foreground">
          <p className="mb-1">Question ID: {question.id}</p>
          <p>Dispute ID: {disputeId}</p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DisputeView;
