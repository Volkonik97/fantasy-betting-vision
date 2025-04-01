
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Player } from "@/utils/models/types";
import PlayerCard from "@/components/PlayerCard";

interface TeamPlayersListProps {
  players: Player[];
  teamName?: string;
}

const TeamPlayersList = ({ players, teamName }: TeamPlayersListProps) => {
  // Sort players by role in the standard order: Top, Jungle, Mid, ADC, Support
  const sortedPlayers = [...players].sort((a, b) => {
    const roleOrder: Record<string, number> = {
      'Top': 0,
      'Jungle': 1, 
      'Mid': 2,
      'ADC': 3,
      'Support': 4
    };
    
    // Normalize role names for consistent sorting
    const normalizeRoleForSort = (role: string): string => {
      const normalizedRole = role.toLowerCase().trim();
      // Use the exact same normalization logic as in modelConverter.ts to ensure consistency
      if (normalizedRole === 'top') return 'Top';
      if (['jungle', 'jng', 'jgl', 'jg'].includes(normalizedRole)) return 'Jungle';
      if (['mid', 'middle'].includes(normalizedRole)) return 'Mid';
      if (['adc', 'bot', 'bottom', 'carry'].includes(normalizedRole)) return 'ADC';
      if (['support', 'sup', 'supp'].includes(normalizedRole)) return 'Support';
      return 'Mid'; // Default to Mid if role is unknown
    };
    
    const roleA = normalizeRoleForSort(a.role);
    const roleB = normalizeRoleForSort(b.role);
    
    return (roleOrder[roleA] || 99) - (roleOrder[roleB] || 99);
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="mt-8"
    >
      <h2 className="text-2xl font-bold mb-4">Joueurs ({players.length})</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {sortedPlayers.length > 0 ? (
          sortedPlayers.map(player => {
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
                <PlayerCard player={enrichedPlayer} />
              </Link>
            );
          })
        ) : (
          <p className="col-span-full text-gray-500 text-center py-8">
            Aucun joueur trouvé pour cette équipe
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default TeamPlayersList;
