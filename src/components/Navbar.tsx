
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 py-4 px-6 transition-all duration-300 ease-in-out",
        isScrolled 
          ? "bg-white/80 backdrop-blur-md shadow-subtle" 
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center gap-2"
        >
          <div className="w-10 h-10 rounded-md bg-gradient-to-br from-lol-blue to-lol-steel flex items-center justify-center">
            <span className="font-display font-bold text-white text-xl">E</span>
          </div>
          <span className="font-display font-semibold text-xl tracking-tight">
            EsportOdds
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          {[
            ["Matches", "/matches"],
            ["Teams", "/teams"],
            ["Players", "/players"],
            ["Tournaments", "/tournaments"],
            ["Analysis", "/analysis"]
          ].map(([title, url]) => (
            <Link
              key={url}
              to={url}
              className="text-sm font-medium text-gray-700 hover:text-lol-blue transition-colors duration-200"
            >
              {title}
            </Link>
          ))}
        </nav>
        
        <div className="flex items-center gap-4">
          <button className="bg-white/90 hover:bg-white transition-colors duration-200 border border-gray-200 rounded-full px-4 py-2 text-sm font-medium shadow-subtle focus-ring">
            Sign In
          </button>
          
          <button className="hidden md:flex bg-gradient-to-r from-lol-blue to-accent text-white rounded-full px-4 py-2 text-sm font-medium shadow-subtle hover:opacity-90 transition-opacity duration-200 focus-ring">
            Get Premium
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
