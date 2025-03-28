
import React from "react";
import { motion } from "framer-motion";

const TeamMatchesLoading = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="mt-8"
    >
      <h2 className="text-2xl font-bold mb-4">Matchs récents</h2>
      <div className="bg-white rounded-xl border border-gray-100 shadow-subtle p-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-lol-blue"></div>
      </div>
    </motion.div>
  );
};

export default TeamMatchesLoading;
