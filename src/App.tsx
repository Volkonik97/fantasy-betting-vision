
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import LoadingSpinner from "@/components/LoadingSpinner";

// Import Players component directly instead of using lazy loading to help debug the issue
import Players from "@/pages/Players";

// Continue to use lazy loading for other components
const Home = lazy(() => import("@/pages/Home"));
const PlayerDetails = lazy(() => import("@/pages/PlayerDetails"));
const Matches = lazy(() => import("@/pages/Matches"));
const MatchDetails = lazy(() => import("@/pages/MatchDetails"));
const Teams = lazy(() => import("@/pages/Teams"));
const TeamDetails = lazy(() => import("@/pages/TeamDetails"));
const PlayerImages = lazy(() => import("@/pages/PlayerImages"));

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/players" element={<Players />} />
          <Route path="/players/:id" element={<PlayerDetails />} />
          <Route path="/player/:id" element={<PlayerDetails />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/match/:id" element={<MatchDetails />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/team/:id" element={<TeamDetails />} />
          <Route path="/player-images" element={<PlayerImages />} />
        </Routes>
      </Suspense>
      <Toaster position="top-right" richColors closeButton />
    </BrowserRouter>
  );
};

export default App;
