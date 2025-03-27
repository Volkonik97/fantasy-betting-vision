
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MatchCard from "@/components/MatchCard";
import TeamStatistics from "@/components/TeamStatistics";
import PredictionChart from "@/components/PredictionChart";
import PlayerCard from "@/components/PlayerCard";
import SearchBar from "@/components/SearchBar";
import SideAnalysis from "@/components/SideAnalysis";
import { matches, teams } from "@/utils/models";
import { getSideStatistics } from "@/utils/models/statistics";
import { SideStatistics } from "@/utils/models/types";

const Index = () => {
  const [analysisTarget, setAnalysisTarget] = useState(null);
  const [sideStats, setSideStats] = useState<SideStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadSideStats = async () => {
      setIsLoading(true);
      try {
        if (teams && teams.length > 0) {
          const stats = await getSideStatistics(teams[0].id);
          setSideStats(stats);
        }
      } catch (error) {
        console.error("Error loading side statistics:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSideStats();
  }, []);
  
  const handleStartAnalysis = () => {
    const analysisSection = document.getElementById("analysis-section");
    analysisSection?.scrollIntoView({ behavior: "smooth" });
  };
  
  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
    // Would implement search functionality here
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Navbar />
      
      <HeroSection onStartAnalysis={handleStartAnalysis} />
      
      <section id="analysis-section" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-sm font-medium text-lol-blue mb-3">
              Expert Analysis
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Match Predictions & Team Analysis
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Leverage our advanced statistical models to make informed decisions for your esports betting
            </p>
          </motion.div>
          
          <div className="mb-8">
            <SearchBar onSearch={handleSearch} />
          </div>
          
          <div className="mb-16">
            <h3 className="text-xl font-semibold mb-6">Upcoming Matches</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {matches.map((match) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <MatchCard match={match} />
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="md:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <TeamStatistics team={teams[0]} />
              </motion.div>
            </div>
            
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <PredictionChart 
                  blueWinRate={matches[0].blueWinOdds * 100}
                  redWinRate={matches[0].redWinOdds * 100}
                  teamBlueName={matches[0].teamBlue.name}
                  teamRedName={matches[0].teamRed.name}
                />
              </motion.div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="h-full">
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lol-blue"></div>
                  </div>
                ) : sideStats ? (
                  <SideAnalysis statistics={sideStats} />
                ) : (
                  <div className="text-center p-8 bg-white rounded-xl border border-gray-100 shadow-subtle">
                    <p className="text-gray-500">No statistics available</p>
                  </div>
                )}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl border border-gray-100 shadow-subtle p-4"
            >
              <h3 className="text-lg font-medium mb-4">Betting Opportunities</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-lol-blue">Value Bet Detected</span>
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">+156%</span>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3">
                    Statistical model suggests T1 has a 58% chance to win, but bookmakers are offering odds equivalent to 41%.
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white rounded-full p-1">
                        <img 
                          src={teams[0].logo} 
                          alt={teams[0].name} 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span className="text-sm font-medium">{teams[0].name}</span>
                    </div>
                    
                    <span className="font-bold text-green-600">+2.45</span>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700 mb-3">
                    Blue side teams with first dragon control have won 68% of matches in the current meta.
                  </p>
                  
                  <div className="text-xs font-medium text-gray-500">
                    RECOMMENDED BETTING STRATEGY
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-purple-700">Meta Insight</span>
                    <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full">New</span>
                  </div>
                  
                  <p className="text-sm text-gray-700">
                    Teams with top lane priority are winning 63% of matches following patch 13.20.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Top Players</h3>
              <button className="text-sm text-lol-blue hover:underline">View All</button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams[0].players.slice(0, 3).map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <PlayerCard player={player} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      <footer className="bg-white border-t border-gray-200 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-gradient-to-br from-lol-blue to-lol-steel flex items-center justify-center">
                  <span className="font-display font-bold text-white text-sm">E</span>
                </div>
                <span className="font-display font-semibold tracking-tight">
                  EsportOdds
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-2 max-w-md">
                Advanced statistical analysis and betting predictions for League of Legends esports matches.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-medium mb-3">Features</h4>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li><a href="#" className="hover:text-lol-blue transition-colors duration-200">Match Predictions</a></li>
                  <li><a href="#" className="hover:text-lol-blue transition-colors duration-200">Team Analysis</a></li>
                  <li><a href="#" className="hover:text-lol-blue transition-colors duration-200">Side Statistics</a></li>
                  <li><a href="#" className="hover:text-lol-blue transition-colors duration-200">Value Bets</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Resources</h4>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li><a href="#" className="hover:text-lol-blue transition-colors duration-200">Blog</a></li>
                  <li><a href="#" className="hover:text-lol-blue transition-colors duration-200">API</a></li>
                  <li><a href="#" className="hover:text-lol-blue transition-colors duration-200">Documentation</a></li>
                  <li><a href="#" className="hover:text-lol-blue transition-colors duration-200">Support</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Company</h4>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li><a href="#" className="hover:text-lol-blue transition-colors duration-200">About</a></li>
                  <li><a href="#" className="hover:text-lol-blue transition-colors duration-200">Careers</a></li>
                  <li><a href="#" className="hover:text-lol-blue transition-colors duration-200">Privacy</a></li>
                  <li><a href="#" className="hover:text-lol-blue transition-colors duration-200">Terms</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              © 2023 EsportOdds. All rights reserved.
            </p>
            
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-gray-700 transition-colors duration-200">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              
              <a href="#" className="text-gray-400 hover:text-gray-700 transition-colors duration-200">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              
              <a href="#" className="text-gray-400 hover:text-gray-700 transition-colors duration-200">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
