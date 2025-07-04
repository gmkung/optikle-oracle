
import { useState, useMemo, useEffect } from "react";
import { FilterOption } from "@/components/SearchFilter";
import { generateFilterOptions } from "@/utils/filterUtils";
import { Question } from "@/components/QuestionsList";

export function useQuestionFilters(questions: Question[] = []) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<FilterOption[]>([]);

  // Generate filter options based on questions data
  const availableFilters = useMemo(() => 
    generateFilterOptions(questions), 
  [questions]);

  // Reset filters when questions change dramatically (e.g., chain change)
  useEffect(() => {
    if (questions.length > 0 && activeFilters.length > 0) {
      // Check if any active filters no longer exist in the available options
      const availableKeys = availableFilters.map(filter => filter.key);
      const shouldReset = activeFilters.some(
        filter => !availableKeys.includes(filter.key)
      );
      
      if (shouldReset) {
        setActiveFilters([]);
      }
    }
  }, [questions, availableFilters, activeFilters]);

  // Create filters object from active filters
  const filters = useMemo(() => activeFilters.reduce((acc: Record<string, any>, filter) => {
    // For debugging
    console.log(`Processing filter: ${filter.key} = ${filter.value}`);
    
    // Special handling for arbitrationRequestedBy filter
    if (filter.key === "arbitrationRequestedBy") {
      if (filter.value === "true") {
        acc[filter.key] = { $ne: null };
      } else {
        acc[filter.key] = null;
      }
    } 
    // Special handling for hasResponses filter
    else if (filter.key === "hasResponses") {
      // We don't add this to the filter object as it's handled separately
      // by the useQuestions hook in QuestionsContainer
    }
    // Handle nested properties like 'template.templateId'
    else if (filter.key.includes('.')) {
      const [parent, child] = filter.key.split('.');
      acc[parent] = acc[parent] || {};
      acc[parent][child] = filter.value;
    } 
    // Handle regular filters
    else {
      acc[filter.key] = filter.value;
    }
    
    return acc;
  }, {}), [activeFilters]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (filters: FilterOption[]) => {
    setActiveFilters(filters);
  };

  return {
    searchTerm,
    activeFilters,
    availableFilters,
    filters,
    handleSearch,
    handleFilterChange
  };
}
