import React, { useState } from "react";
import { Link, NavLink as RouterNavLink } from "react-router-dom";

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, children }) => (
  <RouterNavLink
    to={to}
    className={({ isActive }) =>
      `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 focus:outline-none transition duration-150 ease-in-out ${
        isActive
          ? "border-blue-500 text-gray-900 focus:border-blue-700"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:text-gray-700 focus:border-gray-300"
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
      `block px-3 py-2 rounded-md text-base font-medium focus:outline-none transition duration-150 ease-in-out ${
        isActive
          ? "text-white bg-blue-500 focus:bg-blue-700"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:text-gray-900 focus:bg-gray-50"
      }`
    }
  >
    {children}
  </RouterNavLink>
);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/">
                <h1 className="text-xl font-semibold text-blue-600">LoL Analytics</h1>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              <NavLink to="/">Dashboard</NavLink>
              <NavLink to="/teams">Teams</NavLink>
              <NavLink to="/players">Players</NavLink>
              <NavLink to="/matches">Matches</NavLink>
              <NavLink to="/tournaments">Tournaments</NavLink>
              <NavLink to="/predictions">Predictions</NavLink>
              <NavLink to="/analysis">Analysis</NavLink>
              <NavLink to="/comparison">Comparison</NavLink>
              <NavLink to="/import">Import</NavLink>
              <NavLink to="/player-images">Images Joueurs</NavLink>
            </div>
          </div>

          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out"
              aria-label="Open main menu"
            >
              <svg
                className={`${isOpen ? "hidden" : "block"} h-6 w-6`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isOpen ? "block" : "hidden"} h-6 w-6`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {isOpen && (
            <div className="sm:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
              <div className="px-2 pt-2 pb-3 space-y-1">
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
