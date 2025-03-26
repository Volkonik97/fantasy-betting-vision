export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      data_updates: {
        Row: {
          id: number
          updated_at: string | null
        }
        Insert: {
          id?: number
          updated_at?: string | null
        }
        Update: {
          id?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      matches: {
        Row: {
          blue_win_odds: number | null
          date: string | null
          duration: string | null
          first_baron: string | null
          first_blood: string | null
          first_dragon: string | null
          id: string
          mvp: string | null
          predicted_winner: string | null
          red_win_odds: number | null
          score_blue: number | null
          score_red: number | null
          status: string | null
          team_blue_id: string | null
          team_red_id: string | null
          tournament: string | null
          winner_team_id: string | null
        }
        Insert: {
          blue_win_odds?: number | null
          date?: string | null
          duration?: string | null
          first_baron?: string | null
          first_blood?: string | null
          first_dragon?: string | null
          id: string
          mvp?: string | null
          predicted_winner?: string | null
          red_win_odds?: number | null
          score_blue?: number | null
          score_red?: number | null
          status?: string | null
          team_blue_id?: string | null
          team_red_id?: string | null
          tournament?: string | null
          winner_team_id?: string | null
        }
        Update: {
          blue_win_odds?: number | null
          date?: string | null
          duration?: string | null
          first_baron?: string | null
          first_blood?: string | null
          first_dragon?: string | null
          id?: string
          mvp?: string | null
          predicted_winner?: string | null
          red_win_odds?: number | null
          score_blue?: number | null
          score_red?: number | null
          status?: string | null
          team_blue_id?: string | null
          team_red_id?: string | null
          tournament?: string | null
          winner_team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_team_blue_id_fkey"
            columns: ["team_blue_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_team_red_id_fkey"
            columns: ["team_red_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          champion_pool: string[] | null
          cs_per_min: number | null
          damage_share: number | null
          id: string
          image: string | null
          kda: number | null
          name: string
          role: string | null
          team_id: string | null
        }
        Insert: {
          champion_pool?: string[] | null
          cs_per_min?: number | null
          damage_share?: number | null
          id: string
          image?: string | null
          kda?: number | null
          name: string
          role?: string | null
          team_id?: string | null
        }
        Update: {
          champion_pool?: string[] | null
          cs_per_min?: number | null
          damage_share?: number | null
          id?: string
          image?: string | null
          kda?: number | null
          name?: string
          role?: string | null
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          average_game_time: number | null
          blue_win_rate: number | null
          id: string
          logo: string | null
          name: string
          red_win_rate: number | null
          region: string | null
          win_rate: number | null
        }
        Insert: {
          average_game_time?: number | null
          blue_win_rate?: number | null
          id: string
          logo?: string | null
          name: string
          red_win_rate?: number | null
          region?: string | null
          win_rate?: number | null
        }
        Update: {
          average_game_time?: number | null
          blue_win_rate?: number | null
          id?: string
          logo?: string | null
          name?: string
          red_win_rate?: number | null
          region?: string | null
          win_rate?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
