import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

export interface BasicPlayer {
  id: string;
  name: string;
}

interface Course {
  id: string;
  name: string;
}

interface Tee {
  id: string;
  name: string;
  courseId: string;
}

interface StartRoundProps {
  onStart: (data: {
    players: BasicPlayer[];
    courseId: string;
    teeId: string;
    date: Date;
    title?: string;
  }) => void;
  tees: {
    id: string;
    name: string;
    color?: string;
    courseId: string;
  }[];
  courses: Course[];
  onCourseSelect: (courseId: string) => void;
  isLoadingTees: boolean;
}

export const StartRound = ({ onStart, tees, courses, onCourseSelect }: StartRoundProps) => {
  const [players, setPlayers] = useState<BasicPlayer[]>([
    { id: "1", name: "You" },
  ]);
  const [newName, setNewName] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedTee, setSelectedTee] = useState<string>("");
  const [roundDate, setRoundDate] = useState<Date>(new Date());
  const [roundTitle, setRoundTitle] = useState("");
  const [isLoadingTees, setIsLoadingTees] = useState(false);

  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId);
    setSelectedTee("");
    if (courseId) {
      setIsLoadingTees(true);
      onCourseSelect(courseId);
      setIsLoadingTees(false);
    }
  };

  const addPlayer = () => {
    if (!newName.trim()) return;
    setPlayers([
      ...players,
      { id: Date.now().toString(), name: newName.trim() },
    ]);
    setNewName("");
  };

  const filteredTees = selectedCourse
    ? tees.filter((tee) => tee.courseId === selectedCourse)
    : [];

  const handleStart = () => {
    if (!selectedCourse || !selectedTee) return;
    onStart({
      players,
      courseId: selectedCourse,
      teeId: selectedTee,
      date: roundDate,
      title: roundTitle || undefined,
    });
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Start New Round</h2>

      {/* Round Title */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white">
          Round Title (Optional)
        </label>
        <Input
          className="bg-slate-800 text-white border-slate-700"
          value={roundTitle}
          onChange={(e) => setRoundTitle(e.target.value)}
          placeholder="e.g. Weekend Game, Tournament, etc."
        />
      </div>

      {/* Course Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Course</label>
          <Select
            onValueChange={handleCourseChange}
            value={selectedCourse}
            disabled={courses.length === 0}
          >
            <SelectTrigger className="bg-slate-800 text-white border-slate-700">
              <SelectValue
                placeholder={Array.isArray(courses) && courses.length ? "Select a course" : "Loading courses..."}
              />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 text-white border-slate-700">
              {Array.isArray(courses) && courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tee Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Tee</label>
          <Select
            onValueChange={setSelectedTee}
            value={selectedTee}
            disabled={!selectedCourse || isLoadingTees}
          >
            <SelectTrigger className="bg-slate-800 text-white border-slate-700">
              <SelectValue
                placeholder={
                  isLoadingTees
                    ? "Loading tees..."
                    : !selectedCourse
                    ? "Select a course first"
                    : filteredTees.length
                    ? "Select a tee"
                    : "No tees available"
                }
              />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 text-white border-slate-700">
              {filteredTees.map((tee) => (
                <SelectItem key={tee.id} value={tee.id}>
                  {tee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Date Picker */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white">Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className="w-full justify-start text-left font-normal bg-slate-800 text-white hover:bg-slate-700 border-slate-700"
            >
              <Calendar className="mr-2 h-4 w-4" />
              {format(roundDate, "PPP")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700">
            <input
              type="date"
              className="bg-slate-800 text-white p-2 rounded-md border border-slate-700"
              value={format(roundDate, "yyyy-MM-dd")}
              onChange={(e) => setRoundDate(new Date(e.target.value))}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Players Section */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white">Players</label>
        <div className="space-y-2">
          {players.map((p) => (
            <Card
              key={p.id}
              className="p-3 flex justify-between items-center bg-slate-800 text-white border-slate-700"
            >
              <span>{p.name}</span>
              {p.id !== "1" && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setPlayers(players.filter((pl) => pl.id !== p.id))
                  }
                >
                  <X className="w-4 h-4 text-red-500" />
                </Button>
              )}
            </Card>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            className="bg-slate-800 text-white border-slate-700 flex-1"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addPlayer()}
            placeholder="Add player"
          />
          <Button onClick={addPlayer}>Add</Button>
        </div>
      </div>

      <Button
        className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white"
        onClick={handleStart}
        disabled={!selectedCourse || !selectedTee}
      >
        Start Round
      </Button>
    </div>
  );
};