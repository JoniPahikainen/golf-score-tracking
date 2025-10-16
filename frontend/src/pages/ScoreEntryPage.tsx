import { useParams, useNavigate } from "react-router-dom";
import { ScoreEntry } from "@/components/golf/ScoreEntry";
import api from "@/api/axios";
import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { ScoreUser as User } from "@/types";
import { useRoundSocket } from "@/hooks/useRoundSocket";

export const ScoreEntryPage = () => {
  const { roundId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [players, setPlayers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useRoundSocket(roundId!, setPlayers);

  useEffect(() => {
    const fetchRoundData = async () => {
      try {
        setIsLoading(true);

        const response = await api.get(`/rounds/${roundId}`);
        const roundData = response.data;
        const roundPlayers = roundData.data?.players || [];

        const initializedPlayers = await Promise.all(
          roundPlayers.map(async (player: any) => {
            const holes = Array.from({ length: 18 }, (_, i) => {
              const holeNumber = i + 1;
              const score = player.scores?.find(
                (s: any) => s.holeNumber === holeNumber
              );
              return {
                holeNumber,
                strokes: score?.strokes || 0,
                putts: score?.putts || 0,
                fairwayHit: score?.fairwayHit,
                greenInReg: score?.greenInRegulation,
              };
            });

            let playerName = `Player ${player.userId.slice(-4)}`;
            try {
              const userResponse = await api.get(`/users/${player.userId}`);
              if (userResponse.data.success && userResponse.data.data) {
                const u = userResponse.data.data;
                playerName =
                  u.firstName && u.lastName
                    ? `${u.firstName} ${u.lastName}`
                    : u.userName || playerName;
              }
            } catch {}
            return { id: player.userId, name: playerName, holes };
          })
        );

        if (initializedPlayers.length === 0 && user) {
          initializedPlayers.push({
            id: user.id,
            name: user.userName || user.firstName || "Player",
            holes: Array.from({ length: 18 }, (_, i) => ({
              holeNumber: i + 1,
              strokes: 0,
              putts: 0,
              fairwayHit: undefined,
              greenInReg: undefined,
            })),
          });
        }

        setPlayers([...initializedPlayers]);
        setLastUpdated(new Date());
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching round data:", error);
        navigate("/app");
      }
    };

    fetchRoundData();
  }, [roundId, navigate, user]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading round data...</div>
      </div>
    );

  return (
    <div>
      {lastUpdated && (
        <div className="fixed top-4 right-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-xs z-50">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}
      <ScoreEntry
        initialPlayers={players}
        roundId={roundId!}
        onExit={() => navigate(`/app/round/${roundId}`)}
      />
    </div>
  );
};
