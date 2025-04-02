
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Team, Match, SideStatistics, Player } from "@/utils/models/types";
import Navbar from "@/components/Navbar";
import { getTeamById } from "@/utils/database/teamsService";
import { getMatchesByTeamId, clearMatchCache } from "@/utils/database/matchesService";
import { getSideStatistics } from "@/utils/statistics/sideStatistics";
import { getTeamTimelineStats } from "@/utils/database/matches/playerStats";
import { toast } from "sonner";
import TeamHeader from "@/components/team/TeamHeader";
import TeamPlayersList from "@/components/team/TeamPlayersList";
import TeamRecentMatches from "@/components/team/TeamRecentMatches";
import TeamStatistics from "@/components/TeamStatistics";
import { checkTeamPlayerLinks } from "@/utils/database/diagnosis";

const TeamDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [team, setTeam] = useState<Team | null>(null);
  const [teamMatches, setTeamMatches] = useState<Match[]>([]);
  const [sideStats, setSideStats] = useState<SideStatistics | null>(null);
  const [timelineStats, setTimelineStats] = useState<any>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isPlayersLoading, setIsPlayersLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTeamData = async () => {
      if (!id) {
        setError("ID d'équipe manquant");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setIsPlayersLoading(true);
        setError(null);

        console.log(`Chargement des données pour l'équipe ID: ${id}`);

        const diagnosticResult = await checkTeamPlayerLinks(id);
        console.log("Résultat du diagnostic :", diagnosticResult);

        const foundTeam = await getTeamById(id);
        if (!foundTeam) {
          setError("Équipe non trouvée");
          setIsLoading(false);
          return;
        }

        const sideStatsData = await getSideStatistics(id);
        if (sideStatsData) {
          Object.assign(foundTeam, sideStatsData);
        }

        setTeam({ ...foundTeam }); // nouvelle référence
        setPlayers(foundTeam.players || []);
        setSideStats(sideStatsData);

        await clearMatchCache();

        const [teamMatchesArray, timelineData] = await Promise.all([
          getMatchesByTeamId(id),
          getTeamTimelineStats(id)
        ]);

        const sortedMatches = [...teamMatchesArray].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setTeamMatches(sortedMatches);
        setTimelineStats(timelineData);
      } catch (err) {
        console.error("Erreur lors du chargement des données d'équipe :", err);
        setError("Erreur lors du chargement des données d'équipe");
        toast.error("Échec du chargement des détails de l'équipe");
      } finally {
        setIsPlayersLoading(false);
        setIsLoading(false);
      }
    };

    loadTeamData();
  }, [id]);

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate("/teams");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lol-blue"></div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{error || "Équipe non trouvée"}</h2>
          <Link to="/teams" className="text-lol-blue hover:underline">
            Retour à la liste des équipes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <a
          href="/teams"
          onClick={handleBackClick}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-lol-blue transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          <span>Retour aux équipes</span>
        </a>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <TeamHeader team={team} />
        </motion.div>

        {players.length === 0 && !isPlayersLoading && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Aucun joueur trouvé pour cette équipe. Vérifiez si les données ont été correctement importées.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {isPlayersLoading ? (
                <p className="text-center text-gray-500">Chargement des joueurs...</p>
              ) : (
                <TeamPlayersList
                  key={players.length}
                  players={players}
                  teamName={team.name}
                  teamRegion={team.region}
                />
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <TeamRecentMatches team={team} matches={teamMatches} />
            </motion.div>
          </div>

          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <TeamStatistics team={team} timelineStats={timelineStats} />
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeamDetails;
