import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchBarProps {
  onSearch: (query: string) => void;
  value?: string; // Make value optional
}

const SearchBar = ({ onSearch, value }: SearchBarProps) => {
  const [query, setQuery] = useState(value || "");
  const [isFocused, setIsFocused] = useState(false);

  // Add effect to sync internal state with external value
  useEffect(() => {
    if (value !== undefined) {
      setQuery(value);
    }
  }, [value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    
    // If there's no external value control, we can update on change
    if (value === undefined) {
      onSearch(newValue);
    }
  };

  return (
    <div className="relative max-w-2xl mx-auto">
      <form 
        onSubmit={handleSubmit}
        className="relative"
      >
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search for teams, players, or tournaments..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-subtle focus:border-lol-blue focus:ring-1 focus:ring-lol-blue focus:outline-none transition-all duration-200"
        />
        
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>
        
        <AnimatePresence>
          {query && (
            <motion.button
              type="reset"
              onClick={() => {
                setQuery("");
                onSearch("");
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </form>
      
      <AnimatePresence>
        {isFocused && query && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-2 p-3 bg-white rounded-xl border border-gray-200 shadow-lg z-10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-sm text-gray-500 mb-3">
              Try searching for teams, players, or tournaments
            </div>
            
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm rounded-md transition-colors duration-200">
                T1
              </button>
              <button className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm rounded-md transition-colors duration-200">
                Faker
              </button>
              <button className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm rounded-md transition-colors duration-200">
                Worlds 2023
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
