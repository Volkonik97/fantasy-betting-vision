
import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy load pages for better performance
const Matches = lazy(() => import("./pages/Matches"));
const MatchDetails = lazy(() => import("./pages/MatchDetails"));
const Teams = lazy(() => import("./pages/Teams"));
const TeamDetails = lazy(() => import("./pages/TeamDetails"));
const Players = lazy(() => import("./pages/Players"));
const PlayerDetails = lazy(() => import("./pages/PlayerDetails"));
const PlayerImages = lazy(() => import("./pages/PlayerImages"));
const Tournaments = lazy(() => import("./pages/Tournaments"));
const DataImport = lazy(() => import("./pages/DataImport"));
const Admin = lazy(() => import("./pages/Admin"));
const Analysis = lazy(() => import("./pages/Analysis"));
const Predictions = lazy(() => import("./pages/Predictions"));
const TeamComparison = lazy(() => import("./pages/TeamComparison"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Chargement...</div>}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/matches/:matchId" element={<MatchDetails />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/teams/:teamId" element={<TeamDetails />} />
          <Route path="/players" element={<Players />} />
          <Route path="/players/:playerId" element={<PlayerDetails />} />
          <Route path="/player-images" element={<PlayerImages />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/import" element={<DataImport />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/predictions" element={<Predictions />} />
          <Route path="/compare" element={<TeamComparison />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;
