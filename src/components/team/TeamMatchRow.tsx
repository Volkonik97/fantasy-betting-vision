
import React from "react";
import { Match, Team } from "@/utils/models/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format, parseISO, isValid } from "date-fns";
import { fr } from "date-fns/locale";
import { getTeamLogoUrl } from "@/utils/database/teams/logoUtils";

interface TeamMatchRowProps {
  match: Match;
  teamId: string;
  teamName: string;
}

const TeamMatchRow = ({ match, teamId, teamName }: TeamMatchRowProps) => {
  const [opponentLogo, setOpponentLogo] = React.useState<string | null>(null);
  const [logoError, setLogoError] = React.useState(false);
  const logoLoadAttempted = React.useRef(false);

  if (!match.teamBlue || !match.teamRed) {
    console.error(`Données de match incomplètes pour le match ${match.id}`);
    return null;
  }

  // Vérifier si l'équipe est bleue par ID ou nom pour plus de flexibilité
  const isBlue = match.teamBlue.id === teamId || match.teamBlue.name === teamName;
  const opponent = isBlue ? match.teamRed : match.teamBlue;
  const side = match.teamBlue && match.teamRed ? (isBlue ? "Bleu" : "Rouge") : "-";

  const result =
    match.status === "Completed"
      ? match.result?.winner === teamId
        ? "Victoire"
        : "Défaite"
      : "-";

  const predictionAccurate =
    match.status === "Completed" && match.result
      ? match.predictedWinner === match.result.winner
      : null;

  // Formatage de la date
  let formattedDate = "Date invalide";
  try {
    if (match.date) {
      const dateString = typeof match.date === "string" ? match.date : String(match.date);
      const parsedDate = parseISO(dateString);
      if (isValid(parsedDate)) {
        formattedDate = format(parsedDate, "dd/MM/yyyy", { locale: fr });
      } else {
        console.warn(`Format de date invalide pour le match ${match.id}: ${match.date}`);
      }
    }
  } catch (error) {
    console.error(`Erreur lors du formatage de la date pour le match ${match.id}:`, error);
  }

  // Chargement du logo de l'adversaire
  React.useEffect(() => {
    const loadOpponentLogo = async () => {
      try {
        // Éviter les tentatives multiples de chargement si une erreur s'est déjà produite
        if (logoError || logoLoadAttempted.current) {
          return;
        }
        
        logoLoadAttempted.current = true;
        
        // Utiliser le logo si déjà disponible
        if (opponent.logo) {
          setOpponentLogo(opponent.logo);
          return;
        }
        
        // Sinon tenter de le récupérer
        if (opponent.id) {
          console.log(`Chargement du logo pour l'équipe ${opponent.name} (${opponent.id})`);
          const logo = await getTeamLogoUrl(opponent.id);
          if (logo) {
            setOpponentLogo(logo);
          }
        }
      } catch (error) {
        console.error(`Erreur lors du chargement du logo pour ${opponent.name}:`, error);
        setLogoError(true);
      }
    };

    loadOpponentLogo();
  }, [opponent.id, opponent.logo, opponent.name, logoError]);

  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50">
      <td className="px-4 py-3">{formattedDate}</td>
      <td className="px-4 py-3">{match.tournament || "N/A"}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Avatar className="w-5 h-5 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
            {!logoError && opponentLogo ? (
              <AvatarImage
                src={opponentLogo}
                alt={`${opponent.name} logo`}
                className="w-4 h-4 object-contain"
                onError={() => setLogoError(true)}
              />
            ) : null}
            <AvatarFallback className="text-xs">
              {opponent.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span>{opponent.name}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className={`text-xs px-2 py-1 rounded ${
            side === "Bleu" ? "bg-blue-100 text-blue-800" : side === "Rouge" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-600"
          }`}
        >
          {side}
        </span>
      </td>
      <td className="px-4 py-3">
        <span
          className={`font-medium ${
            result === "Victoire"
              ? "text-green-600"
              : result === "Défaite"
              ? "text-red-600"
              : "text-gray-500"
          }`}
        >
          {result}
        </span>
      </td>
      <td className="px-4 py-3">
        {match.status === "Completed" ? (
          <span
            className={`text-xs px-2 py-1 rounded ${
              predictionAccurate ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {predictionAccurate ? "Correcte" : "Incorrecte"}
          </span>
        ) : (
          <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
            {match.predictedWinner === teamId ? "Victoire" : "Défaite"} (
            {isBlue
              ? Math.round(match.blueWinOdds * 100)
              : Math.round(match.redWinOdds * 100)}
            %)
          </span>
        )}
      </td>
    </tr>
  );
};

export default TeamMatchRow;
