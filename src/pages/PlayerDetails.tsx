import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, User, Activity, Award } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Player, Match } from "@/utils/models/types";
import { getPlayerById } from "@/utils/database/playersService";
import { getPlayerMatchStats } from "@/utils/database/matches/playerStats";
import { getTeamById } from "@/utils/database/teamsService";
import { toast } from "sonner";

const PlayerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [player, setPlayer] = useState<Player | null>(null);
  const [teamName, setTeamName] = useState<string>("");
  const [matchStats, setMatchStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadPlayerData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        // Get player data
        const playerData = await getPlayerById(id);
        if (!playerData) {
          toast.error("Joueur non trouvé");
          setIsLoading(false);
          return;
        }
        
        console.log("Player data:", playerData);
        setPlayer(playerData);
        
        // Get team name
        if (playerData.team) {
          const team = await getTeamById(playerData.team);
          if (team) {
            setTeamName(team.name);
          }
        }
        
        // Get match statistics
        if (playerData.team) {
          const stats = await getPlayerMatchStats(playerData.team);
          // Filter stats for this player only
          const playerStats = stats.filter(stat => stat.player_id === id);
          console.log("Player match stats:", playerStats);
          setMatchStats(playerStats);
        }
      } catch (error) {
        console.error("Error loading player data:", error);
        toast.error("Erreur lors du chargement des données du joueur");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPlayerData();
  }, [id]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lol-blue"></div>
      </div>
    );
  }
  
  if (!player) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Joueur non trouvé</h2>
          <Link to="/players" className="text-lol-blue hover:underline">
            Retour à la liste des joueurs
          </Link>
        </div>
      </div>
    );
  }
  
  const getRoleColor = (role: string) => {
    switch (role) {
      case "Top": return "bg-yellow-500";
      case "Jungle": return "bg-green-500";
      case "Mid": return "bg-blue-500";
      case "ADC": return "bg-red-500";
      case "Support": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };
  
  const playerKda = typeof player.kda === 'number' ? player.kda : parseFloat(String(player.kda) || '0');
  const playerCsPerMin = typeof player.csPerMin === 'number' ? player.csPerMin : parseFloat(String(player.csPerMin) || '0');
  const playerDamageShare = typeof player.damageShare === 'number' ? player.damageShare : parseFloat(String(player.damageShare) || '0');
  
  const championPool = Array.isArray(player.championPool) 
    ? player.championPool 
    : typeof player.championPool === 'string' 
      ? player.championPool.split(',').map(c => c.trim()).filter(c => c)
      : [];
  
  const calculateAverages = () => {
    if (!matchStats || matchStats.length === 0) return null;
    
    return {
      kills: matchStats.reduce((sum, stat) => sum + (stat.kills || 0), 0) / matchStats.length,
      deaths: matchStats.reduce((sum, stat) => sum + (stat.deaths || 0), 0) / matchStats.length,
      assists: matchStats.reduce((sum, stat) => sum + (stat.assists || 0), 0) / matchStats.length,
      kda: matchStats.reduce((sum, stat) => {
        const kills = stat.kills || 0;
        const deaths = stat.deaths || 0;
        const assists = stat.assists || 0;
        const kda = deaths > 0 ? (kills + assists) / deaths : kills + assists;
        return sum + kda;
      }, 0) / matchStats.length,
      csPerMin: matchStats.reduce((sum, stat) => sum + (stat.cspm || 0), 0) / matchStats.length,
      damageShare: matchStats.reduce((sum, stat) => sum + (stat.damage_share || 0), 0) / matchStats.length,
      visionScore: matchStats.reduce((sum, stat) => sum + (stat.vision_score || 0), 0) / matchStats.length,
      goldShare: matchStats.reduce((sum, stat) => sum + (stat.earned_gold_share || 0), 0) / matchStats.length,
      games: matchStats.length
    };
  };
  
  const averageStats = calculateAverages();
  
  const getChampionStats = () => {
    if (!matchStats || matchStats.length === 0) return [];
    
    const champStats: Record<string, {
      champion: string,
      games: number,
      wins: number,
      kills: number,
      deaths: number,
      assists: number
    }> = {};
    
    matchStats.forEach(stat => {
      if (!stat.champion) return;
      
      if (!champStats[stat.champion]) {
        champStats[stat.champion] = {
          champion: stat.champion,
          games: 0,
          wins: 0,
          kills: 0,
          deaths: 0,
          assists: 0
        };
      }
      
      champStats[stat.champion].games += 1;
      if (stat.winner === player.team || (stat.team_id === player.team && stat.is_winner)) {
        champStats[stat.champion].wins += 1;
      }
      champStats[stat.champion].kills += (stat.kills || 0);
      champStats[stat.champion].deaths += (stat.deaths || 0);
      champStats[stat.champion].assists += (stat.assists || 0);
    });
    
    return Object.values(champStats).sort((a, b) => b.games - a.games);
  };
  
  const championStats = getChampionStats();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <Link
          to="/players"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-lol-blue transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          <span>Retour aux joueurs</span>
        </Link>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl border border-gray-100 shadow-subtle p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center relative">
              <img 
                src={player.image} 
                alt={player.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg";
                }}
              />
              <div className={`absolute bottom-0 left-0 right-0 h-6 ${getRoleColor(player.role)} flex items-center justify-center`}>
                <span className="text-white text-xs font-medium">{player.role}</span>
              </div>
            </div>
            
            <div>
              <h1 className="text-3xl font-bold mb-1">{player.name}</h1>
              <p className="text-gray-600">{teamName}</p>
            </div>
            
            <div className="ml-auto grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex justify-center mb-1">
                  <Activity size={18} className="text-lol-blue" />
                </div>
                <p className="text-2xl font-bold">{playerKda.toFixed(2)}</p>
                <p className="text-xs text-gray-500">KDA</p>
              </div>
              
              <div className="text-center">
                <div className="flex justify-center mb-1">
                  <Trophy size={18} className="text-lol-blue" />
                </div>
                <p className="text-2xl font-bold">{playerCsPerMin.toFixed(1)}</p>
                <p className="text-xs text-gray-500">CS/Min</p>
              </div>
              
              <div className="text-center">
                <div className="flex justify-center mb-1">
                  <Award size={18} className="text-lol-blue" />
                </div>
                <p className="text-2xl font-bold">{Math.round(playerDamageShare * 100)}%</p>
                <p className="text-xs text-gray-500">Damage Share</p>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Tabs defaultValue="overview">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="overview" className="flex-1">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="champions" className="flex-1">Champions</TabsTrigger>
              <TabsTrigger value="matches" className="flex-1">Matchs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="bg-white rounded-xl border border-gray-100 shadow-subtle p-6">
                <h2 className="text-xl font-bold mb-4">Statistiques générales</h2>
                
                {averageStats ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm text-gray-500 mb-2">KDA</h3>
                      <div className="flex justify-between items-baseline">
                        <span className="text-2xl font-bold">{averageStats.kda.toFixed(2)}</span>
                        <span className="text-sm text-gray-600">
                          {averageStats.kills.toFixed(1)} / {averageStats.deaths.toFixed(1)} / {averageStats.assists.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm text-gray-500 mb-2">CS par minute</h3>
                      <div className="flex justify-between items-baseline">
                        <span className="text-2xl font-bold">{averageStats.csPerMin.toFixed(1)}</span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm text-gray-500 mb-2">Part des dégâts</h3>
                      <div className="flex justify-between items-baseline">
                        <span className="text-2xl font-bold">{Math.round(averageStats.damageShare * 100)}%</span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm text-gray-500 mb-2">Vision Score</h3>
                      <div className="flex justify-between items-baseline">
                        <span className="text-2xl font-bold">{Math.round(averageStats.visionScore || 0)}</span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm text-gray-500 mb-2">Part de l'or</h3>
                      <div className="flex justify-between items-baseline">
                        <span className="text-2xl font-bold">{Math.round(averageStats.goldShare * 100)}%</span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm text-gray-500 mb-2">Matchs joués</h3>
                      <div className="flex justify-between items-baseline">
                        <span className="text-2xl font-bold">{averageStats.games}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-6">Aucune statistique de match disponible</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="champions">
              <div className="bg-white rounded-xl border border-gray-100 shadow-subtle p-6">
                <h2 className="text-xl font-bold mb-4">Statistiques par champion</h2>
                
                {championStats.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Champion</TableHead>
                          <TableHead>Parties</TableHead>
                          <TableHead>Victoires</TableHead>
                          <TableHead>KDA</TableHead>
                          <TableHead>K/D/A</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {championStats.map((champ) => {
                          const kda = champ.deaths > 0 
                            ? ((champ.kills + champ.assists) / champ.deaths) 
                            : champ.kills + champ.assists;
                          
                          return (
                            <TableRow key={champ.champion}>
                              <TableCell className="font-medium">{champ.champion}</TableCell>
                              <TableCell>{champ.games}</TableCell>
                              <TableCell>
                                {champ.wins} ({Math.round((champ.wins / champ.games) * 100)}%)
                              </TableCell>
                              <TableCell>{kda.toFixed(2)}</TableCell>
                              <TableCell>
                                {(champ.kills / champ.games).toFixed(1)} / {(champ.deaths / champ.games).toFixed(1)} / {(champ.assists / champ.games).toFixed(1)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-6">Aucune statistique de champion disponible</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="matches">
              <div className="bg-white rounded-xl border border-gray-100 shadow-subtle p-6">
                <h2 className="text-xl font-bold mb-4">Statistiques par match</h2>
                
                {matchStats.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Match</TableHead>
                          <TableHead>Champion</TableHead>
                          <TableHead>K/D/A</TableHead>
                          <TableHead>CS/Min</TableHead>
                          <TableHead>Vision</TableHead>
                          <TableHead>Dégâts</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {matchStats.map((stat, index) => (
                          <TableRow key={stat.id || index}>
                            <TableCell className="font-medium">
                              {stat.match_id ? (
                                <Link to={`/matches/${stat.match_id}`} className="text-lol-blue hover:underline">
                                  {stat.match_id.substring(0, 8)}...
                                </Link>
                              ) : "N/A"}
                            </TableCell>
                            <TableCell>{stat.champion || "N/A"}</TableCell>
                            <TableCell>
                              {stat.kills || 0}/{stat.deaths || 0}/{stat.assists || 0}
                            </TableCell>
                            <TableCell>{stat.cspm ? stat.cspm.toFixed(1) : "N/A"}</TableCell>
                            <TableCell>{stat.vision_score || "N/A"}</TableCell>
                            <TableCell>
                              {stat.damage_share ? `${Math.round(stat.damage_share * 100)}%` : "N/A"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-6">Aucune statistique de match disponible</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default PlayerDetails;
