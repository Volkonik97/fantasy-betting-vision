
import { Player } from "@/utils/models/types";

export interface PlayerImageUpload {
  player: Player;
  file?: File | null;
  url?: string | null;
  status: 'idle' | 'uploading' | 'success' | 'error';
  error?: string | null;
}

export const hasPlayerImage = (player: Player): boolean => {
  return Boolean(player.image && typeof player.image === 'string' && player.image.trim() !== '');
};
