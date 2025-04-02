
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Player } from "@/utils/models/types";
import PlayerCard from "@/components/PlayerCard";
import { normalizeRoleName } from "@/utils/leagueData/assembler/modelConverter";

interface TeamPlayersListProps {
  players: Player[];
  teamName?: string;
}

const TeamPlayersList = ({ players, teamName }: TeamPlayersListProps) => {
  // Vérifier si nous avons des données de joueurs
  const hasPlayers = Array.isArray(players) && players.length > 0;
  
  // Si aucun joueur n'est disponible, afficher un message
  if (!hasPlayers) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-8 bg-white rounded-xl shadow-subtle p-6 border border-gray-100"
      >
        <h2 className="text-2xl font-bold mb-4">Joueurs (0)</h2>
        <p className="text-gray-500 text-center py-8">
          Aucun joueur trouvé pour cette équipe
        </p>
      </motion.div>
    );
  }
  
  // Définir l'ordre des rôles pour le tri
  const roleOrder: Record<string, number> = {
    'Top': 0,
    'Jungle': 1,
    'Mid': 2,
    'ADC': 3,
    'Support': 4
  };
  
  // Fonction pour obtenir la valeur de tri pour un rôle
  const getRoleValue = (role: string): number => {
    const normalizedRole = normalizeRoleName(role);
    return roleOrder[normalizedRole] !== undefined ? roleOrder[normalizedRole] : 99;
  };
  
  // Trier les joueurs par rôle selon l'ordre standard
  const sortedPlayers = [...players].sort((a, b) => 
    getRoleValue(a.role) - getRoleValue(b.role)
  );
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-8 bg-white rounded-xl shadow-subtle p-6 border border-gray-100"
    >
      <h2 className="text-2xl font-bold mb-4">Joueurs ({sortedPlayers.length})</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {sortedPlayers.map((player) => {
          // Enrichir le joueur avec le nom de l'équipe si disponible
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
