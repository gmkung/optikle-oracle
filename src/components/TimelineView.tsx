
import React from "react";
import { Circle, Clock, Flag, AlertCircle, CheckCircle2 } from "lucide-react";
import { formatDate, formatTimeRemaining } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { Question } from "./QuestionsList";

interface TimelineViewProps {
  question: Question;
}

const TimelineView: React.FC<TimelineViewProps> = ({ question }) => {
  // Define our timeline events
  const events = [
    {
      id: "creation",
      label: "Created",
      timestamp: question.createdTimestamp,
      icon: <Circle className="h-3 w-3" />,
      status: "completed",
    },
    ...(question.openingTimestamp
      ? [
          {
            id: "opening",
            label: "Opens",
            timestamp: question.openingTimestamp,
            icon: <Clock className="h-3 w-3" />,
            status: question.timeToOpen > 0 ? "upcoming" : "completed",
            timeRemaining: question.timeToOpen > 0 ? question.timeToOpen : 0,
          },
        ]
      : []),
    ...(question.timeRemaining > 0 && question.phase === "OPEN"
      ? [
          {
            id: "closing",
            label: "Closes",
            icon: <Flag className="h-3 w-3" />,
            status: "upcoming",
            timeRemaining: question.timeRemaining,
          },
        ]
      : []),
    ...(question.currentScheduledFinalizationTimestamp
      ? [
          {
            id: "finalization",
            label: "Finalization",
            timestamp: Number(question.currentScheduledFinalizationTimestamp),
            icon: <AlertCircle className="h-3 w-3" />,
            status:
              Date.now() / 1000 > Number(question.currentScheduledFinalizationTimestamp)
                ? "completed"
                : "upcoming",
          },
        ]
      : []),
    ...(question.appealPeriodEnd
      ? [
          {
            id: "appeal",
            label: "Appeal End",
            timestamp: question.appealPeriodEnd,
            icon: <AlertCircle className="h-3 w-3" />,
            status: Date.now() / 1000 > question.appealPeriodEnd ? "completed" : "upcoming",
          },
        ]
      : []),
    ...(question.finalAnswer !== undefined
      ? [
          {
            id: "finalized",
            label: "Final Answer",
            icon: <CheckCircle2 className="h-3 w-3" />,
            status: "completed",
            answer:
              question.options && question.options[Number(question.finalAnswer)]
                ? question.options[Number(question.finalAnswer)]
                : question.finalAnswer,
          },
        ]
      : []),
  ];

  // Filter out events with invalid timestamps
  const validEvents = events.filter(
    (event) => !event.timestamp || (typeof event.timestamp === "number" && event.timestamp > 0)
  );

  return (
    <div className="space-y-0 border rounded-lg p-2 text-sm h-full">
      <h3 className="text-xs font-medium text-muted-foreground mb-1">Timeline</h3>
      <div className="grid grid-cols-1 gap-1">
        {validEvents.map((event, index) => (
          <div key={event.id} className="flex items-center gap-2">
            <div 
              className={cn(
                "rounded-full p-1",
                event.status === "completed" 
                  ? "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400" 
                  : event.status === "upcoming"
                  ? "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {event.icon}
            </div>
            
            <div className="flex-1 flex items-center justify-between min-w-0">
              <span className={cn(
                "text-xs font-medium",
                event.status === "completed" 
                  ? "text-gray-500 dark:text-gray-400" 
                  : event.status === "upcoming"
                  ? "text-purple-600 dark:text-purple-400"
                  : ""
              )}>
                {event.label}
              </span>
              
              <div className="text-right">
                {event.timestamp && (
                  <span className="text-xs text-muted-foreground ml-1">{formatDate(event.timestamp)}</span>
                )}
                
                {event.timeRemaining && event.timeRemaining > 0 && (
                  <span className="text-xs font-medium ml-1 text-amber-600 dark:text-amber-400">
                    {formatTimeRemaining(event.timeRemaining)}
                  </span>
                )}
                
                {event.answer && (
                  <span className="text-xs font-medium ml-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 py-0.5 px-1 rounded">
                    {event.answer}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {validEvents.length === 0 && (
          <div className="py-2 text-center text-xs text-muted-foreground">
            No timeline events
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelineView;
