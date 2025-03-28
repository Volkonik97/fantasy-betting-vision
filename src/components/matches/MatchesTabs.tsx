
import React from "react";
import { motion } from "framer-motion";
import { Match } from "@/utils/models/types";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import MatchCard from "@/components/match-card/MatchCard";
import MatchesPagination from "./MatchesPagination";

interface MatchesTabsProps {
  upcomingMatches: Match[];
  liveMatches: Match[];
  completedMatches: Match[];
  currentPage: number;
  matchesPerPage: number;
  onPageChange: (page: number) => void;
  onTabChange: () => void;
}

const MatchesTabs = ({
  upcomingMatches,
  liveMatches,
  completedMatches,
  currentPage,
  matchesPerPage,
  onPageChange,
  onTabChange,
}: MatchesTabsProps) => {
  
  // Get current matches for pagination
  const getMatchesForCurrentTab = (matches: Match[]) => {
    const indexOfLastMatch = currentPage * matchesPerPage;
    const indexOfFirstMatch = indexOfLastMatch - matchesPerPage;
    return matches.slice(indexOfFirstMatch, indexOfLastMatch);
  };
  
  // Calculate total pages for the current tab
  const getPageCount = (matches: Match[]) => {
    return Math.ceil(matches.length / matchesPerPage);
  };
  
  return (
    <Tabs defaultValue="upcoming" className="mb-8" onValueChange={onTabChange}>
      <TabsList className="mb-6">
        <TabsTrigger value="upcoming">
          Upcoming ({upcomingMatches.length})
        </TabsTrigger>
        <TabsTrigger value="live">
          Live ({liveMatches.length})
        </TabsTrigger>
        <TabsTrigger value="completed">
          Completed ({completedMatches.length})
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="upcoming">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {getMatchesForCurrentTab(upcomingMatches).length > 0 ? (
            getMatchesForCurrentTab(upcomingMatches).map((match) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <MatchCard match={match} />
              </motion.div>
            ))
          ) : (
            <p className="text-gray-500 col-span-2 text-center py-10">
              No upcoming matches found for the selected filters.
            </p>
          )}
        </div>
        <MatchesPagination 
          currentPage={currentPage}
          pageCount={getPageCount(upcomingMatches)}
          onPageChange={onPageChange}
        />
      </TabsContent>
      
      <TabsContent value="live">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {getMatchesForCurrentTab(liveMatches).length > 0 ? (
            getMatchesForCurrentTab(liveMatches).map((match) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <MatchCard match={match} />
              </motion.div>
            ))
          ) : (
            <p className="text-gray-500 col-span-2 text-center py-10">
              No live matches at the moment.
            </p>
          )}
        </div>
        <MatchesPagination 
          currentPage={currentPage}
          pageCount={getPageCount(liveMatches)}
          onPageChange={onPageChange}
        />
      </TabsContent>
      
      <TabsContent value="completed">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {getMatchesForCurrentTab(completedMatches).length > 0 ? (
            getMatchesForCurrentTab(completedMatches).map((match) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <MatchCard match={match} />
              </motion.div>
            ))
          ) : (
            <p className="text-gray-500 col-span-2 text-center py-10">
              No completed matches found for the selected filters.
            </p>
          )}
        </div>
        <MatchesPagination 
          currentPage={currentPage}
          pageCount={getPageCount(completedMatches)}
          onPageChange={onPageChange}
        />
      </TabsContent>
    </Tabs>
  );
};

export default MatchesTabs;
