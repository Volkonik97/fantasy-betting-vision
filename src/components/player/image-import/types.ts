import { Player } from "@/utils/models/types";
import { getDirectPlayerImageUrl } from "@/utils/database/teams/getDirectImageUrl";

export interface PlayerWithImage {
  player: Player;
  imageFile: File | null;
  newImageUrl: string | null;
  isUploading: boolean;
  processed: boolean;
  error: string | null;
}

export interface UploadStatus {
  total: number;
  processed: number;
  success: number;
  failed: number;
  inProgress: boolean;
}

/**
 * Check if a player has an image
 */
export const hasPlayerImage = (player: { image?: string | null } | null | undefined): boolean => {
  if (!player) return false;
  
  return !!player.image && player.image.trim().length > 0;
};

/**
 * Get the display URL for a player image, either from the database or from a direct storage URL
 */
export const getPlayerImageUrl = (player: Player): string | null => {
  // If player already has an image URL in the database, use it
  if (player.image) {
    return player.image;
  }
  
  // Otherwise try to generate a direct URL from player ID
  return getDirectPlayerImageUrl(player.id);
};
