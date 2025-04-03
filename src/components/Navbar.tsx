
import React, { useState, useEffect } from "react";
import { Link, NavLink as RouterNavLink } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, children }) => (
  <RouterNavLink
    to={to}
    className={({ isActive }) =>
      `relative px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out ${
        isActive
          ? "text-blue-600 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-blue-600 after:content-['']"
          : "text-gray-700 hover:text-blue-600"
      }`
    }
  >
    {children}
  </RouterNavLink>
);

const MobileNavLink: React.FC<NavLinkProps> = ({ to, children }) => (
  <RouterNavLink
    to={to}
    className={({ isActive }) =>
      `block w-full px-4 py-3 text-base font-medium border-l-2 transition-all duration-200 ${
        isActive
          ? "border-blue-600 bg-blue-50 text-blue-600"
          : "border-transparent text-gray-600 hover:border-gray-200 hover:bg-gray-50 hover:text-gray-900"
      }`
    }
  >
    {children}
  </RouterNavLink>
);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-sm shadow-md" : "bg-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold">LA</span>
              </div>
              <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                LoL Analytics
              </h1>
            </Link>
          </div>
          
          <div className="hidden md:flex md:space-x-1">
            <NavLink to="/">Dashboard</NavLink>
            <NavLink to="/teams">Teams</NavLink>
            <NavLink to="/players">Players</NavLink>
            <NavLink to="/matches">Matches</NavLink>
            <NavLink to="/tournaments">Tournaments</NavLink>
            <NavLink to="/predictions">Predictions</NavLink>
            <NavLink to="/analysis">Analysis</NavLink>
            <NavLink to="/comparison">Comparison</NavLink>
            <NavLink to="/import">Import</NavLink>
            <NavLink to="/player-images">Images</NavLink>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="p-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-expanded={isOpen}
            >
              <span className="sr-only">{isOpen ? "Close menu" : "Open menu"}</span>
              {isOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 bg-white shadow-lg rounded-b-lg border-t border-gray-100">
          <div className="py-2">
            <MobileNavLink to="/">Dashboard</MobileNavLink>
            <MobileNavLink to="/teams">Teams</MobileNavLink>
            <MobileNavLink to="/players">Players</MobileNavLink>
            <MobileNavLink to="/matches">Matches</MobileNavLink>
            <MobileNavLink to="/tournaments">Tournaments</MobileNavLink>
            <MobileNavLink to="/predictions">Predictions</MobileNavLink>
            <MobileNavLink to="/analysis">Analysis</MobileNavLink>
            <MobileNavLink to="/comparison">Comparison</MobileNavLink>
            <MobileNavLink to="/import">Import</MobileNavLink>
            <MobileNavLink to="/player-images">Images Joueurs</MobileNavLink>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
