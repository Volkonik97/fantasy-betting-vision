
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface BucketCreatorProps {
  bucketId: string;
  onBucketCreated: () => void;
}

const BucketCreator: React.FC<BucketCreatorProps> = ({ bucketId, onBucketCreated }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const sanitizeBucketName = (name: string): string => {
    // Convert to lowercase and replace spaces with hyphens
    return name
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '-')     // Replace invalid characters with hyphens
      .replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '');  // Trim non-alphanumeric characters from start/end
  };

  const createBucket = async () => {
    const sanitizedBucketId = sanitizeBucketName(bucketId);

    if (sanitizedBucketId !== bucketId) {
      toast.warning(`Bucket name sanitized to: "${sanitizedBucketId}"`);
    }

    setIsCreating(true);
    setProgress(10);
    setResult(null);

    try {
      console.log(`Attempting to create bucket: "${sanitizedBucketId}"`);
      
      const { data: buckets, error: checkError } = await supabase.storage.listBuckets();
      
      if (checkError) {
        console.error("Error checking buckets:", checkError);
        
        // Check if it's an RLS error
        if (checkError.message?.includes("policy") || checkError.message?.includes("RLS")) {
          setResult({
            success: false,
            message: "Erreur de politique RLS: Vous n'avez pas les permissions nécessaires pour lister les buckets. Contactez l'administrateur du projet.",
          });
          toast.error("Erreur de permissions RLS. Accès refusé.");
        } else {
          setResult({
            success: false,
            message: `Erreur lors de la vérification des buckets: ${checkError.message}`,
          });
          toast.error(`Erreur lors de la vérification des buckets: ${checkError.message}`);
        }
        setIsCreating(false);
        return;
      }
      
      const bucketExists = buckets?.some(bucket => bucket.name === bucketId);
      if (bucketExists) {
        setProgress(100);
        setResult({
          success: true,
          message: "Le bucket existe déjà et est accessible.",
        });
        toast.success("Le bucket existe déjà et est accessible.");
        onBucketCreated();
        setIsCreating(false);
        return;
      }

      setProgress(30);
      console.log(`Creating bucket with ID: "${sanitizedBucketId}"`);
      const { error: bucketError } = await supabase.storage.createBucket(sanitizedBucketId, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      });

      if (bucketError) {
        console.error("Error creating bucket:", bucketError);
        
        // Check if it's an RLS error
        if (bucketError.message?.includes("violates row-level security policy") || 
            bucketError.message?.includes("policy") || 
            bucketError.message?.includes("RLS")) {
          setResult({
            success: false,
            message: "Erreur de politique RLS: Vous n'avez pas les permissions nécessaires pour créer des buckets. Cette opération doit être effectuée par l'administrateur du projet sur le dashboard Supabase.",
          });
          toast.error("Erreur de permissions RLS. Cette opération nécessite un accès administrateur.");
        } else {
          setResult({
            success: false,
            message: `Erreur lors de la création du bucket: ${bucketError.message}`,
          });
          toast.error(`Erreur lors de la création du bucket: ${bucketError.message}`);
        }
        setIsCreating(false);
        return;
      }

      setProgress(70);
      
      // Step 3: Set bucket settings
      try {
        const corsResponse = await supabase.storage.updateBucket(sanitizedBucketId, {
          public: true,
          fileSizeLimit: 5242880, // 5MB
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
        });
        
        if (corsResponse.error) {
          console.warn("Warning: Could not update bucket settings:", corsResponse.error);
        } else {
          console.log("Bucket settings updated successfully");
        }
      } catch (corsError) {
        console.warn("Error updating bucket settings:", corsError);
      }
      
      // Step 4: Verify bucket was created
      const { data, error: getBucketError } = await supabase.storage.getBucket(sanitizedBucketId);
      
      if (getBucketError || !data) {
        setResult({
          success: false,
          message: "Le bucket a été créé mais n'est pas accessible immédiatement. Veuillez rafraîchir la page dans quelques instants.",
        });
        toast.error("Le bucket a été créé mais n'est pas accessible immédiatement");
        setIsCreating(false);
        return;
      }

      setProgress(100);
      setResult({
        success: true,
        message: "Bucket créé avec succès! Vous pouvez maintenant télécharger des images.",
      });
      toast.success("Bucket créé avec succès! Vous pouvez maintenant télécharger des images.");
      
      onBucketCreated();
    } catch (error) {
      console.error("Error creating bucket:", error);
      setResult({
        success: false,
        message: `Une erreur inattendue s'est produite: ${error instanceof Error ? error.message : String(error)}`,
      });
      toast.error("Une erreur inattendue s'est produite lors de la création du bucket");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-4 p-6 border rounded-lg bg-gray-50">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Créer le bucket de stockage</h3>
        <p className="text-sm text-gray-500">
          Le bucket de stockage "{bucketId}" n'existe pas ou n'est pas accessible. 
        </p>
      </div>

      {result?.success === false && result.message.includes("RLS") ? (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle>Action administrateur requise</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>{result.message}</p>
            <p className="text-sm">Pour créer le bucket "{bucketId}", un administrateur doit:</p>
            <ol className="list-decimal ml-5 text-sm space-y-1">
              <li>Se connecter au dashboard Supabase</li>
              <li>Naviguer vers la section Storage</li>
              <li>Cliquer sur "New Bucket"</li>
              <li>Créer un bucket nommé exactement "{bucketId}"</li>
              <li>Définir le bucket comme public</li>
            </ol>
            <div className="mt-3">
              <Button 
                variant="outline"
                className="flex items-center gap-2 text-sm"
                onClick={() => window.open("https://supabase.com/dashboard/project/dtddoxxazhmfudrvpszu/storage/buckets", "_blank")}
              >
                <ExternalLink className="h-4 w-4" />
                Ouvrir le dashboard Supabase
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <Button 
          onClick={createBucket} 
          disabled={isCreating}
          className="w-full"
        >
          {isCreating ? "Création en cours..." : "Créer le bucket"}
        </Button>
      )}
      
      {isCreating && (
        <Progress value={progress} className="h-2" />
      )}
      
      {result && !result.message.includes("RLS") && (
        <Alert className={result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
          {result.success ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertTitle>{result.success ? "Succès" : "Erreur"}</AlertTitle>
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      )}
      
      <Alert className="bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertTitle>Note importante</AlertTitle>
        <AlertDescription>
          Si vous ne parvenez pas à créer le bucket, vérifiez les points suivants:
          <ul className="list-disc ml-5 mt-2 text-sm space-y-1">
            <li>Votre compte Supabase dispose des permissions nécessaires</li>
            <li>La fonctionnalité Storage est activée dans votre projet Supabase</li>
            <li>Les politiques RLS sont configurées pour permettre la création de buckets</li>
            <li>Vous n'avez pas atteint de limite de ressources</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default BucketCreator;
