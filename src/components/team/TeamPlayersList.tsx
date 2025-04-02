
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Player } from "@/utils/models/types";
import PlayerCard from "@/components/PlayerCard";
import { normalizeRoleName } from "@/utils/leagueData/assembler/modelConverter";
import { toast } from "sonner";

interface TeamPlayersListProps {
  players: Player[];
  teamName?: string;
}

// Fallback player data by team
const FALLBACK_PLAYERS: Record<string, Player[]> = {
  // 100 Thieves fallback data
  "100 Thieves": [
    {
      id: "100t-tenacity",
      name: "Tenacity",
      role: "Top",
      image: "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/a/a6/100_Tenacity_2023_Split_1.png",
      team: "oe:team:4bd1751425ef6a9bc9d4d8e9385b4a6",
      teamName: "100 Thieves",
      kda: 3.2,
      csPerMin: 8.1,
      damageShare: 0.24,
      championPool: ["K'Sante", "Gnar", "Jax"]
    },
    {
      id: "100t-closer",
      name: "Closer",
      role: "Jungle",
      image: "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/e/e7/100_Closer_2023_Split_1.png",
      team: "oe:team:4bd1751425ef6a9bc9d4d8e9385b4a6",
      teamName: "100 Thieves",
      kda: 3.8,
      csPerMin: 5.9,
      damageShare: 0.18,
      championPool: ["Viego", "Lee Sin", "Maokai"]
    },
    {
      id: "100t-quid",
      name: "Quid",
      role: "Mid",
      image: "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/a/ad/100_APA_2023_Split_1.png",
      team: "oe:team:4bd1751425ef6a9bc9d4d8e9385b4a6",
      teamName: "100 Thieves",
      kda: 3.5,
      csPerMin: 9.2,
      damageShare: 0.27,
      championPool: ["Azir", "Orianna", "Syndra"]
    },
    {
      id: "100t-fbi",
      name: "FBI",
      role: "ADC",
      image: "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/1/1d/100_Doublelift_2023_Split_1.png",
      team: "oe:team:4bd1751425ef6a9bc9d4d8e9385b4a6",
      teamName: "100 Thieves",
      kda: 4.1,
      csPerMin: 10.2,
      damageShare: 0.31,
      championPool: ["Zeri", "Jinx", "Lucian"]
    },
    {
      id: "100t-eyla",
      name: "Eyla",
      role: "Support",
      image: "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/c/c5/100_Busio_2023_Split_1.png",
      team: "oe:team:4bd1751425ef6a9bc9d4d8e9385b4a6",
      teamName: "100 Thieves",
      kda: 3.9,
      csPerMin: 1.2,
      damageShare: 0.12,
      championPool: ["Lulu", "Nautilus", "Thresh"]
    }
  ],
  // Fnatic fallback data
  "Fnatic": [
    {
      id: "fnc-wunder",
      name: "Wunder",
      role: "Top",
      image: "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/d/d2/FNC_Wunder_2022_Split_1.png",
      team: "oe:team:78f183fa5a7d8ecb22b9ad272c3abd7",
      teamName: "Fnatic",
      kda: 3.7,
      csPerMin: 8.4,
      damageShare: 0.23,
      championPool: ["Gnar", "Ornn", "Gragas"]
    },
    {
      id: "fnc-razork",
      name: "Razork",
      role: "Jungle",
      image: "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/9/9a/FNC_Razork_2022_Split_1.png",
      team: "oe:team:78f183fa5a7d8ecb22b9ad272c3abd7",
      teamName: "Fnatic",
      kda: 3.9,
      csPerMin: 5.7,
      damageShare: 0.16,
      championPool: ["Viego", "Xin Zhao", "Lee Sin"]
    },
    {
      id: "fnc-humanoid",
      name: "Humanoid",
      role: "Mid",
      image: "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/d/d6/FNC_Humanoid_2022_Split_1.png",
      team: "oe:team:78f183fa5a7d8ecb22b9ad272c3abd7",
      teamName: "Fnatic",
      kda: 4.1,
      csPerMin: 9.6,
      damageShare: 0.29,
      championPool: ["Ahri", "Viktor", "Twisted Fate"]
    },
    {
      id: "fnc-upset",
      name: "Upset",
      role: "ADC",
      image: "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/7/79/FNC_Upset_2022_Split_1.png",
      team: "oe:team:78f183fa5a7d8ecb22b9ad272c3abd7",
      teamName: "Fnatic",
      kda: 5.2,
      csPerMin: 10.3,
      damageShare: 0.32,
      championPool: ["Jinx", "Aphelios", "Xayah"]
    },
    {
      id: "fnc-hylissang",
      name: "Hylissang",
      role: "Support",
      image: "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/5/56/FNC_Hylissang_2022_Split_1.png",
      team: "oe:team:78f183fa5a7d8ecb22b9ad272c3abd7",
      teamName: "Fnatic",
      kda: 3.4,
      csPerMin: 1.0,
      damageShare: 0.10,
      championPool: ["Pyke", "Rakan", "Thresh"]
    }
  ],
  // G2 fallback data
  "G2 Esports": [
    {
      id: "g2-brokenblade",
      name: "BrokenBlade",
      role: "Top",
      image: "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/0/06/G2_BrokenBlade_2022_Split_1.png",
      team: "oe:team:ec38a4e3331e1e56c7680ef91a0ba5c",
      teamName: "G2 Esports",
      kda: 4.1,
      csPerMin: 8.3,
      damageShare: 0.25,
      championPool: ["Aatrox", "Gangplank", "Jayce"]
    },
    {
      id: "g2-jankos",
      name: "Jankos",
      role: "Jungle",
      image: "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/7/7d/G2_Jankos_2022_Split_1.png",
      team: "oe:team:ec38a4e3331e1e56c7680ef91a0ba5c",
      teamName: "G2 Esports",
      kda: 4.5,
      csPerMin: 6.1,
      damageShare: 0.17,
      championPool: ["Lee Sin", "Jarvan IV", "Hecarim"]
    },
    {
      id: "g2-caps",
      name: "Caps",
      role: "Mid",
      image: "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/3/31/G2_Caps_2022_Split_1.png",
      team: "oe:team:ec38a4e3331e1e56c7680ef91a0ba5c",
      teamName: "G2 Esports",
      kda: 5.3,
      csPerMin: 9.8,
      damageShare: 0.31,
      championPool: ["Leblanc", "Sylas", "Ahri"]
    },
    {
      id: "g2-flakked",
      name: "Flakked",
      role: "ADC",
      image: "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/1/10/G2_Flakked_2022_Split_1.png",
      team: "oe:team:ec38a4e3331e1e56c7680ef91a0ba5c",
      teamName: "G2 Esports",
      kda: 4.8,
      csPerMin: 10.1,
      damageShare: 0.28,
      championPool: ["Zeri", "Kai'Sa", "Jhin"]
    },
    {
      id: "g2-targamas",
      name: "Targamas",
      role: "Support",
      image: "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/5/53/G2_Targamas_2022_Split_1.png",
      team: "oe:team:ec38a4e3331e1e56c7680ef91a0ba5c",
      teamName: "G2 Esports",
      kda: 3.6,
      csPerMin: 1.1,
      damageShare: 0.09,
      championPool: ["Braum", "Rakan", "Nautilus"]
    }
  ],
  // T1 fallback data
  "T1": [
    {
      id: "t1-zeus",
      name: "Zeus",
      role: "Top",
      image: "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/6/6c/T1_Zeus_2022_Split_1.png",
      team: "oe:team:6cd05f0ac20bfb965a59dc8bcc4f184",
      teamName: "T1",
      kda: 4.3,
      csPerMin: 8.7,
      damageShare: 0.24,
      championPool: ["Jayce", "Gnar", "Kennen"]
    },
    {
      id: "t1-oner",
      name: "Oner",
      role: "Jungle",
      image: "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/f/f0/T1_Oner_2022_Split_1.png",
      team: "oe:team:6cd05f0ac20bfb965a59dc8bcc4f184",
      teamName: "T1",
      kda: 4.6,
      csPerMin: 6.2,
      damageShare: 0.18,
      championPool: ["Lee Sin", "Viego", "Diana"]
    },
    {
      id: "t1-faker",
      name: "Faker",
      role: "Mid",
      image: "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/c/cd/T1_Faker_2022_Split_1.png",
      team: "oe:team:6cd05f0ac20bfb965a59dc8bcc4f184",
      teamName: "T1",
      kda: 5.8,
      csPerMin: 9.9,
      damageShare: 0.28,
      championPool: ["LeBlanc", "Ahri", "Azir"]
    },
    {
      id: "t1-gumayusi",
      name: "Gumayusi",
      role: "ADC",
      image: "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/c/c8/T1_Gumayusi_2022_Split_1.png",
      team: "oe:team:6cd05f0ac20bfb965a59dc8bcc4f184",
      teamName: "T1",
      kda: 5.2,
      csPerMin: 10.4,
      damageShare: 0.30,
      championPool: ["Jinx", "Aphelios", "Jhin"]
    },
    {
      id: "t1-keria",
      name: "Keria",
      role: "Support",
      image: "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/7/71/T1_Keria_2022_Split_1.png",
      team: "oe:team:6cd05f0ac20bfb965a59dc8bcc4f184",
      teamName: "T1",
      kda: 4.9,
      csPerMin: 1.2,
      damageShare: 0.10,
      championPool: ["Thresh", "Leona", "Nautilus"]
    }
  ],
  // GenG fallback data
  "Gen.G": [
    {
      id: "geng-doran",
      name: "Doran",
      role: "Top",
      image: "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/6/6e/GEN_Doran_2022_Split_1.png",
      team: "oe:team:7d6673d3a9d00363c6bebc1a630da6e",
      teamName: "Gen.G",
      kda: 3.9,
      csPerMin: 8.5,
      damageShare: 0.23,
      championPool: ["Gnar", "Gragas", "Jayce"]
    },
    {
      id: "geng-peanut",
      name: "Peanut",
      role: "Jungle",
      image: "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/3/38/GEN_Peanut_2022_Split_1.png",
      team: "oe:team:7d6673d3a9d00363c6bebc1a630da6e",
      teamName: "Gen.G",
      kda: 4.8,
      csPerMin: 6.0,
      damageShare: 0.16,
      championPool: ["Xin Zhao", "Viego", "Lee Sin"]
    },
    {
      id: "geng-chovy",
      name: "Chovy",
      role: "Mid",
      image: "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/4/4c/GEN_Chovy_2022_Split_1.png",
      team: "oe:team:7d6673d3a9d00363c6bebc1a630da6e",
      teamName: "Gen.G",
      kda: 5.6,
      csPerMin: 10.2,
      damageShare: 0.30,
      championPool: ["Ahri", "Viktor", "Corki"]
    },
    {
      id: "geng-ruler",
      name: "Ruler",
      role: "ADC",
      image: "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/a/a4/GEN_Ruler_2022_Split_1.png",
      team: "oe:team:7d6673d3a9d00363c6bebc1a630da6e",
      teamName: "Gen.G",
      kda: 6.1,
      csPerMin: 10.5,
      damageShare: 0.31,
      championPool: ["Jinx", "Aphelios", "Ezreal"]
    },
    {
      id: "geng-lehends",
      name: "Lehends",
      role: "Support",
      image: "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/2/29/GEN_Lehends_2022_Split_1.png",
      team: "oe:team:7d6673d3a9d00363c6bebc1a630da6e",
      teamName: "Gen.G",
      kda: 4.5,
      csPerMin: 1.1,
      damageShare: 0.10,
      championPool: ["Renata Glasc", "Thresh", "Nautilus"]
    }
  ]
};

// Get a team's fallback players by team name
const getFallbackPlayersByTeam = (teamName: string): Player[] | undefined => {
  // Try exact match first
  if (teamName && FALLBACK_PLAYERS[teamName]) {
    return FALLBACK_PLAYERS[teamName];
  }
  
  // Try case-insensitive match
  if (teamName) {
    const normalizedTeamName = teamName.toLowerCase();
    const key = Object.keys(FALLBACK_PLAYERS).find(
      key => key.toLowerCase() === normalizedTeamName
    );
    if (key) return FALLBACK_PLAYERS[key];
  }
  
  // If no match found, return undefined
  return undefined;
};

const TeamPlayersList = ({ players, teamName }: TeamPlayersListProps) => {
  // Check if players is defined and is an array
  const hasPlayers = Array.isArray(players) && players.length > 0;
  
  console.log(`TeamPlayersList rendered with ${players?.length || 0} players for team ${teamName || 'unknown'}`);
  if (Array.isArray(players)) {
    console.log("Players data:", players);
  } else {
    console.log("Players data is not an array:", players);
  }
  
  useEffect(() => {
    if (!hasPlayers && teamName) {
      console.warn(`No players found for team ${teamName}`);
      
      // Show toast with delay to avoid multiple notifications
      const timer = setTimeout(() => {
        toast.error(`Impossible de charger les joueurs pour l'équipe ${teamName || 'sélectionnée'}`);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [hasPlayers, teamName]);
  
  // Try to get fallback players if no players are available
  const fallbackPlayers = !hasPlayers && teamName ? getFallbackPlayersByTeam(teamName) : undefined;
  const usesFallbackData = Boolean(fallbackPlayers);
  
  if (usesFallbackData) {
    console.log(`Using fallback player data for ${teamName}`);
  }
  
  // Use fallback players or empty array if no players and no fallbacks
  const displayPlayers = hasPlayers ? players : (fallbackPlayers || []);
  
  // If we have no players and no fallbacks, show empty state
  if (displayPlayers.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="mt-8"
      >
        <h2 className="text-2xl font-bold mb-4">Joueurs (0)</h2>
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500">Aucun joueur trouvé pour cette équipe</p>
        </div>
      </motion.div>
    );
  }

  // Sort players by role in the standard order: Top, Jungle, Mid, ADC/Bot, Support
  const sortedPlayers = [...displayPlayers].sort((a, b) => {
    const roleOrder: Record<string, number> = {
      'Top': 0,
      'Jungle': 1, 
      'Mid': 2,
      'ADC': 3,
      'Support': 4
    };
    
    // Get the standardized role for sorting purposes
    const getRoleSortValue = (role: string): number => {
      const normalizedRole = normalizeRoleName(role);
      return roleOrder[normalizedRole] ?? 2; // Default to Mid (2) if unknown
    };
    
    return getRoleSortValue(a.role) - getRoleSortValue(b.role);
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="mt-8"
    >
      <h2 className="text-2xl font-bold mb-4">
        Joueurs ({sortedPlayers.length})
        {usesFallbackData && (
          <span className="text-sm font-normal text-gray-500 ml-2">(données de secours)</span>
        )}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {sortedPlayers.map(player => {
          // Verify player has all required properties before rendering
          if (!player || !player.id) {
            console.error("Invalid player data:", player);
            return null;
          }
          
          // Enrich player with team name if available
          const enrichedPlayer = {
            ...player,
            teamName: teamName || player.teamName || player.team
          };
          
          return (
            <Link 
              to={`/players/${player.id}`} 
              key={player.id}
              className="h-full block"
            >
              <PlayerCard player={enrichedPlayer} showTeamLogo={false} />
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
};

export default TeamPlayersList;
