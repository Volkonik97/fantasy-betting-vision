
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { UploadStatus } from "./types";

interface UploadProgressProps {
  status: UploadStatus;
}

const UploadProgress: React.FC<UploadProgressProps> = ({ status }) => {
  if (!status.inProgress) return null;

  const progress = status.total > 0 
    ? Math.round((status.processed / status.total) * 100) 
    : 0;

  return (
    <div className="space-y-2 mt-4">
      <div className="flex items-center gap-2 text-sm text-blue-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>
          Téléchargement en cours : {status.processed}/{status.total} images
          {status.success > 0 && ` (${status.success} réussies)`}
          {status.failed > 0 && ` (${status.failed} échouées)`}
        </span>
      </div>
      <Progress value={progress} className="h-2 w-full" />
    </div>
  );
};

export default UploadProgress;
