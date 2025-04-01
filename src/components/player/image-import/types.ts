
import { Player } from "@/utils/models/types";

export interface PlayerWithImage {
  player: Player;
  imageFile: File | null;
  newImageUrl: string | null;
  processed: boolean;
}

export interface ImageUploadError {
  count: number;
  lastError: string | null;
}
