import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, RotateCcw, Plus, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Hole {
  holeNumber: number;
  strokes: number;
  putts: number;
  fairwayHit?: boolean;
  greenInReg?: boolean;
}

interface Player {
  id: string;
  name: string;
  holes: Hole[];
}

const DEFAULT_PAR = [4, 4, 3, 5, 4, 3, 4, 5, 4, 4, 3, 5, 4, 3, 4, 5, 4, 4]; // Sample course par

export const ScoreEntry = () => {
  const [players, setPlayers] = useState<Player[]>([
    {
      id: "1",
      name: "You",
      holes: Array.from({ length: 18 }, (_, i) => ({
        holeNumber: i + 1,
        strokes: 0,
        putts: 0,
        fairwayHit: false,
        greenInReg: false,
      })),
    },
  ]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [currentHoleIndex, setCurrentHoleIndex] = useState(0);
  const { toast } = useToast();

  const addPlayer = () => {
    if (!newPlayerName.trim()) return;

    setPlayers([
      ...players,
      {
        id: Date.now().toString(),
        name: newPlayerName,
        holes: Array.from({ length: 18 }, (_, i) => ({
          holeNumber: i + 1,
          strokes: 0,
          putts: 0,
          fairwayHit: false,
          greenInReg: false,
        })),
      },
    ]);
    setNewPlayerName("");
  };

  const removePlayer = (id: string) => {
    setPlayers(players.filter((player) => player.id !== id));
  };

  const updateHole = (
    playerId: string,
    holeIndex: number,
    field: keyof Hole,
    value: any
  ) => {
    setPlayers(
      players.map((player) => {
        if (player.id === playerId) {
          const newHoles = [...player.holes];
          newHoles[holeIndex] = { ...newHoles[holeIndex], [field]: value };
          return { ...player, holes: newHoles };
        }
        return player;
      })
    );
  };

  const calculateTotal = (player: Player) => {
    return player.holes.reduce((total, hole, index) => {
      return total + (hole.strokes - DEFAULT_PAR[index]);
    }, 0);
  };

  const calculateCurrentScore = (player: Player, upToHoleIndex: number) => {
    return player.holes.slice(0, upToHoleIndex + 1).reduce((total, hole, index) => {
      return total + (hole.strokes - DEFAULT_PAR[index]);
    }, 0);
  };

  const findNextUnmarkedHole = () => {
    for (let i = currentHoleIndex + 1; i < 18; i++) {
      if (players.some(p => p.holes[i].strokes === 0)) {
        return i;
      }
    }
    return currentHoleIndex; // stay on current if all marked
  };

  const handleNextHole = () => {
    const nextUnmarked = findNextUnmarkedHole();
    setCurrentHoleIndex(nextUnmarked);
  };

  const handlePreviousHole = () => {
    if (currentHoleIndex > 0) {
      setCurrentHoleIndex(currentHoleIndex - 1);
    }
  };

  const renderHoleInput = (player: Player) => {
    const hole = player.holes[currentHoleIndex];
    const par = DEFAULT_PAR[currentHoleIndex];
    const relativeScore = hole.strokes - par;
    const currentScore = calculateCurrentScore(player, currentHoleIndex);

    return (
      <div key={player.id} className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">{player.name}</h3>
          <div className={`font-bold ${
            currentScore === 0 ? "text-blue-500" : 
            currentScore < 0 ? "text-green-500" : "text-red-500"
          }`}>
            {currentScore > 0 ? `+${currentScore}` : currentScore}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Strokes (Par {par})</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  updateHole(
                    player.id,
                    currentHoleIndex,
                    "strokes",
                    Math.max(1, hole.strokes - 1)
                  )
                }
              >
                -
              </Button>
              <div className="w-12 text-center text-lg font-medium border rounded py-2">
                {hole.strokes > 0 ? hole.strokes : "-"}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  updateHole(
                    player.id,
                    currentHoleIndex,
                    "strokes",
                    hole.strokes + 1
                  )
                }
              >
                +
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Putts</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  updateHole(
                    player.id,
                    currentHoleIndex,
                    "putts",
                    Math.max(0, hole.putts - 1)
                  )
                }
              >
                -
              </Button>
              <div className="w-12 text-center text-lg font-medium border rounded py-2">
                {hole.putts > 0 ? hole.putts : "-"}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  updateHole(
                    player.id,
                    currentHoleIndex,
                    "putts",
                    hole.putts + 1
                  )
                }
              >
                +
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`${player.id}-fairway`}
              checked={hole.fairwayHit}
              onChange={(e) =>
                updateHole(
                  player.id,
                  currentHoleIndex,
                  "fairwayHit",
                  e.target.checked
                )
              }
              className="h-4 w-4"
            />
            <Label htmlFor={`${player.id}-fairway`}>Fairway Hit</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`${player.id}-gir`}
              checked={hole.greenInReg}
              onChange={(e) =>
                updateHole(
                  player.id,
                  currentHoleIndex,
                  "greenInReg",
                  e.target.checked
                )
              }
              className="h-4 w-4"
            />
            <Label htmlFor={`${player.id}-gir`}>Green in Regulation</Label>
          </div>
        </div>
      </div>
    );
  };

  const handleSave = async () => {
    const hasScores = players.some((player) =>
      player.holes.some((hole) => hole.strokes > 0)
    );

    if (!hasScores) {
      toast({
        title: "Error",
        description: "Please enter scores for at least one hole",
        variant: "destructive",
      });
      return;
    }

    // Integrate with your backend API
    console.log("Saving rounds:", players);

    toast({
      title: "Rounds Saved!",
      description: `Scores saved for ${players.length} players`,
    });
  };

  const handleReset = () => {
    setPlayers(
      players.map((player) => ({
        ...player,
        holes: player.holes.map((hole) => ({
          ...hole,
          strokes: 0,
          putts: 0,
          fairwayHit: false,
          greenInReg: false,
        })),
      }))
    );
  };

  return (
    <div className="space-y-6">
      {/* Current Hole Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousHole}
              disabled={currentHoleIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="text-center">
              <div className="text-xl font-bold">Hole {currentHoleIndex + 1}</div>
              <div className="text-sm text-gray-500">Par {DEFAULT_PAR[currentHoleIndex]}</div>
            </div>
            
            <Button
              variant="outline"
              onClick={handleNextHole}
              disabled={currentHoleIndex === 17}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Player */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Input
              placeholder="Add friend's name"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addPlayer()}
            />
            <Button onClick={addPlayer}>
              <Plus className="h-4 w-4 mr-2" />
              Add Player
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Players Score Input for Current Hole */}
      <Card>
        <CardContent className="pt-6">
          {players.map((player) => (
            <div key={player.id}>
              {renderHoleInput(player)}
              {player.id !== "1" && (
                <div className="flex justify-end mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePlayer(player.id)}
                  >
                    Remove Player
                  </Button>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button
          onClick={handleReset}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset All
        </Button>
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save All Rounds
        </Button>
      </div>
    </div>
  );
};