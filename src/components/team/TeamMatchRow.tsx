
import React from "react";
import { Match, Team } from "@/utils/models/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format, parseISO, isValid } from "date-fns";
import { fr } from "date-fns/locale";
import { getTeamLogoUrl } from "@/utils/database/teams/logoUtils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TeamMatchRowProps {
  match: Match;
  teamId: string;
  teamName: string;
}

const TeamMatchRow = ({ match, teamId, teamName }: TeamMatchRowProps) => {
  const [opponentLogo, setOpponentLogo] = React.useState<string | null>(null);
  const [logoError, setLogoError] = React.useState(false);

  if (!match.teamBlue || !match.teamRed) {
    console.error(`Données de match incomplètes pour le match ${match.id}`);
    return null;
  }
  
  // Vérifier si l'équipe est bleue par ID ou nom pour plus de flexibilité
  const isBlue = match.teamBlue.id === teamId || match.teamBlue.name === teamName;
  const opponent = isBlue ? match.teamRed : match.teamBlue;
  const side = isBlue ? "Bleu" : "Rouge";
  
  const result = match.status === 'Completed' 
    ? (match.result?.winner === teamId ? 'Victoire' : 'Défaite') 
    : '-';
  const predictionAccurate = match.status === 'Completed' && match.result 
    ? match.predictedWinner === match.result.winner 
    : null;
  
  // Format the date properly
  let formattedDate = "Date invalide";
  
  try {
    if (match.date) {
      // Ensure we're working with a string for parseISO
      const dateString = typeof match.date === 'string' ? match.date : String(match.date);
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
  
  // Charger le logo de l'adversaire
  React.useEffect(() => {
    const loadOpponentLogo = async () => {
      try {
        if (logoError) {
          return; // Si on a déjà eu une erreur, ne pas réessayer
        }
        
        // Cas spécial pour Gen.G
        if (opponent.name.toLowerCase().includes('gen.g') || opponent.name.toLowerCase() === 'geng') {
          setOpponentLogo("/lovable-uploads/8e2289d0-fe11-463b-a9fc-8116d67f7a15.png");
          return;
        }
        
        // Cas spécial pour Cloud9
        if (opponent.name.toLowerCase().includes('cloud9') || opponent.name.toLowerCase() === 'c9') {
          setOpponentLogo("/lovable-uploads/61322944-83d9-4ad7-a676-44dc5d959bd6.png");
          return;
        }
        
        // Cas spécial pour Disguised
        if (opponent.name.toLowerCase().includes('disguised')) {
          setOpponentLogo("/lovable-uploads/e1e0225a-15c3-4752-81a5-31b23ff17f11.png");
          return;
        }
        
        // Cas spécial pour FlyQuest
        if (opponent.name.toLowerCase().includes('flyquest') || opponent.name.toLowerCase() === 'fly') {
          setOpponentLogo("/lovable-uploads/e8ad379a-9beb-4829-9c74-75a074568549.png");
          return;
        }
        
        // Cas spécial pour Team Liquid
        if (opponent.name.toLowerCase().includes('liquid') || opponent.name.toLowerCase() === 'tl') {
          setOpponentLogo("/lovable-uploads/4d612b58-6777-485c-8fd7-6c23892150e7.png");
          return;
        }
        
        // Cas spécial pour PaiN Gaming
        if (opponent.name.toLowerCase().includes('pain') || opponent.name.toLowerCase().includes('paingaming')) {
          setOpponentLogo("/lovable-uploads/d4a83519-9297-4ffc-890c-666b32b48c55.png");
          return;
        }
        
        // Gestion améliorée pour T1/SKT
        if (opponent.name.toLowerCase().includes('t1') || opponent.name.toLowerCase().includes('skt')) {
          setOpponentLogo("/lovable-uploads/072fbcd9-2c2a-4db9-b9d1-771a0b61f798.png");
          return;
        }
        
        // Utiliser le logo existant s'il est valide
        if (opponent.logo && !opponent.logo.includes('undefined') && !opponent.logo.includes('null')) {
          console.log(`Utilisation du logo existant pour ${opponent.name}: ${opponent.logo}`);
          setOpponentLogo(opponent.logo);
          return;
        }
        
        // Sinon, chercher le logo via le service
        if (opponent.id) {
          console.log(`Recherche de logo pour l'équipe ${opponent.name} (${opponent.id})`);
          const logo = await getTeamLogoUrl(opponent.id);
          if (logo) {
            console.log(`Logo trouvé pour ${opponent.name}: ${logo}`);
            setOpponentLogo(logo);
          } else {
            console.warn(`Aucun logo trouvé pour ${opponent.name}`);
            setLogoError(true);
          }
        } else {
          console.warn(`ID d'équipe manquant pour ${opponent.name}`);
          setLogoError(true);
        }
      } catch (error) {
        console.error(`Erreur lors du chargement du logo pour ${opponent.name}:`, error);
        setLogoError(true);
      }
    };
    
    loadOpponentLogo();
  }, [opponent.id, opponent.name, opponent.logo, logoError]);
  
  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50">
      <td className="px-4 py-3">
        {formattedDate}
      </td>
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
        <span className={`text-xs px-2 py-1 rounded ${
          isBlue ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
        }`}>
          {side}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`font-medium ${
          result === 'Victoire' ? 'text-green-600' : 
          result === 'Défaite' ? 'text-red-600' : 'text-gray-500'
        }`}>
          {result}
        </span>
      </td>
      <td className="px-4 py-3">
        {match.status === 'Completed' ? (
          <span className={`text-xs px-2 py-1 rounded ${
            predictionAccurate ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {predictionAccurate ? 'Correcte' : 'Incorrecte'}
          </span>
        ) : (
          <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
            {match.predictedWinner === teamId ? 'Victoire' : 'Défaite'} 
            ({isBlue 
              ? Math.round(match.blueWinOdds * 100)
              : Math.round(match.redWinOdds * 100)}%)
          </span>
        )}
      </td>
    </tr>
  );
};

export default TeamMatchRow;
