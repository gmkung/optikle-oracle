
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AlertTriangle, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background futuristic-grid">
      <div className="casino-card p-10 rounded-xl max-w-md mx-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-purple-800/5"></div>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
        <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-purple-500/30 to-transparent"></div>
        <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-purple-500/30 to-transparent"></div>
        
        <div className="relative">
          <div className="relative mb-6">
            <div className="w-16 h-16 mx-auto relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse-soft blur-md opacity-70"></div>
              <div className="absolute inset-0.5 rounded-full bg-dark-DEFAULT"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-purple-400" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2">
            <span className="neon-text">404</span>
            <Sparkles className="h-5 w-5 text-purple-400 opacity-70 animate-pulse-soft" />
          </h1>
          
          <p className="text-xl text-muted-foreground mb-6">
            This page doesn't exist in our universe
          </p>
          
          <Button 
            asChild 
            className="w-full bg-gradient-accent hover:opacity-90 transition-opacity neon-glow mt-2"
          >
            <a href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Kleros Optimistic Oracle
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
