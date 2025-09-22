import { useParams, useNavigate } from "react-router-dom";
import { ScoreEntry } from "@/components/golf/ScoreEntry";
import api from "@/api/axios";
import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";

interface Player {
  id: string;
  name: string;
  holes: Array<{
    holeNumber: number;
    strokes: number;
    putts: number;
  }>;
}

export const ScoreEntryPage = () => {
  const { roundId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);

  useEffect(() => {
    const fetchRoundData = async () => {
      try {
        const response = await api.get(`/rounds/${roundId}`);
        const roundData = response.data;
        const roundPlayers = roundData.data?.players || [];

        console.log("Round data from backend:", roundData);
        console.log("Round players:", roundPlayers);

        setIsLoadingPlayers(true);
        const initializedPlayers = await Promise.all(
          roundPlayers.map(async (player: any) => {
            const holes = Array.from({ length: 18 }, (_, i) => {
              const holeNumber = i + 1;
              const score = player.scores?.find((s: any) => s.holeNumber === holeNumber);
              return {
                holeNumber: holeNumber,
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
                const userData = userResponse.data.data;
                playerName = userData.firstName && userData.lastName 
                  ? `${userData.firstName} ${userData.lastName}`
                  : userData.userName || playerName;
              }
            } catch (error) {
              console.warn(`Could not fetch user info for ${player.userId}:`, error);
            }

            return {
              id: player.userId,
              name: playerName,
              holes: holes,
            };
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

        setPlayers(initializedPlayers);
        setIsLoadingPlayers(false);
      } catch (error) {
        console.error("Error fetching round data:", error);
        navigate("/app");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoundData();
  }, [roundId, navigate]);

  const handleSave = async (playersData: Player[]) => {
    try {
      await api.put(`/rounds/${roundId}/scores`, { players: playersData });
      navigate(`/app/round/${roundId}`);
    } catch (error) {
      console.error("Error saving scores:", error);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-lg">Loading round data...</div>
        {isLoadingPlayers && <div className="text-sm text-gray-500 mt-2">Fetching player information...</div>}
      </div>
    </div>;
  }

  return (
    <ScoreEntry
      initialPlayers={players}
      roundId={roundId!}
      onExit={() => navigate(`/app/round/${roundId}`)}
    />
  );
};
