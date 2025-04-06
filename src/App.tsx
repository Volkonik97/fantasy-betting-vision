import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Index from "./pages/Index";
import Teams from "./pages/Teams";
import Players from "./pages/Players";
import Matches from "./pages/Matches";
import Tournaments from "./pages/Tournaments";
import TeamComparison from "./pages/TeamComparison";
import Analysis from "./pages/Analysis";
import DataImport from "./pages/DataImport";
import PlayerImages from "./pages/PlayerImages";
import TeamDetails from "./pages/TeamDetails";
import PlayerDetails from "./pages/PlayerDetails";
import MatchDetails from "./pages/MatchDetails";
import NotFound from "./pages/NotFound";
import Predictions from "./pages/Predictions";
import AdminPage from "./pages/Admin";

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;

// Update the router to include the Admin page
const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
    errorElement: <NotFound />,
  },
  {
    path: "/teams",
    element: <Teams />,
  },
  {
    path: "/team/:id",
    element: <TeamDetails />,
  },
  {
    path: "/players",
    element: <Players />,
  },
  {
    path: "/player/:id",
    element: <PlayerDetails />,
  },
  {
    path: "/matches",
    element: <Matches />,
  },
  {
    path: "/match/:id",
    element: <MatchDetails />,
  },
  {
    path: "/tournaments",
    element: <Tournaments />,
  },
  {
    path: "/predictions",
    element: <Predictions />,
  },
  {
    path: "/team-comparison",
    element: <TeamComparison />,
  },
  {
    path: "/analysis",
    element: <Analysis />,
  },
  {
    path: "/data-import",
    element: <DataImport />,
  },
  {
    path: "/player-images",
    element: <PlayerImages />,
  },
  {
    path: "/admin",
    element: <AdminPage />,
  },
]);
