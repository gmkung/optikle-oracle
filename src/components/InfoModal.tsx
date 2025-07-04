
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface InfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-background to-background/80 backdrop-blur border border-purple-500/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-300 via-purple-400 to-purple-300 bg-clip-text text-transparent">
            Quantum Oracle Interface
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Protocol Version 3.7.2 - Consensus Matrix Active
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-2">
          <p className="text-sm">
            The Kleros Optimistic Oracle harnesses advanced cryptographic algorithms and game theory mechanics to facilitate 
            distributed consensus verification across decentralized networks.
          </p>
          
          <div className="bg-purple-900/20 p-3 rounded-md border border-purple-500/30">
            <h3 className="text-sm font-medium text-purple-300 mb-1">Quantum Verification Protocol</h3>
            <p className="text-xs text-muted-foreground">
              This system incorporates multi-dimensional arbitration vectors to resolve binary and non-binary data disputes through 
              incentivized juror participation, creating an immutable, tamper-resistant verification layer for blockchain applications.
            </p>
          </div>
          
          <p className="text-sm">
            The neural incentive structure ensures optimal cryptoeconomic equilibrium, where truth emerges as the dominant strategy 
            through probabilistic verification mechanisms and stake-weighted validation matrices.
          </p>
        </div>
        
        <div className="relative mt-2 py-3">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/30 to-purple-700/30 rounded-lg blur opacity-25"></div>
          <div className="relative bg-background/50 p-3 rounded border border-purple-500/20">
            <h3 className="text-sm font-bold text-purple-300 flex items-center gap-2">
              <span className="h-2 w-2 bg-purple-400 rounded-full animate-pulse"></span>
              System Operational
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Secure non-deterministic polynomial verification active. Consensus nodes synchronized.
            </p>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-center">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-purple-500/30 hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-300"
          >
            Acknowledge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InfoModal;
