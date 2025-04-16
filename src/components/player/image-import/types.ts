
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

// Add a helper function to consistently determine if a player has an image
export const hasPlayerImage = (player: Player): boolean => {
  return Boolean(player.image && typeof player.image === 'string' && player.image.trim() !== '');
};
