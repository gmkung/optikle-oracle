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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Plus, X, Wallet, ExternalLink, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import { useQuestionCreation } from "@/hooks/useQuestionCreation";
import { getPrimaryRealityContract, getChainContractInfo } from "@/utils/contractAddresses";

// Chain ID mapping for validation
const CHAIN_IDS = {
  ethereum: '0x1',      // 1
  gnosis: '0x64',       // 100
  polygon: '0x89',      // 137
} as const;

const questionSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters").max(200, "Title must not exceed 200 characters"),
  description: z.string().max(500, "Description must not exceed 500 characters").optional(),
  category: z.string().min(1, "Please select a category"),
  timeout: z.coerce.number().min(3600, "Timeout must be at least 1 hour").max(2592000, "Timeout cannot exceed 30 days"),
  openingTime: z.string().optional(),
  bounty: z.string().min(1, "Bounty is required").refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, "Bounty must be a positive number"),
  outcomes: z.array(z.string().min(1, "Outcome cannot be empty")).min(2, "At least 2 outcomes are required").max(10, "Maximum 10 outcomes allowed"),
});

type QuestionFormData = z.infer<typeof questionSchema>;

interface CreateQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestionCreated: (questionId: string) => void;
  selectedChain: any;
}

const CATEGORIES = [
  "Politics",
  "Sports",
  "Technology",
  "Finance",
  "Science",
  "Entertainment",
  "Social",
  "Other",
];

const CreateQuestionModal: React.FC<CreateQuestionModalProps> = ({
  isOpen,
  onClose,
  onQuestionCreated,
  selectedChain,
}) => {
  const [customOutcomes, setCustomOutcomes] = useState<string[]>(["Yes", "No"]);
  const [newOutcome, setNewOutcome] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);
  const [currentChainId, setCurrentChainId] = useState<string | null>(null);
  const [chainMismatch, setChainMismatch] = useState(false);
  
  // Use the question creation hook
  const {
    createQuestion,
    estimateGas,
    resetState,
    isLoading,
    isConfirming,
    isSuccess,
    error,
    txHash,
    questionId,
    gasEstimate,
  } = useQuestionCreation(selectedChain?.name || 'ethereum');

  // Get contract information
  const realityContract = getPrimaryRealityContract(selectedChain?.name || 'ethereum');
  const chainContractInfo = getChainContractInfo(selectedChain?.name || 'ethereum');

  // Get expected chain ID for selected chain
  const expectedChainId = CHAIN_IDS[selectedChain?.name?.toLowerCase() as keyof typeof CHAIN_IDS] || CHAIN_IDS.ethereum;

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      timeout: 86400, // 24 hours
      openingTime: "",
      bounty: "0.01",
      outcomes: ["Yes", "No"],
    },
  });

  const addOutcome = () => {
    if (newOutcome.trim() && customOutcomes.length < 10) {
      const updatedOutcomes = [...customOutcomes, newOutcome.trim()];
      setCustomOutcomes(updatedOutcomes);
      form.setValue("outcomes", updatedOutcomes);
      setNewOutcome("");
    }
  };

  const removeOutcome = (index: number) => {
    if (customOutcomes.length > 2) {
      const updatedOutcomes = customOutcomes.filter((_, i) => i !== index);
      setCustomOutcomes(updatedOutcomes);
      form.setValue("outcomes", updatedOutcomes);
    }
  };

  // Get current chain ID from wallet
  const getCurrentChainId = async (): Promise<string | null> => {
    if (!window.ethereum) return null;
    
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      return chainId;
    } catch (error) {
      console.error('Error getting chain ID:', error);
      return null;
    }
  };

  // Switch to the correct chain
  const switchToCorrectChain = async () => {
    if (!window.ethereum || !expectedChainId) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: expectedChainId }],
      });
      
      // Refresh chain info after switch
      const newChainId = await getCurrentChainId();
      setCurrentChainId(newChainId);
      setChainMismatch(newChainId !== expectedChainId);
      
      toast({
        title: "Chain Switched",
        description: `Successfully switched to ${selectedChain?.name || 'the correct network'}`,
      });
    } catch (error: any) {
      console.error('Error switching chain:', error);
      
      // Handle case where user rejects the switch
      if (error.code === 4001) {
        toast({
          title: "Chain Switch Cancelled",
          description: "You need to switch to the correct network to create a question.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Chain Switch Failed",
          description: "Unable to switch to the correct network. Please switch manually.",
          variant: "destructive",
        });
      }
    }
  };

  // Check wallet connection and chain
  const checkWalletAndChain = async () => {
    if (!window.ethereum) return;
    
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      const connected = accounts.length > 0;
      setWalletConnected(connected);
      
      if (connected) {
        const chainId = await getCurrentChainId();
        setCurrentChainId(chainId);
        setChainMismatch(chainId !== expectedChainId);
      }
    } catch (error) {
      console.error('Error checking wallet and chain:', error);
    }
  };

  // Check wallet connection and chain on mount and when modal opens
  useEffect(() => {
    if (isOpen) {
      checkWalletAndChain();
    }
  }, [isOpen, expectedChainId]);

  // Listen for chain changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleChainChanged = (chainId: string) => {
      setCurrentChainId(chainId);
      setChainMismatch(chainId !== expectedChainId);
    };

    const handleAccountsChanged = (accounts: string[]) => {
      setWalletConnected(accounts.length > 0);
      if (accounts.length === 0) {
        setCurrentChainId(null);
        setChainMismatch(false);
      }
    };

    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('accountsChanged', handleAccountsChanged);

    return () => {
      window.ethereum.removeListener('chainChanged', handleChainChanged);
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, [expectedChainId]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetState();
      form.reset();
      setCustomOutcomes(["Yes", "No"]);
    }
  }, [isOpen, resetState, form]);

  // Handle successful question creation
  useEffect(() => {
    if (isSuccess && questionId) {
      toast({
        title: "Question Created Successfully!",
        description: (
          <div>
            <p>Your question has been submitted to {selectedChain?.name}.</p>
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
      
      onQuestionCreated(questionId);
    }
  }, [isSuccess, questionId, txHash, selectedChain?.name, onQuestionCreated]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Error Creating Question",
        description: error,
        variant: "destructive",
      });
    }
  }, [error]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast({
        title: "Wallet Not Found",
        description: "Please install MetaMask or another Web3 wallet.",
        variant: "destructive",
      });
      return;
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      await checkWalletAndChain();
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet.",
        variant: "destructive",
      });
    }
  };

  const handleGasEstimation = async (data: QuestionFormData) => {
    if (!walletConnected) {
      await connectWallet();
      return;
    }

    if (chainMismatch) {
      await switchToCorrectChain();
      return;
    }

    try {
      await estimateGas({
        title: data.title,
        description: data.description,
        category: data.category,
        timeout: data.timeout,
        openingTime: data.openingTime,
        bounty: data.bounty,
        outcomes: customOutcomes,
      });
    } catch (error) {
      console.error('Gas estimation failed:', error);
    }
  };

  const handleSubmit = async (data: QuestionFormData) => {
    if (!walletConnected) {
      await connectWallet();
      return;
    }

    if (chainMismatch) {
      await switchToCorrectChain();
      return;
    }

    try {
      await createQuestion({
        title: data.title,
        description: data.description,
        category: data.category,
        timeout: data.timeout,
        openingTime: data.openingTime,
        bounty: data.bounty,
        outcomes: customOutcomes,
      });
    } catch (error) {
      // Error handling is done in the useEffect above
      console.error("Error creating question:", error);
    }
  };

  const formatTimeout = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const days = Math.floor(hours / 24);
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Question</DialogTitle>
          <DialogDescription>
            Create a new question on {selectedChain?.name || "the selected blockchain"}. 
            Questions are resolved by the Reality.eth oracle system.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Chain Mismatch Warning */}
            {chainMismatch && walletConnected && (
              <Alert className="border-amber-500">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Wrong Network</p>
                    <p className="text-sm">
                      Your wallet is connected to a different network. Switch to {selectedChain?.name} to continue.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={switchToCorrectChain}
                    className="ml-4"
                  >
                    Switch Network
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Question Details</CardTitle>
                <CardDescription>
                  Provide clear and unambiguous question details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question Title *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Will Bitcoin reach $100,000 by the end of 2024?"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide additional context or clarification for your question..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Answer Options</CardTitle>
                <CardDescription>
                  Define the possible answers for your question
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {customOutcomes.map((outcome, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1 px-3 py-1"
                    >
                      {outcome}
                      {customOutcomes.length > 2 && (
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-destructive"
                          onClick={() => removeOutcome(index)}
                        />
                      )}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Add new answer option"
                    value={newOutcome}
                    onChange={(e) => setNewOutcome(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOutcome())}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addOutcome}
                    disabled={!newOutcome.trim() || customOutcomes.length >= 10}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Timing & Economics</CardTitle>
                <CardDescription>
                  Set the question parameters and incentives
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="timeout"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Answer Timeout (seconds) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="3600"
                            max="2592000"
                            {...field}
                          />
                        </FormControl>
                        <div className="text-xs text-muted-foreground">
                          {formatTimeout(field.value || 86400)}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bounty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Bounty ({selectedChain?.native_currency || 'ETH'}) *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.001"
                            min="0.001"
                            placeholder="0.01"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="openingTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opening Time (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                        />
                      </FormControl>
                      <div className="text-xs text-muted-foreground">
                        Leave blank to open immediately
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Wallet & Contract Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Wallet & Contract Information
                </CardTitle>
                <CardDescription>
                  Connect your wallet to create questions on Reality.eth
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Wallet Status</span>
                  <span className={`text-sm font-medium ${walletConnected ? 'text-green-600' : 'text-amber-600'}`}>
                    {walletConnected ? 'Connected' : 'Not Connected'}
                  </span>
                </div>
                
                {walletConnected && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Network Status</span>
                    <span className={`text-sm font-medium ${chainMismatch ? 'text-red-600' : 'text-green-600'}`}>
                      {chainMismatch ? `Wrong Network` : `${selectedChain?.name || 'Correct Network'}`}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Reality.eth Contract</span>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto"
                    onClick={() => window.open(`https://etherscan.io/address/${realityContract}`, '_blank')}
                  >
                    <span className="text-xs font-mono">{realityContract.slice(0, 10)}...{realityContract.slice(-8)}</span>
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>

                {gasEstimate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Estimated Gas Cost</span>
                    <span className="text-sm font-medium">
                      ~{parseFloat(gasEstimate).toFixed(6)} {selectedChain?.native_currency || 'ETH'}
                    </span>
                  </div>
                )}

                {!walletConnected && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={connectWallet}
                    className="w-full"
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    Connect Wallet
                  </Button>
                )}

                {walletConnected && chainMismatch && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={switchToCorrectChain}
                    className="w-full"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Switch to {selectedChain?.name}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Transaction Status */}
            {(isLoading || isConfirming || isSuccess || error) && (
              <Alert className={error ? "border-destructive" : isSuccess ? "border-green-500" : "border-blue-500"}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {isLoading && "Preparing transaction..."}
                  {isConfirming && (
                    <div>
                      Transaction submitted! Waiting for confirmation...
                      {txHash && (
                        <Button
                          variant="link"
                          size="sm"
                          className="ml-2 p-0 h-auto"
                          onClick={() => window.open(`https://etherscan.io/tx/${txHash}`, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Transaction
                        </Button>
                      )}
                    </div>
                  )}
                  {isSuccess && `Question created successfully! ID: ${questionId?.slice(0, 10)}...`}
                  {error && `Error: ${error}`}
                </AlertDescription>
              </Alert>
            )}

            <Separator />

            <div className="flex justify-between items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.handleSubmit(handleGasEstimation)()}
                disabled={isLoading || isConfirming || !walletConnected || chainMismatch}
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
                  disabled={isLoading || isConfirming || !walletConnected || chainMismatch}
                >
                  {chainMismatch ? "Switch Network First" : isLoading ? "Preparing..." : isConfirming ? "Confirming..." : "Create Question"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateQuestionModal; // Enhanced wallet integration for better UX
// Improved wallet connection handling for better UX
// Improved wallet connection status indicators
