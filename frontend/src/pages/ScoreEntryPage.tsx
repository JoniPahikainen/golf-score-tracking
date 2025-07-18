import React, { useState } from "react";
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

interface PopupProps {
  player: Player;
  holeIndex: number;
  par: number;
  initialStrokes: number;
  onClose: () => void;
  onSave: (strokes: number) => void;
}

const DEFAULT_PAR = [4, 4, 3, 5, 4, 3, 4, 5, 4, 4, 3, 5, 4, 3, 4, 5, 4, 4];

export const ScoreEntry = ({ initialPlayers, onExit }: ScoreEntryProps) => {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [currentHoleIndex, setCurrentHoleIndex] = useState(0);
  const [expandedPlayerIds, setExpandedPlayerIds] = useState<Set<string>>(
    new Set()
  );
  const [popup, setPopup] = useState<{ playerId: string | null }>({
    playerId: null,
  });
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

  const toggleExpanded = (playerId: string) => {
    setExpandedPlayerIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(playerId)) newSet.delete(playerId);
      else newSet.add(playerId);
      return newSet;
    });
  };

  const renderFullScorecard = (player: Player) => {
  const rows = [player.holes.slice(0, 9), player.holes.slice(9, 18)];
  return (
    <div className="mt-4 space-y-2">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-9 gap-1">
          {row.map((hole) => {
            const strokes = hole.strokes;
            const displayScore =
              hole.holeNumber - 1 <= currentHoleIndex
                ? strokes === 0
                  ? "" // blank if 0
                  : strokes != null
                  ? strokes
                  : DEFAULT_PAR[hole.holeNumber - 1]
                : "";
            return (
              <div key={hole.holeNumber} className="text-center">
                <div className="text-xs font-semibold text-gray-500">
                  {hole.holeNumber}
                </div>
                <div className="border rounded p-1 text-sm min-h-[1.75rem]">
                  {displayScore}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};


  const calculateCurrentScore = (player: Player) =>
    player.holes.slice(0, currentHoleIndex + 1).reduce((total, hole, i) => {
      const strokes = hole.strokes || DEFAULT_PAR[i];
      return total + (strokes - DEFAULT_PAR[i]);
    }, 0);

  const StrokePopup: React.FC<PopupProps> = ({
    player,
    holeIndex,
    par,
    initialStrokes,
    onClose,
    onSave,
  }) => {
    const [popupStrokes, setPopupStrokes] = React.useState(initialStrokes);

    React.useEffect(() => {
      setPopupStrokes(initialStrokes);
    }, [initialStrokes]);

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white text-black rounded-xl p-6 text-center shadow-md w-72 space-y-4">
          <h2 className="text-lg font-bold">
            {player.name} – Hole {holeIndex + 1}
          </h2>
          <div className="text-sm text-muted-foreground">Par {par}</div>
          <div className="flex items-center justify-between">
            <Button
              onClick={() => setPopupStrokes((prev) => Math.max(0, prev - 1))}
            >
              -1
            </Button>
            <div className="text-2xl">{popupStrokes}</div>
            <Button onClick={() => setPopupStrokes((prev) => prev + 1)}>
              +1
            </Button>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              onSave(popupStrokes);
              onClose();
            }}
          >
            Done
          </Button>
        </div>
      </div>
    );
  };

  // New function to print player data clearly to console
  const logPlayerData = () => {
  players.forEach((player) => {
    console.log(`Player: ${player.name}`);
    player.holes.forEach((hole) => {
      const strokesDisplay = hole.strokes === 0 ? " " : hole.strokes;
      console.log(`  Hole ${hole.holeNumber}: Strokes = ${strokesDisplay}`);
    });
  });
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
        <Button
          variant="ghost"
          onClick={() => setCurrentHoleIndex((i) => Math.max(0, i - 1))}
        >
          <ChevronLeft />
        </Button>
        <div className="font-bold text-lg">Hole {currentHoleIndex + 1}</div>
        <Button
          variant="ghost"
          onClick={() => setCurrentHoleIndex((i) => Math.min(17, i + 1))}
        >
          <ChevronRight />
        </Button>
      </div>

      {/* Player Cards */}
      {players.map((player) => {
        const hole = player.holes[currentHoleIndex];
        const score = calculateCurrentScore(player);
        return (
          <Card
            key={player.id}
            className="p-4 cursor-pointer"
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("button")) return;
              toggleExpanded(player.id);
            }}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{player.name}</div>
                <div className="text-sm text-muted-foreground">
                  Score: {score > 0 ? `+${score}` : score} (
                  {hole.strokes || "0"})
                </div>
              </div>
              <Button
                className="rounded-full h-10 w-10 p-0 flex items-center justify-center text-base"
                variant="outline"
                onClick={() => setPopup({ playerId: player.id })}
              >
                {hole.strokes > 0
                  ? hole.strokes
                  : DEFAULT_PAR[currentHoleIndex]}
              </Button>
            </div>

            {expandedPlayerIds.has(player.id) && renderFullScorecard(player)}
            {popup.playerId === player.id && (
              <StrokePopup
                player={player}
                holeIndex={currentHoleIndex}
                par={DEFAULT_PAR[currentHoleIndex]}
                initialStrokes={
                  player.holes[currentHoleIndex].strokes &&
                  player.holes[currentHoleIndex].strokes > 0
                    ? player.holes[currentHoleIndex].strokes
                    : DEFAULT_PAR[currentHoleIndex]
                }
                onSave={(newStrokes) =>
                  updateHole(player.id, currentHoleIndex, "strokes", newStrokes)
                }
                onClose={() => setPopup({ playerId: null })}
              />
            )}
          </Card>
        );
      })}

      {/* Actions */}
      <div className="flex justify-between pt-2 space-x-2">
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
            toast({ title: "Scores saved!" });
            console.log("Final Scores:");
            players.forEach((player) => {
              let totalStrokes = 0;
              let totalPar = 0;
              console.log(`\n${player.name}`);
              player.holes.forEach((hole, i) => {
                const strokes = hole.strokes || DEFAULT_PAR[i];
                totalStrokes += strokes;
                totalPar += DEFAULT_PAR[i];
                console.log(`  Hole ${i + 1}: ${strokes} (${DEFAULT_PAR[i]})`);
              });
              const scoreRelative = totalStrokes - totalPar;
              const scoreStr =
                scoreRelative === 0
                  ? "0"
                  : scoreRelative > 0
                  ? `+${scoreRelative}`
                  : `${scoreRelative}`;
              console.log(`  Total: ${totalStrokes} (${scoreStr})`);
            });
          }}
        >
          Save All
        </Button>

        <Button variant="outline" onClick={logPlayerData}>
          Print Data to Console
        </Button>
      </div>
    </div>
  );
};
