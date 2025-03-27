
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getMatches } from "@/utils/csvService";
import { getSideStatistics } from "@/utils/statistics"; // Updated import path
import { Match, SideStatistics } from "@/utils/models/types";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Import our components
import MatchHeader from "@/components/match/MatchHeader";
import MatchTeams from "@/components/match/MatchTeams";
import MatchPrediction from "@/components/match/MatchPrediction";
import MatchResults from "@/components/match/MatchResults";
import MatchKeyFactors from "@/components/match/MatchKeyFactors";
import TeamAnalysisTabs from "@/components/match/TeamAnalysisTabs";

const MatchDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [match, setMatch] = useState<Match | null>(null);
  
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [blueTeamStats, setBlueTeamStats] = useState<SideStatistics | null>(null);
  const [redTeamStats, setRedTeamStats] = useState<SideStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadMatchData = async () => {
      setIsLoading(true);
      try {
        // Load match from database
        const matches = await getMatches();
        const foundMatch = matches.find(m => m.id === id);
        
        if (!foundMatch) {
          toast.error("Match not found");
          setIsLoading(false);
          return;
        }
        
        setMatch(foundMatch);
        
        // Load team stats
        try {
          const blue = await getSideStatistics(foundMatch.teamBlue.id);
          const red = await getSideStatistics(foundMatch.teamRed.id);
          
          // Add team IDs to the stats objects
          const blueWithId: SideStatistics = {
            ...blue,
            teamId: foundMatch.teamBlue.id
          };
          
          const redWithId: SideStatistics = {
            ...red,
            teamId: foundMatch.teamRed.id
          };
          
          setBlueTeamStats(blueWithId);
          setRedTeamStats(redWithId);
        } catch (statsError) {
          console.error("Error loading team statistics:", statsError);
          // Continue without team stats
        }
      } catch (error) {
        console.error("Error loading match data:", error);
        toast.error("Failed to load match details");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      loadMatchData();
    }
  }, [id]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lol-blue"></div>
      </div>
    );
  }
  
  if (!match) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Match Not Found</h2>
          <Button onClick={() => navigate('/matches')}>
            Back to Matches
          </Button>
        </div>
      </div>
    );
  }
  
  const matchDate = new Date(match.date);
  
  const handleTeamSelect = (teamId: string) => {
    setSelectedTeam(teamId === selectedTeam ? null : teamId);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <MatchHeader matchDate={matchDate} tournament={match.tournament} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-subtle p-6"
            >
              <MatchTeams 
                match={match} 
                selectedTeam={selectedTeam} 
                onTeamSelect={handleTeamSelect} 
              />
              
              <MatchPrediction match={match} />
              
              <MatchResults match={match} />
              
              <MatchKeyFactors match={match} />
            </motion.div>
          </div>
          
          <div>
            <TeamAnalysisTabs 
              blueTeamStats={blueTeamStats} 
              redTeamStats={redTeamStats} 
              isLoading={isLoading} 
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MatchDetails;
