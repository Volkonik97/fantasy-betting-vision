
import React from "react";
import { motion } from "framer-motion";

const TeamMatchesEmpty = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="mt-8"
    >
      <h2 className="text-2xl font-bold mb-4">Matchs récents</h2>
      <div className="bg-white rounded-xl border border-gray-100 shadow-subtle p-6 text-center text-gray-500">
        Aucun match récent trouvé pour cette équipe
      </div>
    </motion.div>
  );
};

export default TeamMatchesEmpty;
