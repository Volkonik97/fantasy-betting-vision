
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import PlayerImagesSection from "./PlayerImagesSection";
import PageHeader from "./PageHeader";
import HelpDialog from "./HelpDialog";
import BucketStatusSection from "./BucketStatusSection";
import DatabaseConnectionStatus from "./DatabaseConnectionStatus";

const PlayerImagesContainer = () => {
  const [bucketStatus, setBucketStatus] = useState<"loading" | "exists" | "error">("loading");
  const [rlsEnabled, setRlsEnabled] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  // Vérifier si le bucket de stockage existe
  useEffect(() => {
    const checkBucketAccess = async () => {
      try {
        const { data, error } = await supabase.storage.getBucket('player-images');
        
        if (error) {
          if (error.message.includes("policy")) {
            setRlsEnabled(true);
            setBucketStatus("error");
          } else {
            setBucketStatus("error");
          }
          return;
        }
        
        if (data) {
          // Vérifier l'accès effectif en essayant de lister les fichiers
          const { data: files, error: listError } = await supabase.storage
            .from('player-images')
            .list('');
            
          if (listError) {
            if (listError.message.includes("policy") || 
                listError.message.includes("permission") || 
                listError.message.includes("access")) {
              setRlsEnabled(true);
              setBucketStatus("error");
            } else {
              setBucketStatus("error");
            }
          } else {
            setBucketStatus("exists");
          }
        } else {
          setBucketStatus("error");
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du bucket:", error);
        setBucketStatus("error");
      }
    };

    checkBucketAccess();
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <PageHeader onHelpClick={() => setHelpOpen(true)} />
      
      <div className="grid gap-6 mt-6">
        <DatabaseConnectionStatus />
        
        <BucketStatusSection
          bucketStatus={bucketStatus}
          rlsEnabled={rlsEnabled}
          onRlsHelpClick={() => setHelpOpen(true)}
        />
        
        <PlayerImagesSection 
          bucketStatus={bucketStatus}
          rlsEnabled={rlsEnabled}
          showRlsHelp={() => setHelpOpen(true)}
        />
      </div>
      
      <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
    </div>
  );
};

export default PlayerImagesContainer;
