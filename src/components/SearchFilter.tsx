
import React, { useState, useCallback, useEffect } from "react";
import { Search, Filter, X, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export type FilterOption = {
  key: string;
  value: string;
  label: string;
};

interface SearchFilterProps {
  onSearch: (term: string) => void;
  onFilterChange: (filters: FilterOption[]) => void;
  availableFilters: {
    key: string;
    label: string;
    options: { value: string; label: string }[];
  }[];
  className?: string;
  initialSearchTerm?: string;
  initialFilters?: FilterOption[];
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  onSearch,
  onFilterChange,
  availableFilters,
  className,
  initialSearchTerm = "",
  initialFilters = [],
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialSearchTerm);
  const [activeFilters, setActiveFilters] = useState<FilterOption[]>(initialFilters);

  // Initialize the component with initial values
  useEffect(() => {
    if (initialFilters.length > 0) {
      setActiveFilters(initialFilters);
    }
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
      setDebouncedSearchTerm(initialSearchTerm);
    }
  }, [initialSearchTerm, initialFilters]);

  // Debounce search term changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  // Trigger search when debounced term changes
  useEffect(() => {
    onSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearch]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Immediately trigger search on submit without waiting for debounce
    onSearch(searchTerm);
  };

  const addFilter = (filter: FilterOption) => {
    // Don't add duplicate filters
    if (activeFilters.some(f => f.key === filter.key && f.value === filter.value)) return;
    
    // Replace existing filter with same key if it exists
    const newFilters = activeFilters.filter(f => f.key !== filter.key);
    
    setActiveFilters([...newFilters, filter]);
    onFilterChange([...newFilters, filter]);
  };

  const removeFilter = (filter: FilterOption) => {
    const newFilters = activeFilters.filter(
      (f) => !(f.key === filter.key && f.value === filter.value)
    );
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    onSearch("");
  };

  // Determine if we should show submenus for filters with many options
  const shouldUseSubmenu = (options: { value: string; label: string }[]) => {
    return options.length > 8;
  };

  // Group options for large filter lists (like templateId)
  const groupOptions = (options: { value: string; label: string }[]) => {
    if (options.length <= 20) return [{ label: "All", options }];
    
    // Group by tens (0-9, 10-19, etc.)
    const groups: { label: string; options: { value: string; label: string }[] }[] = [];
    
    for (let i = 0; i < options.length; i += 10) {
      const start = i;
      const end = Math.min(i + 9, options.length - 1);
      const startValue = options[start].value;
      const endValue = options[end].value;
      
      groups.push({
        label: `${startValue} - ${endValue}`,
        options: options.slice(start, end + 1)
      });
    }
    
    return groups;
  };

  return (
    <div className={cn("w-full space-y-2", className)}>
      <form onSubmit={handleSearchSubmit} className="flex w-full items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={searchTerm}
            onChange={handleSearchInputChange}
            className="w-full pl-10 bg-card/50 border-border focus-visible:ring-accent"
          />
          {searchTerm && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 rounded-full"
              onClick={clearSearch}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Clear</span>
            </Button>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 bg-card/50">
              <Filter className="h-4 w-4" />
              <span className="sr-only">Filter</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-popover">
            {availableFilters.map((filterGroup) => (
              <React.Fragment key={filterGroup.key}>
                <DropdownMenuLabel>{filterGroup.label}</DropdownMenuLabel>
                
                {shouldUseSubmenu(filterGroup.options) ? (
                  <DropdownMenuGroup>
                    {groupOptions(filterGroup.options).map((group, index) => (
                      group.options.length === 1 ? (
                        <DropdownMenuItem 
                          key={`${filterGroup.key}-${index}`}
                          onClick={() => addFilter({
                            key: filterGroup.key,
                            value: group.options[0].value,
                            label: group.options[0].label,
                          })}
                        >
                          {group.options[0].label}
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuSub key={`${filterGroup.key}-${index}`}>
                          <DropdownMenuSubTrigger>
                            <span>{group.label}</span>
                          </DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent className="max-h-[300px] overflow-auto">
                              <ScrollArea className="h-full max-h-[300px]">
                                {group.options.map((option) => (
                                  <DropdownMenuItem
                                    key={`${filterGroup.key}-${option.value}`}
                                    onClick={() => addFilter({
                                      key: filterGroup.key,
                                      value: option.value,
                                      label: option.label,
                                    })}
                                  >
                                    {option.label}
                                  </DropdownMenuItem>
                                ))}
                              </ScrollArea>
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                      )
                    ))}
                  </DropdownMenuGroup>
                ) : (
                  <DropdownMenuGroup>
                    {filterGroup.options.map((option) => (
                      <DropdownMenuItem
                        key={`${filterGroup.key}-${option.value}`}
                        onClick={() => addFilter({
                          key: filterGroup.key,
                          value: option.value,
                          label: option.label,
                        })}
                      >
                        {option.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                )}
                <DropdownMenuSeparator />
              </React.Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button type="submit" className="shrink-0">
          Search
        </Button>
      </form>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {activeFilters.map((filter) => (
            <Badge
              key={`${filter.key}-${filter.value}`}
              variant="secondary"
              className="group hover:bg-muted/80 transition-colors"
            >
              {filter.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 text-muted-foreground hover:text-foreground rounded-full"
                onClick={() => removeFilter(filter)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {filter.label} filter</span>
              </Button>
            </Badge>
          ))}
          
          {activeFilters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-6 px-2 hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={() => {
                setActiveFilters([]);
                onFilterChange([]);
              }}
            >
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
