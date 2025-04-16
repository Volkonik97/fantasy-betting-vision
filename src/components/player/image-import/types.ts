
import { Player } from "@/utils/models/types";

export interface PlayerImageUpload {
  player: Player;
  file: File | null;
  url: string | null;
  status: 'idle' | 'uploading' | 'success' | 'error';
  error: string | null;
}

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

export const hasPlayerImage = (player: Player): boolean => {
  return Boolean(player.image && typeof player.image === 'string' && player.image.trim() !== '');
};
