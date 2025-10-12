import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { Hole, ScoreUser as User } from "@/types";

interface ScoreEntryProps {
  initialPlayers: User[];
  roundId: string;
  onExit?: () => void;
}

interface PopupProps {
  player: User;
  holeIndex: number;
  par: number;
  initialStrokes: number;
  onClose: () => void;
  onSave: (strokes: number) => void;
}

const DEFAULT_PAR = [4, 4, 3, 5, 4, 3, 4, 5, 4, 4, 3, 5, 4, 3, 4, 5, 4, 4];

export const ScoreEntry = ({
  initialPlayers,
  roundId,
  onExit,
}: ScoreEntryProps) => {
  const { user } = useUser();
  const [players, setPlayers] = useState<User[]>(initialPlayers);
  const [currentHoleIndex, setCurrentHoleIndex] = useState(0);
  const navigate = useNavigate();
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

  const save = async () => {
    try {
      await api.put(`/rounds/${roundId}/finish`);
      toast({ title: "Scores saved!" });
      navigate("/app");
    } catch (error) {
      console.error("Error finishing round:", error);
      toast({
        title: "Error",
        description: "Failed to finish round.",
        variant: "destructive",
      });
    }
  };

  const toggleExpanded = (playerId: string) => {
    setExpandedPlayerIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(playerId)) newSet.delete(playerId);
      else newSet.add(playerId);
      return newSet;
    });
  };

  const calculateCurrentScore = (player: User) =>
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
        <div className="bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-50 rounded-xl p-6 text-center shadow-md w-72 space-y-4">
          <h2 className="text-xl font-bold">
            {player.name} – Hole {holeIndex + 1}
          </h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">Par {par}</div>
          <div className="flex items-center justify-between">
            <Button
              className="rounded-full bg-gray-300 dark:bg-slate-700 text-gray-800 dark:text-gray-50 hover:bg-gray-400 dark:hover:bg-slate-600"
              onClick={() => setPopupStrokes((prev) => Math.max(0, prev - 1))}
            >
              <ChevronLeft size={20} />
            </Button>
            <div className="text-4xl font-semibold">{popupStrokes}</div>
            <Button
              className="rounded-full bg-gray-300 dark:bg-slate-700 text-gray-800 dark:text-gray-50 hover:bg-gray-400 dark:hover:bg-slate-600"
              onClick={() => setPopupStrokes((prev) => prev + 1)}
            >
              <ChevronRight size={20} />
            </Button>
          </div>
          <Button
            className="w-full bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700"
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

  const renderFullScorecard = (player: User) => {
    const holeNumbers = Array.from({ length: 18 }, (_, i) => i + 1);
    const parNumbers = DEFAULT_PAR;

    const renderScoreCell = (hole: Hole, index: number) => {
      const strokes = hole.strokes;
      const displayScore =
        index <= currentHoleIndex
          ? strokes === 0
            ? ""
            : strokes != null
            ? strokes
            : DEFAULT_PAR[index]
          : "";
      const isCurrentHole = index === currentHoleIndex;
      const scoreDiff = strokes - DEFAULT_PAR[index];
      let scoreColorClass = "text-gray-900 dark:text-gray-50";

      if (strokes > 0) {
        if (scoreDiff < 0) scoreColorClass = "text-green-600 dark:text-green-400";
        else if (scoreDiff > 0) scoreColorClass = "text-red-600 dark:text-red-400";
      }

      return (
        <div
          key={hole.holeNumber}
          className={`flex-1 text-center py-2 transition-colors duration-200 ${
            isCurrentHole ? "bg-gray-200 dark:bg-slate-700 rounded" : ""
          }`}
        >
          <div className="text-xs font-light text-gray-600 dark:text-gray-400">
            {hole.holeNumber}
          </div>
          <div className={`text-sm font-semibold ${scoreColorClass}`}>
            {displayScore}
          </div>
        </div>
      );
    };

    return (
      <div className="mt-4 space-y-4">
        <div className="grid grid-cols-10 gap-1 text-center font-bold text-gray-600 dark:text-gray-400">
          <div className="col-span-1"></div>
          {holeNumbers.slice(0, 9).map((num) => (
            <div key={num} className="col-span-1">
              {num}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-10 gap-1 text-center">
          <div className="col-span-1 font-bold text-gray-600 dark:text-gray-400">Par</div>
          {parNumbers.slice(0, 9).map((par, i) => (
            <div key={i} className="col-span-1 text-sm text-gray-700 dark:text-gray-200">
              {par}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-10 gap-1 text-center">
          <div className="col-span-1 font-bold text-gray-600 dark:text-gray-400">Score</div>
          {player.holes.slice(0, 9).map((hole, i) => (
            <div key={i} className="col-span-1">
              {renderScoreCell(hole, i)}
            </div>
          ))}
        </div>
        <hr className="border-gray-300 dark:border-slate-700" />
        <div className="grid grid-cols-10 gap-1 text-center font-bold text-gray-600 dark:text-gray-400">
          <div className="col-span-1"></div>
          {holeNumbers.slice(9, 18).map((num) => (
            <div key={num} className="col-span-1">
              {num}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-10 gap-1 text-center">
          <div className="col-span-1 font-bold text-gray-600 dark:text-gray-400">Par</div>
          {parNumbers.slice(9, 18).map((par, i) => (
            <div key={i} className="col-span-1 text-sm text-gray-700 dark:text-gray-200">
              {par}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-10 gap-1 text-center">
          <div className="col-span-1 font-bold text-gray-600 dark:text-gray-400">Score</div>
          {player.holes.slice(9, 18).map((hole, i) => (
            <div key={i} className="col-span-1">
              {renderScoreCell(hole, i + 9)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const logPlayerData = () => {
    players.forEach((player) => {
      console.log(`Player: ${player.name}`);
      player.holes.forEach((hole) => {
        const strokesDisplay = hole.strokes === 0 ? " " : hole.strokes;
        console.log(`  Hole ${hole.holeNumber}: Strokes = ${strokesDisplay}`);
      });
    });
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-50 min-h-screen p-4 space-y-6">
      {/* Back Button */}
      {onExit && (
        <Button
          variant="ghost"
          onClick={onExit}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-50"
        >
          ← Back to Start
        </Button>
      )}

      {/* Hole Navigation */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg">
        <Button
          variant="ghost"
          onClick={() => setCurrentHoleIndex((i) => Math.max(0, i - 1))}
          className="rounded-full h-10 w-10 p-0 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-50"
        >
          <ChevronLeft />
        </Button>
        <div className="font-bold text-2xl text-gray-900 dark:text-gray-50">
          Hole {currentHoleIndex + 1}
        </div>
        <Button
          variant="ghost"
          onClick={() => setCurrentHoleIndex((i) => Math.min(17, i + 1))}
          className="rounded-full h-10 w-10 p-0 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-50"
        >
          <ChevronRight />
        </Button>
      </div>

      {/* Player Cards */}
      {players.map((player) => {
        const hole = player.holes[currentHoleIndex];
        const score = calculateCurrentScore(player);
        const scoreDisplay =
          score > 0 ? `+${score}` : score === 0 ? "E" : score;
        const currentHoleStrokes = hole.strokes > 0 ? hole.strokes : "-";

        return (
          <Card
            key={player.id}
            className="p-4 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-50 rounded-xl shadow-lg cursor-pointer transition-transform duration-200 hover:scale-[1.01]"
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("button")) return;
              toggleExpanded(player.id);
            }}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="font-bold text-lg text-gray-900 dark:text-gray-50">
                  {player.name}
                </div>
                {player.id !== user?.id && (
                  <span className="text-xs bg-blue-600 dark:bg-blue-700 text-blue-100 px-2 py-1 rounded-full font-medium">
                    Friend
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  <span className="font-bold text-gray-900 dark:text-gray-50">Score:</span>{" "}
                  {scoreDisplay}
                </div>
                <Button
                  className="rounded-full h-12 w-12 p-0 flex items-center justify-center text-lg font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPopup({ playerId: player.id });
                  }}
                >
                  {currentHoleStrokes}
                </Button>
              </div>
            </div>

            {expandedPlayerIds.has(player.id) && renderFullScorecard(player)}
            {popup.playerId === player.id && (
              <StrokePopup
                player={player}
                holeIndex={currentHoleIndex}
                par={DEFAULT_PAR[currentHoleIndex]}
                initialStrokes={
                  player.holes[currentHoleIndex].strokes > 0
                    ? player.holes[currentHoleIndex].strokes
                    : DEFAULT_PAR[currentHoleIndex]
                }
                onSave={async (newStrokes) => {
                  updateHole(
                    player.id,
                    currentHoleIndex,
                    "strokes",
                    newStrokes
                  );

                  try {
                    const url = `/rounds/${roundId}/score/${player.id}/${
                      currentHoleIndex + 1
                    }`;
                    const payload = {
                      strokes: newStrokes,
                      putts: player.holes[currentHoleIndex].putts || 0,
                    };
                    await api.put(url, payload);
                    toast({
                      title: "Score updated!",
                      description: `Hole ${currentHoleIndex + 1} for ${
                        player.name
                      } saved.`,
                    });
                  } catch (err) {
                    console.error("Error updating score:", err);
                    toast({
                      title: "Error",
                      description: "Failed to save score.",
                      variant: "destructive",
                    });
                  }
                }}
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
          className="bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-gray-400 border-gray-300 dark:border-slate-700 hover:bg-gray-300 dark:hover:bg-slate-700 hover:text-gray-800 dark:hover:text-gray-50"
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
          className="bg-green-600 text-white hover:bg-green-700"
          onClick={() => save()}
        >
          Save All
        </Button>
      </div>
    </div>
  );
};