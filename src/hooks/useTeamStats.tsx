
import { useState, useEffect } from "react";
import { getSideStatistics } from "@/utils/statistics";

export const useTeamStats = (teamId: string) => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTeamStats = async () => {
      if (!teamId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const teamStats = await getSideStatistics(teamId);
        setStats(teamStats);
      } catch (err) {
        console.error("Error fetching team stats:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch team stats"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamStats();
  }, [teamId]);

  return { stats, isLoading, error };
};
