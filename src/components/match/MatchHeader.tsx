
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar } from "lucide-react";
import { format } from "date-fns";

interface MatchHeaderProps {
  matchDate: Date;
  tournament: string;
}

const MatchHeader = ({ matchDate, tournament }: MatchHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="mb-8">
      <button 
        onClick={() => navigate('/matches')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        <span>Back to Matches</span>
      </button>
      
      <h1 className="text-3xl font-bold mb-2">Match Details</h1>
      <div className="flex items-center gap-2 text-gray-600">
        <Calendar className="w-4 h-4" />
        <span>{format(matchDate, "MMMM d, yyyy")} • {tournament}</span>
      </div>
    </div>
  );
};

export default MatchHeader;
