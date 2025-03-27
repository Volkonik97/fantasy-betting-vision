
import React from "react";
import { GitCompare, ChevronRight } from "lucide-react";
import { Team } from "@/utils/models/types";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface TeamSelectionCardProps {
  teams: Team[];
  team1Id: string;
  team2Id: string;
  onTeam1Change: (value: string) => void;
  onTeam2Change: (value: string) => void;
  onCompare: () => void;
  isLoading: boolean;
}

const TeamSelectionCard = ({
  teams,
  team1Id,
  team2Id,
  onTeam1Change,
  onTeam2Change,
  onCompare,
  isLoading
}: TeamSelectionCardProps) => {
  
  const handleCompare = () => {
    if (!team1Id || !team2Id) {
      toast("Veuillez sélectionner deux équipes pour comparer", {
        description: "Les deux équipes doivent être sélectionnées pour générer une prédiction.",
      });
      return;
    }
    
    if (team1Id === team2Id) {
      toast("Veuillez sélectionner deux équipes différentes", {
        description: "Vous ne pouvez pas comparer une équipe avec elle-même.",
      });
      return;
    }
    
    onCompare();
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCompare className="h-5 w-5" />
          Sélectionner les équipes à comparer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
          <div className="md:col-span-3">
            <Select value={team1Id} onValueChange={onTeam1Change}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner la première équipe" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    <div className="flex items-center gap-2">
                      <img src={team.logo} alt={team.name} className="w-5 h-5 object-contain" />
                      <span>{team.name}</span>
                      <span className="text-xs text-gray-500">({team.region})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-center">
            <div className="bg-gray-100 rounded-full p-2">
              <ChevronRight className="h-5 w-5 text-gray-500" />
            </div>
          </div>
          
          <div className="md:col-span-3">
            <Select value={team2Id} onValueChange={onTeam2Change}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner la deuxième équipe" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    <div className="flex items-center gap-2">
                      <img src={team.logo} alt={team.name} className="w-5 h-5 object-contain" />
                      <span>{team.name}</span>
                      <span className="text-xs text-gray-500">({team.region})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="mt-6 flex justify-center">
          <Button onClick={handleCompare} disabled={!team1Id || !team2Id || team1Id === team2Id || isLoading}>
            Comparer les équipes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamSelectionCard;
