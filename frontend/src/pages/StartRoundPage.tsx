// StartRound.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";

export interface BasicPlayer {
  id: string;
  name: string;
}

interface StartRoundProps {
  onStart: (players: BasicPlayer[]) => void;
}

export const StartRound = ({ onStart }: StartRoundProps) => {
  const [players, setPlayers] = useState<BasicPlayer[]>([{ id: "1", name: "You" }]);
  const [newName, setNewName] = useState("");

  const addPlayer = () => {
    if (!newName.trim()) return;
    setPlayers([...players, { id: Date.now().toString(), name: newName.trim() }]);
    setNewName("");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Start New Round</h2>
      {players.map((p) => (
        <Card key={p.id} className="p-3 flex justify-between items-center bg-slate-700 text-white">
          <span>{p.name}</span>
          {p.id !== "1" && (
            <Button size="sm" variant="ghost" onClick={() => setPlayers(players.filter((pl) => pl.id !== p.id))}>
              <X className="w-4 h-4 text-red-500" />
            </Button>
          )}
        </Card>
      ))}
      <div className="flex gap-2">
        <Input
          className="bg-slate-800 text-white"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addPlayer()}
          placeholder="Add player"
        />
        <Button onClick={addPlayer}>Add</Button>
      </div>
      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => onStart(players)}>
        Start Round
      </Button>
    </div>
  );
};
