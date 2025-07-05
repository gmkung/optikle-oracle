import React, { useState, useEffect } from "react";
import QuestionsContainer from "@/components/QuestionsContainer";
import { AlertCircle, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import InfoModal from "@/components/InfoModal";
import { toast } from "sonner";

const Index = () => {
  console.log("Rendering Index page");
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && window.ethereum !== undefined;
  };

  // Check if already connected on page load
  useEffect(() => {
    const checkConnection = async () => {
      if (isMetaMaskInstalled()) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            toast.success("Wallet connected", {
              description: `Connected to ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`,
            });
          }
        } catch (error) {
          console.error("Error checking connection:", error);
        }
      }
    };

    checkConnection();
  }, []);

  // Handle account changes
  useEffect(() => {
    if (isMetaMaskInstalled()) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          toast.success("Wallet changed", {
            description: `Connected to ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`,
          });
        } else {
          setAccount(null);
          toast.error("Wallet disconnected", {
            description: "No wallet connected",
          });
        }
      });
    }

    return () => {
      if (isMetaMaskInstalled()) {
        window.ethereum.removeListener('accountsChanged', () => { });
      }
    };
  }, []);

  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      toast.error("MetaMask not detected", {
        description: "Please install MetaMask to connect your wallet",
        action: {
          label: "Install",
          onClick: () => window.open("https://metamask.io/download/", "_blank"),
        },
      });
      return;
    }

    setIsConnecting(true);

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      toast.success("Wallet connected", {
        description: `Connected to ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`,
      });
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      toast.error("Connection failed", {
        description: "Failed to connect to MetaMask",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background futuristic-grid">
      <header className="border-b border-purple-400/20 backdrop-blur-md bg-background/80 sticky top-0 z-10 px-4">
        <div className="container mx-auto py-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="mr-3 bg-gradient-accent p-2 rounded-full neon-glow">
                <img
                  src="/lovable-uploads/1845472c-af4b-4711-830f-12206988071f.png"
                  alt="Kleros Logo"
                  className="h-5 w-5 text-white animate-float"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight neon-text">
                  Optikle
                </h1>
                <p className="text-muted-foreground text-sm">
                  Explore questions and disputes
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setShowInfoModal(true)}
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full opacity-75 blur-sm animate-pulse-soft"></div>
                <AlertCircle className="h-5 w-5 text-purple-DEFAULT relative bg-background/50 rounded-full p-1 box-content" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className={`relative ${isConnecting ? 'animate-pulse' : 'animate-gentle'}`}
                onClick={connectWallet}
                disabled={isConnecting}
              >
                <div className={`absolute -inset-0.5 rounded-full opacity-50 blur-sm ${account ? 'bg-green-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`}></div>
                <Wallet className={`h-5 w-5 relative bg-background/50 rounded-full p-1 box-content ${account ? 'text-green-400' : 'text-purple-light'}`} />
              </Button>
            </div>
          </div>

          <div className="absolute -bottom-px left-0 right-0 h-[1px] bg-gradient-to-r from-purple-400/50 via-pink-400/50 to-purple-400/50"></div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 md:px-6">
        <div className="relative mb-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-32 bg-purple-500/10 blur-3xl rounded-full pointer-events-none"></div>
          <div className="text-center relative z-10 mb-8">
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-300 via-purple-400 to-purple-300 bg-clip-text text-transparent">
              Optimistic Oracle by Kleros
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Trustless answers to subjective questions, for DAO governance, prediction markets and escrows.
            </p>
          </div>
        </div>

        <QuestionsContainer />
      </main>

      <footer className="border-t border-purple-400/20 mt-12 py-6 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-3">
            <div className="h-[1px] w-10 bg-gradient-to-r from-transparent via-purple-400/50 to-transparent"></div>
            <img
              src="/lovable-uploads/1845472c-af4b-4711-830f-12206988071f.png"
              alt="Kleros Logo"
              className="h-4 w-4 text-purple-light"
            />
            <div className="h-[1px] w-10 bg-gradient-to-r from-transparent via-purple-400/50 to-transparent"></div>
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="neon-text font-medium">
              Optikle
            </span> — Powered by LayerZero, Kleros and Reality.eth
          </p>
        </div>
      </footer>

      <InfoModal open={showInfoModal} onOpenChange={setShowInfoModal} />
    </div>
  );
};

export default Index;
