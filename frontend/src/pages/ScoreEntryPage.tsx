import { useParams, useNavigate } from "react-router-dom";
import { ScoreEntry } from "@/components/golf/ScoreEntry";
import api from "@/api/axios";
import { useEffect, useState } from "react";

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
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRoundData = async () => {
      try {
        // Fetch round data including players
        const response = await api.get(`/rounds/${roundId}`);
        const roundData = response.data;
        
        // Initialize players with empty scores if needed
        const initializedPlayers = roundData.players.map((player: any) => ({
          ...player,
          holes: Array.from({ length: 18 }, (_, i) => ({
            holeNumber: i + 1,
            strokes: 0,
            putts: 0,
          })),
        }));
        
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
      onExit={() => navigate(`/app/round/${roundId}`)}
    />
  );
};