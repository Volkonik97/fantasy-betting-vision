import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Index from "./pages/Index";
import Teams from "./pages/Teams";
import TeamDetails from "./pages/TeamDetails";
import Matches from "./pages/Matches";
import MatchDetails from "./pages/MatchDetails";
import Players from "./pages/Players";
import PlayerDetails from "./pages/PlayerDetails";
import Tournaments from "./pages/Tournaments";
import Analysis from "./pages/Analysis";
import Predictions from "./pages/Predictions";
import TeamComparison from "./pages/TeamComparison";
import DataImport from "./pages/DataImport";
import NotFound from "./pages/NotFound";
import PlayerImages from "./pages/PlayerImages";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <SonnerToaster />
        <BrowserRouter>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/teams/:id" element={<TeamDetails />} />
              <Route path="/players" element={<Players />} />
              <Route path="/players/:id" element={<PlayerDetails />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/matches/:id" element={<MatchDetails />} />
              <Route path="/predictions" element={<Predictions />} />
              <Route path="/analysis" element={<Analysis />} />
              <Route path="/comparison" element={<TeamComparison />} />
              <Route path="/tournaments" element={<Tournaments />} />
              <Route path="/import" element={<DataImport />} />
              <Route path="/player-images" element={<PlayerImages />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
