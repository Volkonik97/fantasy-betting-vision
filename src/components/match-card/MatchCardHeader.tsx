
import React from "react";
import { format } from "date-fns";

interface MatchCardHeaderProps {
  tournament: string;
  matchDate: Date;
  status: 'Upcoming' | 'Live' | 'Completed';
}

const MatchCardHeader: React.FC<MatchCardHeaderProps> = ({ tournament, matchDate, status }) => {
  return (
    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{tournament}</span>
        <span className="h-1 w-1 rounded-full bg-gray-300" />
        <span className="text-sm text-gray-500">
          {format(matchDate, "MMM d, yyyy • h:mm a")}
        </span>
      </div>
      
      <div>
        {status === "Live" && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-lol-red text-white">
            <span className="w-2 h-2 rounded-full bg-white mr-1 animate-pulse" />
            Live
          </span>
        )}
        
        {status === "Upcoming" && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            Upcoming
          </span>
        )}
        
        {status === "Completed" && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Completed
          </span>
        )}
      </div>
    </div>
  );
};

export default MatchCardHeader;
