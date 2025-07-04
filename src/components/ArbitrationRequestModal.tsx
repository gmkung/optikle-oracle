import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Wallet, ExternalLink, AlertTriangle, Scale, ArrowRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import { useArbitrationRequest } from "@/hooks/useArbitrationRequest";
import { Question } from "./QuestionsList";
import { shortenAddress } from "@/lib/formatters";

const arbitrationSchema = z.object({
  maxPrevious: z.string().optional(),
});

type ArbitrationFormData = z.infer<typeof arbitrationSchema>;

interface ArbitrationRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question | null;
  onArbitrationRequested?: (txHash: string) => void;
}

const ArbitrationRequestModal: React.FC<ArbitrationRequestModalProps> = ({
  isOpen,
  onClose,
  question,
  onArbitrationRequested,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hasLoadedData, setHasLoadedData] = useState(false);
  
  const {
    // State
    isLoading,
    isConfirming,
    isSuccess,
    error,
    txHash,
    disputeFee,
    gasEstimate,
    walletConnected,
    needsChainSwitch,
    foreignProxyInfo,
    canRequest,
    isRequested,
    hasRequiredData,
    // Actions
    connectWallet,
    switchToForeignChain,
    loadContractData,
    estimateGas,
    requestArbitration,
    resetState,
  } = useArbitrationRequest(question);

  const form = useForm<ArbitrationFormData>({
    resolver: zodResolver(arbitrationSchema),
    defaultValues: {
      maxPrevious: "",
    },
  });

  // Load contract data when modal opens
  useEffect(() => {
    if (isOpen && question && foreignProxyInfo && !hasLoadedData) {
      loadContractData();
      setHasLoadedData(true);
    }
  }, [isOpen, question, foreignProxyInfo, hasLoadedData]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetState();
      form.reset();
      setShowAdvanced(false);
      setHasLoadedData(false);
    }
  }, [isOpen, resetState, form]);

  // Handle successful arbitration request
  useEffect(() => {
    if (isSuccess && txHash) {
      toast({
        title: "Arbitration Requested Successfully!",
        description: (
          <div>
            <p>Your arbitration request has been submitted.</p>
            {txHash && (
              <Button
                variant="link"
                size="sm"
                className="mt-2 p-0 h-auto"
                onClick={() => window.open(`https://etherscan.io/tx/${txHash}`, '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View Transaction
              </Button>
            )}
          </div>
        ),
      });
      
      if (onArbitrationRequested && txHash) {
        onArbitrationRequested(txHash);
      }
    }
  }, [isSuccess, txHash, onArbitrationRequested]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Error Requesting Arbitration",
        description: error,
        variant: "destructive",
      });
    }
  }, [error]);

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const handleSwitchChain = async () => {
    try {
      await switchToForeignChain();
    } catch (error) {
      console.error('Error switching chain:', error);
    }
  };

  const handleLoadData = async () => {
    try {
      await loadContractData();
    } catch (error) {
      console.error('Error loading contract data:', error);
    }
  };

  const handleEstimateGas = async (data: ArbitrationFormData) => {
    if (!question) return;

    try {
      await estimateGas({
        questionId: question.id,
        maxPrevious: data.maxPrevious,
      });
    } catch (error) {
      console.error('Gas estimation failed:', error);
    }
  };

  const handleSubmit = async (data: ArbitrationFormData) => {
    if (!question) return;

    try {
      await requestArbitration({
        questionId: question.id,
        maxPrevious: data.maxPrevious,
      });
    } catch (error) {
      console.error("Error requesting arbitration:", error);
    }
  };

  const getExplorerUrl = (address: string, chainId: string) => {
    const explorers: { [key: string]: string } = {
      '0x1': 'https://etherscan.io',
      '0x64': 'https://gnosisscan.io',
      '0x89': 'https://polygonscan.com',
    };
    
    const baseUrl = explorers[chainId] || 'https://etherscan.io';
    return `${baseUrl}/address/${address}`;
  };

  if (!question) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Request Arbitration
          </DialogTitle>
          <DialogDescription>
            Request arbitration for this question. This will create a dispute that will be resolved by Kleros arbitrators.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Question Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Question Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Question ID</span>
                  <span className="text-sm font-mono">{shortenAddress(question.id)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Home Chain</span>
                  <span className="text-sm font-medium">{question.chain.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Current Bond</span>
                  <span className="text-sm font-medium">
                    {question.currentBond} {question.chain.native_currency || 'ETH'}
                  </span>
                </div>
                {isRequested && (
                  <div className="flex justify-between text-amber-600 dark:text-amber-400">
                    <span className="text-sm">Arbitration Status</span>
                    <span className="text-sm font-medium">Already Requested</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bridge Information */}
            {foreignProxyInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ArrowRight className="h-4 w-4" />
                    Bridge Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Foreign Chain</span>
                    <span className="text-sm font-medium">{foreignProxyInfo.foreignChain}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Foreign Proxy</span>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto"
                      onClick={() => window.open(getExplorerUrl(foreignProxyInfo.foreignProxyAddress, foreignProxyInfo.foreignChainId), '_blank')}
                    >
                      <span className="text-xs font-mono">
                        {shortenAddress(foreignProxyInfo.foreignProxyAddress)}
                      </span>
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Chain Mismatch Warning */}
            {needsChainSwitch && walletConnected && foreignProxyInfo && (
              <Alert className="border-amber-500">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Wrong Network</p>
                    <p className="text-sm">
                      Switch to {foreignProxyInfo.foreignChain} to request arbitration.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSwitchChain}
                    className="ml-4"
                  >
                    Switch Network
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Costs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Costs & Wallet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Wallet Status</span>
                  <span className={`text-sm font-medium ${walletConnected ? 'text-green-600' : 'text-amber-600'}`}>
                    {walletConnected ? 'Connected' : 'Not Connected'}
                  </span>
                </div>
                
                {!disputeFee && foreignProxyInfo && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleLoadData}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Loading...' : 'Load Contract Data'}
                  </Button>
                )}

                {disputeFee && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Dispute Fee</span>
                    <span className="text-sm font-medium">
                      {disputeFee} ETH
                    </span>
                  </div>
                )}

                {gasEstimate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Gas Cost</span>
                    <span className="text-sm font-medium">
                      ~{parseFloat(gasEstimate).toFixed(6)} ETH
                    </span>
                  </div>
                )}

                {!walletConnected && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleConnectWallet}
                    className="w-full"
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    Connect Wallet
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Advanced Options */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Advanced Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full"
                >
                  {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                </Button>

                {showAdvanced && (
                  <FormField
                    control={form.control}
                    name="maxPrevious"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Previous Bond (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.001"
                            placeholder="Leave empty for no limit"
                            {...field}
                          />
                        </FormControl>
                        <div className="text-xs text-muted-foreground">
                          Maximum bond amount to accept.
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            {/* Status Messages */}
            {!canRequest && (
              <Alert className="border-amber-500">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {isRequested 
                    ? "Arbitration has already been requested for this question."
                    : "This question is not eligible for arbitration."
                  }
                </AlertDescription>
              </Alert>
            )}

            {/* Transaction Status */}
            {(isLoading || isConfirming || isSuccess || error) && (
              <Alert className={error ? "border-destructive" : isSuccess ? "border-green-500" : "border-blue-500"}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {isLoading && "Processing..."}
                  {isConfirming && "Confirming transaction..."}
                  {isSuccess && "Arbitration request submitted successfully!"}
                  {error && `Error: ${error}`}
                </AlertDescription>
              </Alert>
            )}

            <Separator />

            <div className="flex justify-between items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.handleSubmit(handleEstimateGas)()}
                disabled={isLoading || isConfirming || !hasRequiredData}
              >
                Estimate Gas
              </Button>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading || isConfirming}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || isConfirming || !canRequest || !hasRequiredData}
                >
                  {isLoading ? "Processing..." : isConfirming ? "Confirming..." : "Request Arbitration"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ArbitrationRequestModal; // Final polish: Enhanced error handling and user feedback
// Enhanced error handling and user feedback messages
