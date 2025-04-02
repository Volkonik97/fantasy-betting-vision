
import React, { useEffect, useState } from "react";
import { Player } from "@/utils/models/types";
import { getPlayersByTeamId } from "@/utils/database/playersService";
import TeamPlayersList from "./TeamPlayersList";
import { toast } from "sonner";

interface TeamRosterProps {
  players: Player[];
  teamName: string;
  teamId: string;
}

const TeamRoster = ({ players, teamName, teamId }: TeamRosterProps) => {
  const [teamPlayers, setTeamPlayers] = useState<Player[]>(players);
  
  console.log(`TeamRoster - Initial players for ${teamName}: ${players.length}`);
  console.log(`TeamRoster - TeamID: ${teamId}`);
  
  useEffect(() => {
    const loadPlayersDirectly = async () => {
      if (players.length === 0 && teamId) {
        try {
          console.log(`Fetching players for team ${teamId} (${teamName}) directly from database`);
          const directPlayers = await getPlayersByTeamId(teamId);
          if (directPlayers.length > 0) {
            console.log(`Found ${directPlayers.length} players for team ${teamName} from database`);
            setTeamPlayers(directPlayers);
          } else {
            console.log(`No players found for team ${teamName} from direct database query`);
          }
        } catch (error) {
          console.error(`Error fetching players for team ${teamName}:`, error);
        }
      }
    };
    
    loadPlayersDirectly();
  }, [teamId, teamName, players.length]);
  
  useEffect(() => {
    // Update local state if parent provides players
    if (players.length > 0) {
      setTeamPlayers(players);
    }
  }, [players]);
  
  return <TeamPlayersList players={teamPlayers} teamName={teamName} />;
};

export default TeamRoster;
