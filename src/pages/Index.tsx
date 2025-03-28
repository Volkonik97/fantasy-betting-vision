
import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import MatchCard from "@/components/MatchCard";
import { matches, teams, tournaments } from "@/utils/models";
import { motion } from "framer-motion";

const Index = () => {
  // Mock data - replace with actual data fetching later
  const upcomingMatches = matches.filter(match => match.status === "Upcoming").slice(0, 3);
  const recentMatches = matches.filter(match => match.status === "Completed").slice(0, 3);
  const topTeams = teams.slice(0, 5);
  const nextTournament = tournaments[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-4">
            League of Legends Esports Dashboard
          </h1>
          <p className="text-gray-600">
            Stay up to date with the latest matches, team standings, and tournament results.
          </p>
        </motion.div>

        <section className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Upcoming Matches</h2>
            <Link
              to="/matches"
              className="text-lol-blue hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <span>See All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {upcomingMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>

        <section className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Top Teams</h2>
            <Link
              to="/teams"
              className="text-lol-blue hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {topTeams.map((team) => (
              <Link
                key={team.id}
                to={`/teams/${team.id}`}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200"
              >
                <h3 className="font-medium text-lg">{team.name}</h3>
                <p className="text-sm text-gray-500">{team.region}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Matchs précédents</h2>
            <Link 
              to="/matches" 
              className="text-lol-blue hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <span>Voir tous</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {recentMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Next Tournament</h2>
            <Link
              to="/tournaments"
              className="text-lol-blue hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <span>More Info</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-medium mb-2">{nextTournament.name}</h3>
            <p className="text-gray-600">
              {nextTournament.region}, {nextTournament.startDate} - {nextTournament.endDate}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
