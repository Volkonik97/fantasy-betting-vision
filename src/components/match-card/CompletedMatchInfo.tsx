
import React from "react";
import { Users } from "lucide-react";
import { formatSecondsToMinutesSeconds } from "@/utils/dataConverter";

interface CompletedMatchInfoProps {
  result: {
    winner: string;
    duration?: string;
    mvp?: string;
  };
  winnerName: string;
}

const CompletedMatchInfo: React.FC<CompletedMatchInfoProps> = ({ result, winnerName }) => {
  return (
    <div className="mt-4 grid grid-cols-1 gap-2">
      <div className="text-sm text-gray-600">
        <span className="font-medium">{winnerName}</span> won in {result.duration ? formatSecondsToMinutesSeconds(parseInt(result.duration)) : "??:??"}
      </div>
      {result.mvp && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4 text-gray-400" />
          <span>MVP: {result.mvp}</span>
        </div>
      )}
    </div>
  );
};

export default CompletedMatchInfo;
