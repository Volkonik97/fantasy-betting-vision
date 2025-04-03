
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

interface HeroSectionProps {
  onStartAnalysis: () => void;
}

const HeroSection = ({ onStartAnalysis }: HeroSectionProps) => {
  // State to track image loading errors
  const [t1LogoError, setT1LogoError] = useState(false);
  
  // Backup images for logos
  const t1FallbackImage = "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/7/78/T1logo_profile.png";
  // Use directly uploaded Gen.G logo
  const genGLogoUrl = "/lovable-uploads/8e2289d0-fe11-463b-a9fc-8116d67f7a15.png";
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 px-6">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white to-blue-50 -z-10" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-lol-blue/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-lol-steel/10 rounded-full blur-3xl -z-10" />
      
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <motion.div 
          className="text-center md:text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-block px-3 py-1 mb-6 bg-blue-50 border border-blue-100 rounded-full text-sm font-medium text-lol-blue animate-pulse-subtle">
            Powered by Advanced Analytics
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight leading-tight">
            Predict <span className="text-gradient">League of Legends</span> Match Outcomes with Precision
          </h1>
          <p className="text-gray-600 text-lg md:text-xl mb-8 leading-relaxed max-w-lg mx-auto md:mx-0">
            Leverage sophisticated statistical models to forecast match results and identify betting opportunities with our esports analytics platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <button 
              onClick={onStartAnalysis}
              className="px-8 py-3 bg-gradient-to-r from-lol-blue to-accent text-white rounded-md font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px] focus-ring"
            >
              Start Analyzing
            </button>
            <button className="px-8 py-3 bg-white border border-gray-200 text-gray-800 rounded-md font-medium shadow-sm hover:border-gray-300 transition-colors duration-300 focus-ring">
              View Predictions
            </button>
          </div>
        </motion.div>
        
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="relative mx-auto max-w-md">
            {/* Main card */}
            <div className="glass-card rounded-xl p-6 shadow-elevation">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Match Prediction</h3>
                <span className="text-xs px-2 py-1 bg-blue-50 text-lol-blue rounded-full">Worlds 2023</span>
              </div>
              
              <div className="flex items-center justify-between my-5">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-white rounded-full shadow-subtle p-2 mb-2">
                    <img
                      src={t1LogoError ? t1FallbackImage : "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/7/78/T1logo_profile.png"}
                      alt="T1"
                      className="w-full h-full object-contain"
                      onError={() => setT1LogoError(true)}
                    />
                  </div>
                  <span className="font-medium text-sm">T1</span>
                </div>
                
                <div className="text-center py-2 px-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Prediction</div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-lol-blue font-semibold">58%</span>
                    <span className="text-gray-400">vs</span>
                    <span className="text-lol-red font-semibold">42%</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-white rounded-full shadow-subtle p-2 mb-2">
                    <img
                      src={genGLogoUrl}
                      alt="Gen.G"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="font-medium text-sm">Gen.G</span>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Key Insight</div>
                <p className="text-sm text-gray-700">
                  T1 has a 85% win rate on blue side and their mid-jungle synergy 
                  has been dominant throughout the tournament.
                </p>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -right-4 -top-4 transform rotate-6 animate-float">
              <div className="glass-card rounded-lg p-3 shadow-subtle">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-lol-blue/10 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-lol-blue rounded-full" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Blue Side Win Rate</span>
                    <p className="text-sm font-semibold">85%</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute -left-4 -bottom-4 transform -rotate-6 animate-float" style={{ animationDelay: "1s" }}>
              <div className="glass-card rounded-lg p-3 shadow-subtle">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-lol-red/10 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-lol-red rounded-full" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Red Side Win Rate</span>
                    <p className="text-sm font-semibold">80%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
