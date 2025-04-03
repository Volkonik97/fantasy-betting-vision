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
          bans: Json | null
          barons: number | null
          blue_win_odds: number | null
          chemtechs: number | null
          ckpm: number | null
          clouds: number | null
          date: string | null
          dragons: number | null
          drakes_unknown: number | null
          duration: string | null
          elders: number | null
          elemental_drakes: number | null
          first_baron: string | null
          first_blood: string | null
          first_dragon: string | null
          first_herald: string | null
          first_mid_tower: string | null
          first_three_towers: string | null
          first_tower: string | null
          game_completeness: string | null
          game_number: string | null
          heralds: number | null
          hextechs: number | null
          id: string
          infernals: number | null
          inhibitors: number | null
          mountains: number | null
          mvp: string | null
          oceans: number | null
          opp_barons: number | null
          opp_dragons: number | null
          opp_elders: number | null
          opp_elemental_drakes: number | null
          opp_heralds: number | null
          opp_inhibitors: number | null
          opp_towers: number | null
          opp_turret_plates: number | null
          opp_void_grubs: number | null
          patch: string | null
          picks: Json | null
          playoffs: boolean | null
          predicted_winner: string | null
          red_win_odds: number | null
          score_blue: number | null
          score_red: number | null
          split: string | null
          status: string | null
          team_blue_id: string | null
          team_deaths: number | null
          team_kills: number | null
          team_kpm: number | null
          team_red_id: string | null
          tournament: string | null
          towers: number | null
          turret_plates: number | null
          url: string | null
          void_grubs: number | null
          winner_team_id: string | null
          year: string | null
        }
        Insert: {
          bans?: Json | null
          barons?: number | null
          blue_win_odds?: number | null
          chemtechs?: number | null
          ckpm?: number | null
          clouds?: number | null
          date?: string | null
          dragons?: number | null
          drakes_unknown?: number | null
          duration?: string | null
          elders?: number | null
          elemental_drakes?: number | null
          first_baron?: string | null
          first_blood?: string | null
          first_dragon?: string | null
          first_herald?: string | null
          first_mid_tower?: string | null
          first_three_towers?: string | null
          first_tower?: string | null
          game_completeness?: string | null
          game_number?: string | null
          heralds?: number | null
          hextechs?: number | null
          id: string
          infernals?: number | null
          inhibitors?: number | null
          mountains?: number | null
          mvp?: string | null
          oceans?: number | null
          opp_barons?: number | null
          opp_dragons?: number | null
          opp_elders?: number | null
          opp_elemental_drakes?: number | null
          opp_heralds?: number | null
          opp_inhibitors?: number | null
          opp_towers?: number | null
          opp_turret_plates?: number | null
          opp_void_grubs?: number | null
          patch?: string | null
          picks?: Json | null
          playoffs?: boolean | null
          predicted_winner?: string | null
          red_win_odds?: number | null
          score_blue?: number | null
          score_red?: number | null
          split?: string | null
          status?: string | null
          team_blue_id?: string | null
          team_deaths?: number | null
          team_kills?: number | null
          team_kpm?: number | null
          team_red_id?: string | null
          tournament?: string | null
          towers?: number | null
          turret_plates?: number | null
          url?: string | null
          void_grubs?: number | null
          winner_team_id?: string | null
          year?: string | null
        }
        Update: {
          bans?: Json | null
          barons?: number | null
          blue_win_odds?: number | null
          chemtechs?: number | null
          ckpm?: number | null
          clouds?: number | null
          date?: string | null
          dragons?: number | null
          drakes_unknown?: number | null
          duration?: string | null
          elders?: number | null
          elemental_drakes?: number | null
          first_baron?: string | null
          first_blood?: string | null
          first_dragon?: string | null
          first_herald?: string | null
          first_mid_tower?: string | null
          first_three_towers?: string | null
          first_tower?: string | null
          game_completeness?: string | null
          game_number?: string | null
          heralds?: number | null
          hextechs?: number | null
          id?: string
          infernals?: number | null
          inhibitors?: number | null
          mountains?: number | null
          mvp?: string | null
          oceans?: number | null
          opp_barons?: number | null
          opp_dragons?: number | null
          opp_elders?: number | null
          opp_elemental_drakes?: number | null
          opp_heralds?: number | null
          opp_inhibitors?: number | null
          opp_towers?: number | null
          opp_turret_plates?: number | null
          opp_void_grubs?: number | null
          patch?: string | null
          picks?: Json | null
          playoffs?: boolean | null
          predicted_winner?: string | null
          red_win_odds?: number | null
          score_blue?: number | null
          score_red?: number | null
          split?: string | null
          status?: string | null
          team_blue_id?: string | null
          team_deaths?: number | null
          team_kills?: number | null
          team_kpm?: number | null
          team_red_id?: string | null
          tournament?: string | null
          towers?: number | null
          turret_plates?: number | null
          url?: string | null
          void_grubs?: number | null
          winner_team_id?: string | null
          year?: string | null
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
      player_match_stats: {
        Row: {
          assists: number | null
          assists_at_10: number | null
          assists_at_15: number | null
          assists_at_20: number | null
          assists_at_25: number | null
          champion: string | null
          control_wards_bought: number | null
          created_at: string | null
          cs_at_10: number | null
          cs_at_15: number | null
          cs_at_20: number | null
          cs_at_25: number | null
          cs_diff_at_10: number | null
          cs_diff_at_15: number | null
          cs_diff_at_20: number | null
          cs_diff_at_25: number | null
          cspm: number | null
          damage_mitigated_per_minute: number | null
          damage_share: number | null
          damage_taken_per_minute: number | null
          damage_to_champions: number | null
          deaths: number | null
          deaths_at_10: number | null
          deaths_at_15: number | null
          deaths_at_20: number | null
          deaths_at_25: number | null
          double_kills: number | null
          dpm: number | null
          earned_gold: number | null
          earned_gold_share: number | null
          earned_gpm: number | null
          first_blood_assist: boolean | null
          first_blood_kill: boolean | null
          first_blood_victim: boolean | null
          gold_at_10: number | null
          gold_at_15: number | null
          gold_at_20: number | null
          gold_at_25: number | null
          gold_diff_at_10: number | null
          gold_diff_at_15: number | null
          gold_diff_at_20: number | null
          gold_diff_at_25: number | null
          gold_spent: number | null
          gpr: number | null
          gspd: number | null
          id: string
          is_winner: boolean | null
          kills: number | null
          kills_at_10: number | null
          kills_at_15: number | null
          kills_at_20: number | null
          kills_at_25: number | null
          match_id: string | null
          minion_kills: number | null
          monster_kills: number | null
          monster_kills_enemy_jungle: number | null
          monster_kills_own_jungle: number | null
          opp_assists_at_10: number | null
          opp_assists_at_15: number | null
          opp_assists_at_20: number | null
          opp_assists_at_25: number | null
          opp_cs_at_10: number | null
          opp_cs_at_15: number | null
          opp_cs_at_20: number | null
          opp_cs_at_25: number | null
          opp_deaths_at_10: number | null
          opp_deaths_at_15: number | null
          opp_deaths_at_20: number | null
          opp_deaths_at_25: number | null
          opp_gold_at_10: number | null
          opp_gold_at_15: number | null
          opp_gold_at_20: number | null
          opp_gold_at_25: number | null
          opp_kills_at_10: number | null
          opp_kills_at_15: number | null
          opp_kills_at_20: number | null
          opp_kills_at_25: number | null
          opp_xp_at_10: number | null
          opp_xp_at_15: number | null
          opp_xp_at_20: number | null
          opp_xp_at_25: number | null
          participant_id: string | null
          penta_kills: number | null
          player_id: string | null
          position: string | null
          quadra_kills: number | null
          side: string | null
          team_id: string | null
          total_cs: number | null
          total_gold: number | null
          triple_kills: number | null
          vision_score: number | null
          vspm: number | null
          wards_killed: number | null
          wards_placed: number | null
          wcpm: number | null
          wpm: number | null
          xp_at_10: number | null
          xp_at_15: number | null
          xp_at_20: number | null
          xp_at_25: number | null
          xp_diff_at_10: number | null
          xp_diff_at_15: number | null
          xp_diff_at_20: number | null
          xp_diff_at_25: number | null
        }
        Insert: {
          assists?: number | null
          assists_at_10?: number | null
          assists_at_15?: number | null
          assists_at_20?: number | null
          assists_at_25?: number | null
          champion?: string | null
          control_wards_bought?: number | null
          created_at?: string | null
          cs_at_10?: number | null
          cs_at_15?: number | null
          cs_at_20?: number | null
          cs_at_25?: number | null
          cs_diff_at_10?: number | null
          cs_diff_at_15?: number | null
          cs_diff_at_20?: number | null
          cs_diff_at_25?: number | null
          cspm?: number | null
          damage_mitigated_per_minute?: number | null
          damage_share?: number | null
          damage_taken_per_minute?: number | null
          damage_to_champions?: number | null
          deaths?: number | null
          deaths_at_10?: number | null
          deaths_at_15?: number | null
          deaths_at_20?: number | null
          deaths_at_25?: number | null
          double_kills?: number | null
          dpm?: number | null
          earned_gold?: number | null
          earned_gold_share?: number | null
          earned_gpm?: number | null
          first_blood_assist?: boolean | null
          first_blood_kill?: boolean | null
          first_blood_victim?: boolean | null
          gold_at_10?: number | null
          gold_at_15?: number | null
          gold_at_20?: number | null
          gold_at_25?: number | null
          gold_diff_at_10?: number | null
          gold_diff_at_15?: number | null
          gold_diff_at_20?: number | null
          gold_diff_at_25?: number | null
          gold_spent?: number | null
          gpr?: number | null
          gspd?: number | null
          id?: string
          is_winner?: boolean | null
          kills?: number | null
          kills_at_10?: number | null
          kills_at_15?: number | null
          kills_at_20?: number | null
          kills_at_25?: number | null
          match_id?: string | null
          minion_kills?: number | null
          monster_kills?: number | null
          monster_kills_enemy_jungle?: number | null
          monster_kills_own_jungle?: number | null
          opp_assists_at_10?: number | null
          opp_assists_at_15?: number | null
          opp_assists_at_20?: number | null
          opp_assists_at_25?: number | null
          opp_cs_at_10?: number | null
          opp_cs_at_15?: number | null
          opp_cs_at_20?: number | null
          opp_cs_at_25?: number | null
          opp_deaths_at_10?: number | null
          opp_deaths_at_15?: number | null
          opp_deaths_at_20?: number | null
          opp_deaths_at_25?: number | null
          opp_gold_at_10?: number | null
          opp_gold_at_15?: number | null
          opp_gold_at_20?: number | null
          opp_gold_at_25?: number | null
          opp_kills_at_10?: number | null
          opp_kills_at_15?: number | null
          opp_kills_at_20?: number | null
          opp_kills_at_25?: number | null
          opp_xp_at_10?: number | null
          opp_xp_at_15?: number | null
          opp_xp_at_20?: number | null
          opp_xp_at_25?: number | null
          participant_id?: string | null
          penta_kills?: number | null
          player_id?: string | null
          position?: string | null
          quadra_kills?: number | null
          side?: string | null
          team_id?: string | null
          total_cs?: number | null
          total_gold?: number | null
          triple_kills?: number | null
          vision_score?: number | null
          vspm?: number | null
          wards_killed?: number | null
          wards_placed?: number | null
          wcpm?: number | null
          wpm?: number | null
          xp_at_10?: number | null
          xp_at_15?: number | null
          xp_at_20?: number | null
          xp_at_25?: number | null
          xp_diff_at_10?: number | null
          xp_diff_at_15?: number | null
          xp_diff_at_20?: number | null
          xp_diff_at_25?: number | null
        }
        Update: {
          assists?: number | null
          assists_at_10?: number | null
          assists_at_15?: number | null
          assists_at_20?: number | null
          assists_at_25?: number | null
          champion?: string | null
          control_wards_bought?: number | null
          created_at?: string | null
          cs_at_10?: number | null
          cs_at_15?: number | null
          cs_at_20?: number | null
          cs_at_25?: number | null
          cs_diff_at_10?: number | null
          cs_diff_at_15?: number | null
          cs_diff_at_20?: number | null
          cs_diff_at_25?: number | null
          cspm?: number | null
          damage_mitigated_per_minute?: number | null
          damage_share?: number | null
          damage_taken_per_minute?: number | null
          damage_to_champions?: number | null
          deaths?: number | null
          deaths_at_10?: number | null
          deaths_at_15?: number | null
          deaths_at_20?: number | null
          deaths_at_25?: number | null
          double_kills?: number | null
          dpm?: number | null
          earned_gold?: number | null
          earned_gold_share?: number | null
          earned_gpm?: number | null
          first_blood_assist?: boolean | null
          first_blood_kill?: boolean | null
          first_blood_victim?: boolean | null
          gold_at_10?: number | null
          gold_at_15?: number | null
          gold_at_20?: number | null
          gold_at_25?: number | null
          gold_diff_at_10?: number | null
          gold_diff_at_15?: number | null
          gold_diff_at_20?: number | null
          gold_diff_at_25?: number | null
          gold_spent?: number | null
          gpr?: number | null
          gspd?: number | null
          id?: string
          is_winner?: boolean | null
          kills?: number | null
          kills_at_10?: number | null
          kills_at_15?: number | null
          kills_at_20?: number | null
          kills_at_25?: number | null
          match_id?: string | null
          minion_kills?: number | null
          monster_kills?: number | null
          monster_kills_enemy_jungle?: number | null
          monster_kills_own_jungle?: number | null
          opp_assists_at_10?: number | null
          opp_assists_at_15?: number | null
          opp_assists_at_20?: number | null
          opp_assists_at_25?: number | null
          opp_cs_at_10?: number | null
          opp_cs_at_15?: number | null
          opp_cs_at_20?: number | null
          opp_cs_at_25?: number | null
          opp_deaths_at_10?: number | null
          opp_deaths_at_15?: number | null
          opp_deaths_at_20?: number | null
          opp_deaths_at_25?: number | null
          opp_gold_at_10?: number | null
          opp_gold_at_15?: number | null
          opp_gold_at_20?: number | null
          opp_gold_at_25?: number | null
          opp_kills_at_10?: number | null
          opp_kills_at_15?: number | null
          opp_kills_at_20?: number | null
          opp_kills_at_25?: number | null
          opp_xp_at_10?: number | null
          opp_xp_at_15?: number | null
          opp_xp_at_20?: number | null
          opp_xp_at_25?: number | null
          participant_id?: string | null
          penta_kills?: number | null
          player_id?: string | null
          position?: string | null
          quadra_kills?: number | null
          side?: string | null
          team_id?: string | null
          total_cs?: number | null
          total_gold?: number | null
          triple_kills?: number | null
          vision_score?: number | null
          vspm?: number | null
          wards_killed?: number | null
          wards_placed?: number | null
          wcpm?: number | null
          wpm?: number | null
          xp_at_10?: number | null
          xp_at_15?: number | null
          xp_at_20?: number | null
          xp_at_25?: number | null
          xp_diff_at_10?: number | null
          xp_diff_at_15?: number | null
          xp_diff_at_20?: number | null
          xp_diff_at_25?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "player_match_stats_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_match_stats_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_match_stats_team_id_fkey"
            columns: ["team_id"]
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
      team_match_stats: {
        Row: {
          bans: Json | null
          barons: number | null
          chemtechs: number | null
          clouds: number | null
          created_at: string | null
          deaths: number | null
          dragons: number | null
          drakes_unknown: number | null
          elders: number | null
          elemental_drakes: number | null
          first_baron: boolean | null
          first_blood: boolean | null
          first_dragon: boolean | null
          first_herald: boolean | null
          first_mid_tower: boolean | null
          first_three_towers: boolean | null
          first_tower: boolean | null
          heralds: number | null
          hextechs: number | null
          id: string
          infernals: number | null
          inhibitors: number | null
          is_blue_side: boolean
          kills: number | null
          kpm: number | null
          match_id: string
          mountains: number | null
          oceans: number | null
          picks: Json | null
          team_id: string
          towers: number | null
          turret_plates: number | null
          void_grubs: number | null
        }
        Insert: {
          bans?: Json | null
          barons?: number | null
          chemtechs?: number | null
          clouds?: number | null
          created_at?: string | null
          deaths?: number | null
          dragons?: number | null
          drakes_unknown?: number | null
          elders?: number | null
          elemental_drakes?: number | null
          first_baron?: boolean | null
          first_blood?: boolean | null
          first_dragon?: boolean | null
          first_herald?: boolean | null
          first_mid_tower?: boolean | null
          first_three_towers?: boolean | null
          first_tower?: boolean | null
          heralds?: number | null
          hextechs?: number | null
          id?: string
          infernals?: number | null
          inhibitors?: number | null
          is_blue_side: boolean
          kills?: number | null
          kpm?: number | null
          match_id: string
          mountains?: number | null
          oceans?: number | null
          picks?: Json | null
          team_id: string
          towers?: number | null
          turret_plates?: number | null
          void_grubs?: number | null
        }
        Update: {
          bans?: Json | null
          barons?: number | null
          chemtechs?: number | null
          clouds?: number | null
          created_at?: string | null
          deaths?: number | null
          dragons?: number | null
          drakes_unknown?: number | null
          elders?: number | null
          elemental_drakes?: number | null
          first_baron?: boolean | null
          first_blood?: boolean | null
          first_dragon?: boolean | null
          first_herald?: boolean | null
          first_mid_tower?: boolean | null
          first_three_towers?: boolean | null
          first_tower?: boolean | null
          heralds?: number | null
          hextechs?: number | null
          id?: string
          infernals?: number | null
          inhibitors?: number | null
          is_blue_side?: boolean
          kills?: number | null
          kpm?: number | null
          match_id?: string
          mountains?: number | null
          oceans?: number | null
          picks?: Json | null
          team_id?: string
          towers?: number | null
          turret_plates?: number | null
          void_grubs?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "team_match_stats_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_match_stats_team_id_fkey"
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
      get_kiin_debug: {
        Args: Record<PropertyKey, never>
        Returns: {
          champion_pool: string[] | null
          cs_per_min: number | null
          damage_share: number | null
          id: string
          image: string | null
          kda: number | null
          name: string
          role: string | null
          team_id: string | null
        }[]
      }
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
