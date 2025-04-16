
import { Player } from "@/utils/models/types";

export interface PlayerWithImage {
  player: Player;
  imageFile: File | null;
  newImageUrl: string | null;
  processed: boolean;
  isUploading: boolean;
  error: string | null;
}

export interface UploadStatus {
  total: number;
  processed: number;
  success: number;
  failed: number;
  inProgress: boolean;
}
