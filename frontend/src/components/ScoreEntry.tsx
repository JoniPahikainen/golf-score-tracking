import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Hole {
  holeNumber: number;
  strokes: number;
  putts: number;
  fairwayHit?: boolean;
  greenInReg?: boolean;
}

export interface Player {
  id: string;
  name: string;
  holes: Hole[];
}

interface ScoreEntryProps {
  initialPlayers: Player[];
  onExit?: () => void;
}

const DEFAULT_PAR = [4, 4, 3, 5, 4, 3, 4, 5, 4, 4, 3, 5, 4, 3, 4, 5, 4, 4];

export const ScoreEntry = ({ initialPlayers, onExit }: ScoreEntryProps) => {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [currentHoleIndex, setCurrentHoleIndex] = useState(0);
  const [popup, setPopup] = useState<{ playerId: string | null }>({ playerId: null });
  const { toast } = useToast();

  const updateHole = (
    playerId: string,
    holeIndex: number,
    field: keyof Hole,
    value: any
  ) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === playerId
          ? {
              ...p,
              holes: p.holes.map((h, i) =>
                i === holeIndex ? { ...h, [field]: value } : h
              ),
            }
          : p
      )
    );
  };

  const calculateCurrentScore = (player: Player) =>
    player.holes
      .slice(0, currentHoleIndex + 1)
      .reduce((total, hole, i) => total + (hole.strokes - DEFAULT_PAR[i]), 0);

  const renderPopup = (player: Player) => {
    if (popup.playerId !== player.id) return null;

    const hole = player.holes[currentHoleIndex];
    const par = DEFAULT_PAR[currentHoleIndex];

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white text-black  rounded-xl p-6 text-center shadow-md w-72 space-y-4">
          <h2 className="text-lg font-bold">{player.name} – Hole {currentHoleIndex + 1}</h2>
          <div className="text-sm text-muted-foreground">Par {par}</div>
          <div className="flex items-center justify-between">
            <Button
              onClick={() =>
                updateHole(player.id, currentHoleIndex, "strokes", Math.max(0, hole.strokes - 1))
              }
            >
              -1
            </Button>
            <div className="text-2xl">{hole.strokes || par}</div>
            <Button
              onClick={() =>
                updateHole(player.id, currentHoleIndex, "strokes", hole.strokes + 1)
              }
            >
              +1
            </Button>
          </div>
          <Button variant="outline" onClick={() => setPopup({ playerId: null })}>
            Done
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      {/* Back Button */}
      {onExit && (
        <Button variant="ghost" onClick={onExit}>
          ← Back to Start
        </Button>
      )}

      {/* Hole Navigation */}
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={() => setCurrentHoleIndex((i) => Math.max(0, i - 1))}>
          <ChevronLeft />
        </Button>
        <div className="font-bold text-lg">Hole {currentHoleIndex + 1}</div>
        <Button variant="ghost" onClick={() => setCurrentHoleIndex((i) => Math.min(17, i + 1))}>
          <ChevronRight />
        </Button>
      </div>

      {/* Player Cards */}
      {players.map((player) => {
        const hole = player.holes[currentHoleIndex];
        const score = calculateCurrentScore(player);
        return (
          <Card key={player.id} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{player.name}</div>
                <div className="text-sm text-muted-foreground">
                  Score: {score > 0 ? `+${score}` : score} ({hole.strokes || "0"})
                </div>
              </div>
              <Button
                className="rounded-full h-10 w-10 p-0 flex items-center justify-center text-base"
                variant="outline"
                onClick={() => setPopup({ playerId: player.id })}
              >
                {hole.strokes > 0 ? hole.strokes : DEFAULT_PAR[currentHoleIndex]}
              </Button>
            </div>
            {renderPopup(player)}
          </Card>
        );
      })}

      {/* Actions */}
      <div className="flex justify-between pt-2">
        <Button
          variant="outline"
          onClick={() =>
            setPlayers(
              players.map((p) => ({
                ...p,
                holes: p.holes.map((h) => ({
                  ...h,
                  strokes: 0,
                  putts: 0,
                  fairwayHit: false,
                  greenInReg: false,
                })),
              }))
            )
          }
        >
          Reset All
        </Button>
        <Button
          onClick={() => {
            const hasScores = players.some((p) => p.holes.some((h) => h.strokes > 0));
            if (!hasScores) {
              toast({ title: "No scores entered", variant: "destructive" });
              return;
            }
            toast({ title: "Scores saved!" });
            console.log("Saving:", players);
          }}
        >
          Save All
        </Button>
      </div>
    </div>
  );
};
