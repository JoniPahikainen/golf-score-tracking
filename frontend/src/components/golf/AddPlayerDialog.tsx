import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BasicPlayer } from "./StartRound";

interface AddPlayerDialogProps {
  onAddPlayer: (player: BasicPlayer) => void;
  existingPlayers: BasicPlayer[];
  friends: BasicPlayer[];
  trigger: React.ReactNode;
}

export const AddPlayerDialog = ({ onAddPlayer, existingPlayers, friends, trigger }: AddPlayerDialogProps) => {
  const [addMode, setAddMode] = useState<"friend" | "guest">("guest");
  const [newName, setNewName] = useState("");
  const [selectedFriend, setSelectedFriend] = useState<string>("");


  const addPlayer = () => {
    if (addMode === "guest") {
      if (!newName.trim()) return;
      onAddPlayer({ id: Date.now().toString(), name: newName.trim() });
      setNewName("");
    } else if (addMode === "friend") {
      if (!selectedFriend) return;
      const friend = friends.find((f) => f.id === selectedFriend);
      if (friend && !existingPlayers.some((p) => p.id === friend.id)) {
        onAddPlayer(friend);
      }
      setSelectedFriend("");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Add Player</DialogTitle>
        </DialogHeader>

        {/* Player Type Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Player Type</label>
          <div className="flex gap-2">
            <Button
              variant={addMode === "guest" ? "default" : "outline"}
              size="sm"
              onClick={() => setAddMode("guest")}
              className={`flex-1 ${
                addMode === "guest"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-slate-700 text-white border-slate-600 hover:bg-slate-600"
              }`}
            >
              <User className="w-4 h-4 mr-1" />
              Guest
            </Button>
            <Button
              variant={addMode === "friend" ? "default" : "outline"}
              size="sm"
              onClick={() => setAddMode("friend")}
              className={`flex-1 ${
                addMode === "friend"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-slate-700 text-white border-slate-600 hover:bg-slate-600"
              }`}
            >
              <Users className="w-4 h-4 mr-1" />
              Friend
            </Button>
          </div>
        </div>

        {/* Input Section */}
        {addMode === "guest" ? (
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Guest Name</label>
            <Input
              className="bg-slate-700 text-white border-slate-600"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addPlayer()}
              placeholder="Enter guest name"
              autoFocus
            />
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Select Friend</label>
            <Select value={selectedFriend} onValueChange={setSelectedFriend}>
              <SelectTrigger className="bg-slate-700 text-white border-slate-600">
                <SelectValue placeholder="Choose a friend" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 text-white border-slate-600">
                {friends
                  .filter((f) => !existingPlayers.some((p) => p.id === f.id))
                  .map((friend) => (
                    <SelectItem key={friend.id} value={friend.id}>
                      {friend.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            className="bg-slate-700 text-white border-slate-600 hover:bg-slate-600"
          >
            Cancel
          </Button>
          <Button
            onClick={addPlayer}
            disabled={
              addMode === "guest" ? !newName.trim() : !selectedFriend
            }
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Add Player
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
