
import React from "react";
import { format } from "date-fns";
import { Clock, TrendingUp } from "lucide-react";

interface UpcomingMatchInfoProps {
  matchDate: Date;
}

const UpcomingMatchInfo: React.FC<UpcomingMatchInfoProps> = ({ matchDate }) => {
  return (
    <div className="mt-4 grid grid-cols-2 gap-4">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Clock className="w-4 h-4 text-gray-400" />
        <span>{format(matchDate, "h:mm a")} local time</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-600 justify-end">
        <TrendingUp className="w-4 h-4 text-gray-400" />
        <span>High stakes match</span>
      </div>
    </div>
  );
};

export default UpcomingMatchInfo;
