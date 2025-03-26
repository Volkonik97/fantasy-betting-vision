
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { AlignRight, X } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isMobile = useMobile();
  
  const links = [
    { path: "/", label: "Home" },
    { path: "/teams", label: "Teams" },
    { path: "/matches", label: "Matches" },
    { path: "/players", label: "Players" },
    { path: "/tournaments", label: "Tournaments" },
    { path: "/analysis", label: "Analysis" },
    { path: "/predictions", label: "Predictions" }
  ];
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-lol-blue to-lol-steel flex items-center justify-center">
              <span className="font-display font-bold text-white text-sm">E</span>
            </div>
            <span className="font-display font-semibold tracking-tight">
              EsportOdds
            </span>
          </Link>
          
          {isMobile ? (
            <button 
              className="p-2 text-gray-600 hover:text-lol-blue transition-colors"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <AlignRight size={24} />}
            </button>
          ) : (
            <ul className="flex items-center gap-6">
              {links.map(link => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`relative py-1 font-medium text-sm ${
                      isActive(link.path) ? "text-lol-blue" : "text-gray-700 hover:text-lol-blue"
                    } transition-colors duration-200`}
                  >
                    {link.label}
                    {isActive(link.path) && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute bottom-[-2px] left-0 right-0 h-0.5 bg-lol-blue"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      {isMobile && (
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white border-t border-gray-100 px-4 pb-4 overflow-hidden"
            >
              <ul className="flex flex-col gap-3 mt-3">
                {links.map(link => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className={`block px-3 py-2 rounded-md font-medium text-sm ${
                        isActive(link.path) 
                          ? "bg-lol-blue/10 text-lol-blue" 
                          : "text-gray-700 hover:bg-gray-50"
                      } transition-colors duration-200`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </nav>
  );
};

export default Navbar;
