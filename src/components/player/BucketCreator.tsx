
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Check } from "lucide-react";
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

  const createBucket = async () => {
    setIsCreating(true);
    setProgress(10);
    setResult(null);

    try {
      // Step 1: Check if bucket already exists
      setProgress(15);
      const { data: buckets, error: checkError } = await supabase.storage.listBuckets();
      
      if (checkError) {
        console.error("Error checking buckets:", checkError);
        setResult({
          success: false,
          message: `Erreur lors de la vérification des buckets: ${checkError.message}`,
        });
        toast.error(`Erreur lors de la vérification des buckets: ${checkError.message}`);
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
        return;
      }

      // Step 2: Create bucket
      setProgress(30);
      const { error: bucketError } = await supabase.storage.createBucket(bucketId, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      });

      if (bucketError) {
        console.error("Error creating bucket:", bucketError);
        setResult({
          success: false,
          message: `Erreur lors de la création du bucket: ${bucketError.message}`,
        });
        toast.error(`Erreur lors de la création du bucket: ${bucketError.message}`);
        return;
      }

      setProgress(70);
      
      // Step 3: Verify bucket was created
      const { data, error: getBucketError } = await supabase.storage.getBucket(bucketId);
      
      if (getBucketError || !data) {
        setResult({
          success: false,
          message: "Le bucket a été créé mais n'est pas accessible",
        });
        toast.error("Le bucket a été créé mais n'est pas accessible");
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
          Cliquez sur le bouton ci-dessous pour le créer et pouvoir télécharger des images de joueurs.
        </p>
      </div>

      <Button 
        onClick={createBucket} 
        disabled={isCreating}
        className="w-full"
      >
        {isCreating ? "Création en cours..." : "Créer le bucket"}
      </Button>
      
      {isCreating && (
        <Progress value={progress} className="h-2" />
      )}
      
      {result && (
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
            <li>Vous n'avez pas atteint de limite de ressources</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default BucketCreator;
