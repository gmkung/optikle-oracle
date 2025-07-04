
import React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export interface ChainOption {
  id: string;
  name: string;
  subgraphUrl: string;
  public_rpc_url: string;
}

interface ChainSelectorProps {
  chains: ChainOption[];
  selectedChain: ChainOption;
  onSelectChain: (chain: ChainOption) => void;
  className?: string;
}

const ChainSelector: React.FC<ChainSelectorProps> = ({
  chains = [],
  selectedChain,
  onSelectChain,
  className,
}) => {
  console.log("ChainSelector - chains:", chains?.length);
  console.log("ChainSelector - selectedChain:", selectedChain?.name);

  if (!chains || chains.length === 0 || !selectedChain) {
    return (
      <Button
        variant="outline"
        disabled
        className={cn(
          "w-[200px] justify-between h-10 bg-card border-border opacity-70",
          className
        )}
      >
        Loading chains...
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            "w-[200px] justify-between h-10 bg-card border-border hover:bg-muted/30 transition-all",
            className
          )}
        >
          <div className="flex items-center gap-2 font-medium">
            {selectedChain.name || "Select Chain"}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0 glass-card">
        <div className="max-h-80 overflow-auto custom-scrollbar">
          {chains.map((chain) => (
            <Button
              key={chain.id}
              variant="ghost"
              className={cn(
                "relative w-full justify-start rounded-none text-left font-normal",
                chain.id === selectedChain.id && "bg-accent/10 text-accent-foreground"
              )}
              onClick={() => onSelectChain(chain)}
            >
              <div className="flex items-center gap-2">
                <span className="grow">{chain.name || chain.id}</span>
                {chain.id === selectedChain.id && (
                  <Check className="h-4 w-4 ml-2 opacity-100" />
                )}
              </div>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ChainSelector;
