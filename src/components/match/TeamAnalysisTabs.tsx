
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SideAnalysis from "@/components/SideAnalysis";
import { SideStatistics } from "@/utils/models/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TeamAnalysisTabsProps {
  blueTeamStats: SideStatistics | null;
  redTeamStats: SideStatistics | null;
  isLoading: boolean;
}

const TeamAnalysisTabs = ({ blueTeamStats, redTeamStats, isLoading }: TeamAnalysisTabsProps) => {
  const [isLoadingData, setIsLoadingData] = useState(isLoading);
  const [blueTeamDynamicStats, setBlueTeamDynamicStats] = useState<SideStatistics | null>(blueTeamStats);
  const [redTeamDynamicStats, setRedTeamDynamicStats] = useState<SideStatistics | null>(redTeamStats);

  // Function to get player match statistics and calculate team stats
  const getTeamPlayerStats = async (teamId: string | undefined) => {
    if (!teamId) return null;
    
    console.log(`Fetching player match stats for team ${teamId}`);
    
    try {
      // Get matches for this team
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .or(`team_blue_id.eq.${teamId},team_red_id.eq.${teamId}`);
        
      if (matchesError) {
        console.error("Error fetching matches:", matchesError);
        return null;
      }
      
      console.log(`Found ${matchesData?.length || 0} matches for team ${teamId}`);
      
      if (!matchesData || matchesData.length === 0) {
        return null;
      }
      
      // Get match IDs
      const matchIds = matchesData.map(match => match.id);
      
      // Get player match stats for these matches
      const { data: playerStatsData, error: statsError } = await supabase
        .from('player_match_stats')
        .select('*')
        .eq('team_id', teamId)
        .in('match_id', matchIds);
        
      if (statsError) {
        console.error("Error fetching player stats:", statsError);
        return null;
      }
      
      console.log(`Found ${playerStatsData?.length || 0} player stats entries for team ${teamId}`);
      
      if (!playerStatsData || playerStatsData.length === 0) {
        return null;
      }
      
      // Calculate team statistics from player data
      const blueMatches = matchesData.filter(m => m.team_blue_id === teamId);
      const redMatches = matchesData.filter(m => m.team_red_id === teamId);
      
      const blueMatchCount = blueMatches.length;
      const redMatchCount = redMatches.length;
      
      console.log(`Team ${teamId} played ${blueMatchCount} matches on blue side and ${redMatchCount} matches on red side`);
      
      // Calculate win rates
      const blueWins = blueMatches.filter(m => m.winner_team_id === teamId).length;
      const redWins = redMatches.filter(m => m.winner_team_id === teamId).length;
      
      const blueWinRate = blueMatchCount > 0 ? Math.round((blueWins / blueMatchCount) * 100) : 0;
      const redWinRate = redMatchCount > 0 ? Math.round((redWins / redMatchCount) * 100) : 0;
      
      // Calculate first objectives
      const blueFirstBlood = calculatePercentage(
        blueMatches.filter(m => m.first_blood === teamId).length, 
        blueMatchCount
      );
      const redFirstBlood = calculatePercentage(
        redMatches.filter(m => m.first_blood === teamId).length, 
        redMatchCount
      );
      
      const blueFirstDragon = calculatePercentage(
        blueMatches.filter(m => m.first_dragon === teamId).length, 
        blueMatchCount
      );
      const redFirstDragon = calculatePercentage(
        redMatches.filter(m => m.first_dragon === teamId).length, 
        redMatchCount
      );
      
      const blueFirstHerald = calculatePercentage(
        blueMatches.filter(m => m.first_herald === teamId).length, 
        blueMatchCount
      );
      const redFirstHerald = calculatePercentage(
        redMatches.filter(m => m.first_herald === teamId).length, 
        redMatchCount
      );
      
      const blueFirstTower = calculatePercentage(
        blueMatches.filter(m => m.first_tower === teamId).length, 
        blueMatchCount
      );
      const redFirstTower = calculatePercentage(
        redMatches.filter(m => m.first_tower === teamId).length, 
        redMatchCount
      );
      
      // Calculate timeline stats from player data
      const timelineStats = calculateTimelineStats(playerStatsData);
      
      return {
        blueWins: blueWinRate,
        redWins: redWinRate,
        blueFirstBlood,
        redFirstBlood,
        blueFirstDragon,
        redFirstDragon,
        blueFirstHerald,
        redFirstHerald,
        blueFirstTower,
        redFirstTower,
        timelineStats
      };
    } catch (error) {
      console.error("Error calculating team stats:", error);
      return null;
    }
  };

  // Helper function to calculate percentage
  const calculatePercentage = (value: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  // Calculate timeline stats from player data
  const calculateTimelineStats = (playerStats: any[]) => {
    if (!playerStats || playerStats.length === 0) return null;
    
    // Group stats by time points
    const timePoints = ['10', '15', '20', '25'];
    const result: any = {};
    
    timePoints.forEach(time => {
      const goldKey = `gold_at_${time}`;
      const xpKey = `xp_at_${time}`;
      const csKey = `cs_at_${time}`;
      const goldDiffKey = `gold_diff_at_${time}`;
      const killsKey = `kills_at_${time}`;
      const deathsKey = `deaths_at_${time}`;
      
      // Filter out null values and calculate averages
      const goldValues = playerStats.filter(s => s[goldKey] !== null).map(s => s[goldKey]);
      const xpValues = playerStats.filter(s => s[xpKey] !== null).map(s => s[xpKey]);
      const csValues = playerStats.filter(s => s[csKey] !== null).map(s => s[csKey]);
      const goldDiffValues = playerStats.filter(s => s[goldDiffKey] !== null).map(s => s[goldDiffKey]);
      const killsValues = playerStats.filter(s => s[killsKey] !== null).map(s => s[killsKey]);
      const deathsValues = playerStats.filter(s => s[deathsKey] !== null).map(s => s[deathsKey]);
      
      console.log(`Timeline ${time}min data points:`, {
        gold: goldValues.length,
        xp: xpValues.length,
        cs: csValues.length,
        goldDiff: goldDiffValues.length,
        kills: killsValues.length,
        deaths: deathsValues.length
      });
      
      const avgGold = calculateAverage(goldValues);
      const avgXp = calculateAverage(xpValues);
      const avgCs = calculateAverage(csValues);
      const avgGoldDiff = calculateAverage(goldDiffValues);
      const avgKills = calculateAverage(killsValues, 1);
      const avgDeaths = calculateAverage(deathsValues, 1);
      
      result[time] = {
        avgGold: Math.round(avgGold),
        avgXp: Math.round(avgXp),
        avgCs: Math.round(avgCs),
        avgGoldDiff: Math.round(avgGoldDiff),
        avgKills: Math.round(avgKills * 10) / 10, // One decimal place
        avgDeaths: Math.round(avgDeaths * 10) / 10 // One decimal place
      };
    });
    
    return result;
  };

  // Helper function to calculate average with fallback value
  const calculateAverage = (values: number[], decimalPlaces = 0): number => {
    if (!values || values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    const avg = sum / values.length;
    
    if (decimalPlaces > 0) {
      const multiplier = Math.pow(10, decimalPlaces);
      return Math.round(avg * multiplier) / multiplier;
    }
    
    return avg;
  };
  
  // Load team stats when component mounts
  useEffect(() => {
    const loadTeamStats = async () => {
      setIsLoadingData(true);
      
      try {
        // Get blue team ID and red team ID from props
        const blueTeamId = blueTeamStats?.teamId;
        const redTeamId = redTeamStats?.teamId;
        
        console.log("Loading dynamic team stats for:", { blueTeamId, redTeamId });
        
        // If we have blue team stats in props, get detailed player stats
        if (blueTeamId) {
          const dynamicBlueStats = await getTeamPlayerStats(blueTeamId);
          
          if (dynamicBlueStats) {
            console.log("Dynamic blue team stats loaded:", dynamicBlueStats);
            setBlueTeamDynamicStats({
              ...dynamicBlueStats,
              teamId: blueTeamId
            });
          } else {
            console.log("Using fallback blue team stats");
            setBlueTeamDynamicStats(blueTeamStats);
          }
        }
        
        // If we have red team stats in props, get detailed player stats
        if (redTeamId) {
          const dynamicRedStats = await getTeamPlayerStats(redTeamId);
          
          if (dynamicRedStats) {
            console.log("Dynamic red team stats loaded:", dynamicRedStats);
            setRedTeamDynamicStats({
              ...dynamicRedStats,
              teamId: redTeamId
            });
          } else {
            console.log("Using fallback red team stats");
            setRedTeamDynamicStats(redTeamStats);
          }
        }
      } catch (error) {
        console.error("Error loading dynamic team stats:", error);
        toast.error("Failed to load team statistics");
        
        // Fallback to props
        setBlueTeamDynamicStats(blueTeamStats);
        setRedTeamDynamicStats(redTeamStats);
      } finally {
        setIsLoadingData(false);
      }
    };
    
    loadTeamStats();
  }, [blueTeamStats, redTeamStats]);
  
  // Debug logging
  useEffect(() => {
    console.log("TeamAnalysisTabs rendering:", { 
      isLoadingData, 
      blueTeamDynamicStats: !!blueTeamDynamicStats, 
      redTeamDynamicStats: !!redTeamDynamicStats,
      originalBlueTeamStats: !!blueTeamStats,
      originalRedTeamStats: !!redTeamStats
    });
    
    if (blueTeamDynamicStats) {
      console.log("Blue team dynamic stats sample:", {
        blueWins: blueTeamDynamicStats.blueWins,
        redWins: blueTeamDynamicStats.redWins,
        blueFirstBlood: blueTeamDynamicStats.blueFirstBlood,
        hasTimeline: !!blueTeamDynamicStats.timelineStats
      });
    }
    
    if (redTeamDynamicStats) {
      console.log("Red team dynamic stats sample:", {
        blueWins: redTeamDynamicStats.blueWins,
        redWins: redTeamDynamicStats.redWins,
        redFirstBlood: redTeamDynamicStats.redFirstBlood,
        hasTimeline: !!redTeamDynamicStats.timelineStats
      });
    }
  }, [blueTeamDynamicStats, redTeamDynamicStats, isLoadingData, blueTeamStats, redTeamStats]);
  
  const renderTeamStats = (teamStats: SideStatistics | null, tabValue: string) => {
    if (isLoadingData) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lol-blue"></div>
        </div>
      );
    }
    
    if (!teamStats) {
      return (
        <div className="text-center p-8 bg-white rounded-xl border border-gray-100 shadow-subtle">
          <p className="text-gray-500">No statistics available</p>
        </div>
      );
    }
    
    return <SideAnalysis statistics={teamStats} />;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Tabs defaultValue="blueTeam">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="blueTeam" className="w-1/2">Blue Side</TabsTrigger>
          <TabsTrigger value="redTeam" className="w-1/2">Red Side</TabsTrigger>
        </TabsList>
        
        <TabsContent value="blueTeam">
          {renderTeamStats(blueTeamDynamicStats, "blueTeam")}
        </TabsContent>
        
        <TabsContent value="redTeam">
          {renderTeamStats(redTeamDynamicStats, "redTeam")}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default TeamAnalysisTabs;
