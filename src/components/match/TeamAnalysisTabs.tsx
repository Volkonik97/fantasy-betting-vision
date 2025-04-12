import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import StatsComparisonChart from "./StatsComparisonChart";
import ObjectiveStats from "./ObjectiveStats";
import TimelineChart from "./TimelineChart";
import { Match, Team, TimelineStats } from "@/utils/models/types";
import { useTeamStats } from "@/hooks/useTeamStats";

interface TeamAnalysisTabsProps {
  match: Match;
  selectedTeam: string;
  opponent: string;
}

const TeamAnalysisTabs = ({ match, selectedTeam, opponent }: TeamAnalysisTabsProps) => {
  const { stats: teamStats, isLoading: isTeamStatsLoading } = useTeamStats(selectedTeam);
  const { stats: opponentStats, isLoading: isOpponentStatsLoading } = useTeamStats(opponent);

  const isLoading = isTeamStatsLoading || isOpponentStatsLoading;
  
  // Find the selected team details
  const teamDetails = match.teamBlue.id === selectedTeam ? match.teamBlue : match.teamRed;
  const opponentDetails = match.teamBlue.id === opponent ? match.teamBlue : match.teamRed;
  
  // Default values if stats are not available
  const defaultTimelineStats: TimelineStats = {
    '10': {
      avgGold: 0,
      avgXp: 0,
      avgCs: 0,
      avgGoldDiff: 0,
      avgCsDiff: 0,
      avgKills: 0,
      avgDeaths: 0,
      avgAssists: 0
    },
    '15': {
      avgGold: 0,
      avgXp: 0,
      avgCs: 0,
      avgGoldDiff: 0,
      avgCsDiff: 0,
      avgKills: 0,
      avgDeaths: 0,
      avgAssists: 0
    }
  };
  
  // Convert any timeline stats data to the correct format if needed
  const getTimelineStats = (stats: any): TimelineStats => {
    if (!stats || !stats.timelineStats) return defaultTimelineStats;
    
    // If it's already a TimelineStats object, use it
    if (typeof stats.timelineStats === 'object' && !Array.isArray(stats.timelineStats)) {
      return stats.timelineStats as TimelineStats;
    }
    
    // Otherwise, convert from array or other format to TimelineStats
    return defaultTimelineStats;
  };
  
  const teamTimelineStats = getTimelineStats(teamStats);
  const opponentTimelineStats = getTimelineStats(opponentStats);
  
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
        <TabsTrigger value="objectives">Objectifs</TabsTrigger>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview">
        <Card>
          <CardHeader>
            <CardTitle>Comparaison des équipes</CardTitle>
            <CardDescription>
              Statistiques globales des deux équipes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-48 flex items-center justify-center">
                <p className="text-gray-500">Chargement des statistiques...</p>
              </div>
            ) : (
              <StatsComparisonChart 
                teamName={teamDetails.name} 
                opponentName={opponentDetails.name}
                teamStats={teamStats}
                opponentStats={opponentStats}
              />
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="objectives">
        <Card>
          <CardHeader>
            <CardTitle>Statistiques d'objectifs</CardTitle>
            <CardDescription>
              Taux de premier sang, premier dragon, etc.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-48 flex items-center justify-center">
                <p className="text-gray-500">Chargement des statistiques...</p>
              </div>
            ) : (
              <ObjectiveStats 
                teamName={teamDetails.name}
                opponentName={opponentDetails.name}
                teamStats={teamStats}
                opponentStats={opponentStats}
              />
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="timeline">
        <Card>
          <CardHeader>
            <CardTitle>Progression dans le temps</CardTitle>
            <CardDescription>
              Or, XP et CS à différents moments de la partie
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-48 flex items-center justify-center">
                <p className="text-gray-500">Chargement des statistiques...</p>
              </div>
            ) : (
              <TimelineChart 
                teamName={teamDetails.name}
                opponentName={opponentDetails.name}
                teamTimelineStats={teamTimelineStats}
                opponentTimelineStats={opponentTimelineStats}
              />
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default TeamAnalysisTabs;
