
import React, { useState } from "react";
import { Link, NavLink as RouterNavLink } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink
} from "@/components/ui/navigation-menu";

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, children }) => (
  <RouterNavLink
    to={to}
    className={({ isActive }) =>
      `inline-flex items-center px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-md ${
        isActive
          ? "bg-blue-50 text-blue-700"
          : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
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
      `block w-full px-4 py-3 rounded-md text-base font-medium transition-colors duration-200 ${
        isActive
          ? "bg-blue-50 text-blue-700"
          : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
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
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-blue-600">LoL Analytics</h1>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:ml-8 md:flex md:space-x-1">
              <NavigationMenu className="max-w-none">
                <NavigationMenuList className="space-x-1">
                  <NavigationMenuItem>
                    <NavLink to="/">Dashboard</NavLink>
                  </NavigationMenuItem>
                  
                  <NavigationMenuItem>
                    <NavLink to="/teams">Teams</NavLink>
                  </NavigationMenuItem>
                  
                  <NavigationMenuItem>
                    <NavLink to="/players">Players</NavLink>
                  </NavigationMenuItem>
                  
                  <NavigationMenuItem>
                    <NavLink to="/matches">Matches</NavLink>
                  </NavigationMenuItem>
                  
                  <NavigationMenuItem>
                    <NavLink to="/tournaments">Tournaments</NavLink>
                  </NavigationMenuItem>
                  
                  <NavigationMenuItem className="relative">
                    <NavigationMenuTrigger className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-md data-[state=open]:bg-blue-50 data-[state=open]:text-blue-700">
                      Analytics
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="min-w-[200px] bg-white rounded-md shadow-lg p-2 border border-gray-200">
                      <ul className="grid gap-1 w-full">
                        <li>
                          <NavigationMenuLink asChild>
                            <NavLink to="/predictions">Predictions</NavLink>
                          </NavigationMenuLink>
                        </li>
                        <li>
                          <NavigationMenuLink asChild>
                            <NavLink to="/analysis">Analysis</NavLink>
                          </NavigationMenuLink>
                        </li>
                        <li>
                          <NavigationMenuLink asChild>
                            <NavLink to="/comparison">Comparison</NavLink>
                          </NavigationMenuLink>
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  
                  <NavigationMenuItem className="relative">
                    <NavigationMenuTrigger className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-md data-[state=open]:bg-blue-50 data-[state=open]:text-blue-700">
                      Tools
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="min-w-[200px] bg-white rounded-md shadow-lg p-2 border border-gray-200">
                      <ul className="grid gap-1 w-full">
                        <li>
                          <NavigationMenuLink asChild>
                            <NavLink to="/import">Import</NavLink>
                          </NavigationMenuLink>
                        </li>
                        <li>
                          <NavigationMenuLink asChild>
                            <NavLink to="/player-images">Images Joueurs</NavLink>
                          </NavigationMenuLink>
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Open main menu"
            >
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
        <div className="md:hidden bg-white border-b border-gray-200 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <MobileNavLink to="/">Dashboard</MobileNavLink>
            <MobileNavLink to="/teams">Teams</MobileNavLink>
            <MobileNavLink to="/players">Players</MobileNavLink>
            <MobileNavLink to="/matches">Matches</MobileNavLink>
            <MobileNavLink to="/tournaments">Tournaments</MobileNavLink>
            
            <div className="border-t border-gray-200 my-2"></div>
            <div className="pl-3 py-2 text-sm font-medium text-gray-500">Analytics</div>
            <MobileNavLink to="/predictions">Predictions</MobileNavLink>
            <MobileNavLink to="/analysis">Analysis</MobileNavLink>
            <MobileNavLink to="/comparison">Comparison</MobileNavLink>
            
            <div className="border-t border-gray-200 my-2"></div>
            <div className="pl-3 py-2 text-sm font-medium text-gray-500">Tools</div>
            <MobileNavLink to="/import">Import</MobileNavLink>
            <MobileNavLink to="/player-images">Images Joueurs</MobileNavLink>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
