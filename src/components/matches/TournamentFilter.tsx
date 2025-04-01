
import React, { useEffect, useState } from "react";
import { Tournament } from "@/utils/models/types";
import { getTournaments } from "@/utils/database/services/tournamentService";

interface TournamentFilterProps {
  tournaments: Tournament[];
  selectedTournament: string;
  onTournamentChange: (tournament: string) => void;
}

const TournamentFilter = ({
  tournaments,
  selectedTournament,
  onTournamentChange,
}: TournamentFilterProps) => {
  const [allTournaments, setAllTournaments] = useState<Tournament[]>(tournaments);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAllTournaments = async () => {
      try {
        setLoading(true);
        const dbTournaments = await getTournaments();
        if (dbTournaments && dbTournaments.length > 0) {
          // Combine with provided tournaments and deduplicate by id
          const combinedTournaments = [...tournaments];
          dbTournaments.forEach(dbTournament => {
            if (!combinedTournaments.some(t => t.id === dbTournament.id)) {
              combinedTournaments.push(dbTournament);
            }
          });
          setAllTournaments(combinedTournaments);
        }
      } catch (error) {
        console.error("Error fetching tournaments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllTournaments();
  }, [tournaments]);

  return (
    <div className="mb-8 overflow-x-auto">
      <div className="flex flex-nowrap gap-3 pb-2">
        <button
          onClick={() => onTournamentChange("All")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
            selectedTournament === "All"
              ? "bg-lol-blue text-white"
              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          All Tournaments
        </button>
        
        {loading ? (
          <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
        ) : (
          allTournaments.map(tournament => (
            <button
              key={tournament.id}
              onClick={() => onTournamentChange(tournament.name)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                selectedTournament === tournament.name
                  ? "bg-lol-blue text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {tournament.name}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default TournamentFilter;
