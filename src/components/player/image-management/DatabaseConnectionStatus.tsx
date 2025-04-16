
import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, CheckCircle, Database, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface DatabaseConnectionStatusProps {
  onStatusChange?: (status: "connected" | "error" | "checking") => void;
}

const DatabaseConnectionStatus: React.FC<DatabaseConnectionStatusProps> = ({ 
  onStatusChange 
}) => {
  const [status, setStatus] = useState<"connected" | "error" | "checking" | "idle">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const checkDatabaseConnection = async () => {
    setStatus("checking");
    setErrorMessage(null);
    
    if (onStatusChange) {
      onStatusChange("checking");
    }

    try {
      // Attempt a simple query to check connection with a AbortController for timeout
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 5000); // 5 second timeout
      
      const { data, error } = await supabase
        .from('data_updates')
        .select('updated_at')
        .limit(1)
        .abortSignal(abortController.signal);
      
      clearTimeout(timeoutId);
      
      if (error) {
        console.error("Erreur de connexion à la base de données:", error);
        setStatus("error");
        setErrorMessage(error.message);
        toast.error("Erreur de connexion à la base de données");
        
        if (onStatusChange) {
          onStatusChange("error");
        }
        return false;
      }
      
      setStatus("connected");
      toast.success("Connexion à la base de données établie");
      
      if (onStatusChange) {
        onStatusChange("connected");
      }
      return true;
    } catch (error) {
      console.error("Exception lors de la vérification de la connexion:", error);
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Erreur inconnue");
      toast.error("Erreur de connexion à la base de données");
      
      if (onStatusChange) {
        onStatusChange("error");
      }
      return false;
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    await checkDatabaseConnection();
    setIsRetrying(false);
  };

  useEffect(() => {
    checkDatabaseConnection();
  }, []);

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-2">
        <Database className="h-4 w-4 text-gray-500" />
        
        {status === "idle" && (
          <Badge variant="outline" className="text-gray-500">
            Statut inconnu
          </Badge>
        )}
        
        {status === "checking" && (
          <Badge variant="outline" className="text-blue-500 bg-blue-50 flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Vérification...</span>
          </Badge>
        )}
        
        {status === "connected" && (
          <Badge variant="outline" className="text-green-600 bg-green-50 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            <span>Connecté</span>
          </Badge>
        )}
        
        {status === "error" && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-red-600 bg-red-50 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              <span>Erreur</span>
            </Badge>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-xs"
              onClick={handleRetry}
              disabled={isRetrying}
            >
              {isRetrying ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Réessai...
                </>
              ) : (
                "Réessayer"
              )}
            </Button>
          </div>
        )}
      </div>
      
      {errorMessage && status === "error" && (
        <span className="text-xs text-red-500 hidden md:inline-block">
          {errorMessage}
        </span>
      )}
    </div>
  );
};

export default DatabaseConnectionStatus;
