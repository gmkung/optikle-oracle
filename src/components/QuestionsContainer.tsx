
import React, { useState, useEffect } from "react";
import { useQuestions, useDisputeData } from "reality-data-service";
import { SUPPORTED_CHAINS } from "reality-data-service";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import QuestionsList, { Question } from "./QuestionsList";
import QuestionDetail from "./QuestionDetail";
import ChainSelector from "./ChainSelector";
import SearchFilter from "./SearchFilter";
import CreateQuestionModal from "./CreateQuestionModal";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { useQuestionFilters } from "@/hooks/useQuestionFilters";

const QuestionsContainer: React.FC = () => {
  const [selectedChain, setSelectedChain] = useState(SUPPORTED_CHAINS[0]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch questions first - we need the data for filters
  const {
    questions = [],
    loading = true,
    error = null,
    hasMore = false,
    loadMore = () => {},
    loadingState = { loadingMore: false },
  } = useQuestions({
    chain: selectedChain,
  }) || {};

  // Now use our custom hook for filter-related logic with the questions data
  const {
    searchTerm,
    activeFilters,
    availableFilters,
    filters,
    handleSearch,
    handleFilterChange
  } = useQuestionFilters(questions);

  console.log("Questions loaded:", questions?.length || 0);
  console.log("Active filters:", activeFilters);
  console.log("Applied filters object:", filters);

  // Get hasResponses filter value
  const hasResponsesFilter = activeFilters.find(f => f.key === "hasResponses");

  // Apply filters to the questions
  const {
    filteredQuestions = [],
    loading: filterLoading = false,
    error: filterError = null,
  } = useQuestions({
    chain: selectedChain,
    searchTerm,
    filters,
  }) || {};

  // Apply hasResponses filter manually since it's not directly supported by the API
  const displayedQuestions = hasResponsesFilter
    ? filteredQuestions.filter(q => {
        const hasResponses = q.responses && q.responses.length > 0;
        return hasResponsesFilter.value === "true" ? hasResponses : !hasResponses;
      })
    : filteredQuestions;

  console.log("Filtered questions:", filteredQuestions?.length || 0);
  console.log("Displayed questions after hasResponses filter:", displayedQuestions?.length || 0);

  // Fetch dispute data for selected question
  const {
    disputeId = null,
    dispute = undefined,
    disputeLoading = false,
    evidences = [],
    metaEvidence = null,
    arbitrableContractAddress = undefined,
  } = useDisputeData(selectedQuestion as any) || {};

  // Reset selected question when chain changes
  useEffect(() => {
    setSelectedQuestion(null);
  }, [selectedChain]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading questions",
        description: error,
        variant: "destructive",
      });
    }
  }, [error]);

  const handleSelectQuestion = (question: Question) => {
    setSelectedQuestion(question);
  };

  const handleBackToList = () => {
    setSelectedQuestion(null);
  };

  const handleChainChange = (chain: typeof selectedChain) => {
    setSelectedChain(chain);
  };

  const handleCreateQuestion = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleQuestionCreated = (questionId: string) => {
    setShowCreateModal(false);
    toast({
      title: "Question Created Successfully",
      description: `Question ID: ${questionId}`,
    });
    // Optionally refresh the questions list here
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Questions
          <span className="text-muted-foreground ml-2 text-sm">
            on {selectedChain?.name || "Loading..."}
          </span>
        </h1>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={handleCreateQuestion}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Create Question
          </Button>
          
          <ChainSelector
            chains={SUPPORTED_CHAINS || []}
            selectedChain={selectedChain}
            onSelectChain={handleChainChange}
          />
        </div>
      </div>

      {!selectedQuestion ? (
        <div className="space-y-6">
          <SearchFilter
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            availableFilters={availableFilters}
            initialSearchTerm={searchTerm}
            initialFilters={activeFilters}
          />
          
          <QuestionsList
            questions={displayedQuestions || []}
            loading={loading || filterLoading}
            error={error || filterError}
            onSelectQuestion={handleSelectQuestion}
            loadMore={loadMore}
            hasMore={hasMore}
            loadingMore={loadingState?.loadingMore || false}
          />
        </div>
      ) : (
        <QuestionDetail
          question={selectedQuestion}
          onBack={handleBackToList}
          disputeId={disputeId}
          dispute={dispute}
          disputeLoading={disputeLoading}
          evidences={evidences || []}
          metaEvidence={metaEvidence}
          arbitrableContractAddress={arbitrableContractAddress}
        />
      )}

      <CreateQuestionModal
        isOpen={showCreateModal}
        onClose={handleCloseCreateModal}
        onQuestionCreated={handleQuestionCreated}
        selectedChain={selectedChain}
      />
    </div>
  );
};

export default QuestionsContainer;
