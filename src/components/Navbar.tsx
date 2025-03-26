import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, X, Home, Users, Calendar, Award, BarChart, GitCompare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navItems = [
    { path: "/", label: "Accueil", icon: <Home className="h-4 w-4" /> },
    { path: "/teams", label: "Équipes", icon: <Users className="h-4 w-4" /> },
    { path: "/matches", label: "Matchs", icon: <Calendar className="h-4 w-4" /> },
    { path: "/tournaments", label: "Tournois", icon: <Award className="h-4 w-4" /> },
    { path: "/predictions", label: "Prédictions", icon: <BarChart className="h-4 w-4" /> },
    { path: "/compare-teams", label: "Comparer", icon: <GitCompare className="h-4 w-4" /> },
  ];

  return (
    <nav className="bg-white border-b border-gray-100 fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <NavLink to="/" className="font-bold text-lg">
          LoL Stats
        </NavLink>
        
        {isMobile ? (
          <button onClick={toggleMenu} className="text-gray-500 hover:text-gray-700 focus:outline-none">
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        ) : (
          <div className="flex items-center space-x-6">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) =>
                  `text-gray-600 hover:text-gray-900 transition-colors duration-200 flex items-center gap-2 ${
                    isActive ? "font-medium" : ""
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </div>
      
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            className="bg-white border-b border-gray-100 py-2"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <div className="max-w-7xl mx-auto px-4 flex flex-col gap-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.path}
                  className={({ isActive }) =>
                    `text-gray-600 hover:text-gray-900 transition-colors duration-200 block py-2 ${
                      isActive ? "font-medium" : ""
                    }`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
