
import { Question } from "@/components/QuestionsList";

export type FilterGroup = {
  key: string;
  label: string;
  options: { value: string; label: string }[];
};

export function generateFilterOptions(questions: Question[] = []): FilterGroup[] {
  console.log("Generating filter options from questions:", questions.length);
  
  // Default filters when there are no questions
  if (!questions || questions.length === 0) {
    return [
      {
        key: "phase",
        label: "Status",
        options: [
          { value: "OPEN", label: "Open" },
          { value: "UPCOMING", label: "Upcoming" },
          { value: "PENDING_ARBITRATION", label: "Pending Arbitration" },
          { value: "FINALIZED", label: "Finalized" },
        ],
      }
    ];
  }

  // Extract unique phases
  const uniquePhases = [...new Set(questions.map(q => q.phase))].filter(Boolean);
  
  // Extract unique template IDs from the template object
  const uniqueTemplateIds = [...new Set(questions
    .filter(q => q.template && q.template.templateId) // Check if template and templateId exist
    .map(q => q.template?.templateId))].filter(Boolean);
  
  // Sort template IDs numerically
  uniqueTemplateIds.sort((a, b) => {
    const numA = parseInt(a as string, 10);
    const numB = parseInt(b as string, 10);
    return isNaN(numA) || isNaN(numB) ? 
      (a as string).localeCompare(b as string) : 
      numA - numB;
  });
  
  console.log("Available template IDs:", uniqueTemplateIds);

  // Create filter groups
  const filterGroups: FilterGroup[] = [];
  
  // Add phase filter if we have phases
  if (uniquePhases.length > 0) {
    filterGroups.push({
      key: "phase",
      label: "Status",
      options: uniquePhases.map(phase => ({ 
        value: phase as string, 
        label: phase as string
      })),
    });
  }
  
  // Add template ID filter if we have template IDs
  if (uniqueTemplateIds.length > 0) {
    filterGroups.push({
      key: "template.templateId", // Using the nested structure
      label: "Template ID",
      options: uniqueTemplateIds.map(id => ({ 
        value: id as string, 
        label: `Template ${id}` 
      })),
    });
  }
  
  // Add arbitration filter
  filterGroups.push({
    key: "arbitrationRequestedBy",
    label: "Arbitration Status",
    options: [
      { value: "true", label: "Arbitration Requested" },
      { value: "false", label: "No Arbitration" },
    ],
  });
  
  // Add response filter
  filterGroups.push({
    key: "hasResponses",
    label: "Answer Status",
    options: [
      { value: "true", label: "Has Answers" },
      { value: "false", label: "No Answers" },
    ],
  });
  
  return filterGroups;
}
