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

  useEffect(() => {
    const fetchRoundData = async () => {
      try {
        const response = await api.get(`/rounds/${roundId}`);
        const roundData = response.data;
        const roundPlayers = roundData.players || [];

        const initializedPlayers = roundPlayers.map((player: any) => ({
          id: player.id || Date.now().toString(),
          name: player.name || `Player ${Date.now().toString().slice(-4)}`,
          holes:
            Array.isArray(player.holes) && player.holes.length > 0
              ? player.holes.map((hole: any) => ({
                  holeNumber: hole.holeNumber || 0,
                  strokes: hole.strokes || 0,
                  putts: hole.putts || 0,
                  fairwayHit: hole.fairwayHit,
                  greenInReg: hole.greenInReg,
                }))
              : Array.from({ length: 18 }, (_, i) => ({
                  holeNumber: i + 1,
                  strokes: 0,
                  putts: 0,
                  fairwayHit: undefined,
                  greenInReg: undefined,
                })),
        }));

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
    return <div>Loading...</div>;
  }

  return (
    <ScoreEntry
      initialPlayers={players}
      roundId={roundId!}
      onExit={() => navigate(`/app/round/${roundId}`)}
    />
  );
};
