// StartRound.tsx
import { useState } from "react";
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
import { useEffect } from "react";
import api from "@/api/axios";

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
  tees: Tee[];
}

export const StartRound = ({ onStart, tees }: StartRoundProps) => {
  const [players, setPlayers] = useState<BasicPlayer[]>([
    { id: "1", name: "You" },
  ]);
  const [newName, setNewName] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedTee, setSelectedTee] = useState<string>("");
  const [roundDate, setRoundDate] = useState<Date>(new Date());
  const [roundTitle, setRoundTitle] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get("/courses");
        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setIsLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  const addPlayer = () => {
    if (!newName.trim()) return;
    setPlayers([
      ...players,
      { id: Date.now().toString(), name: newName.trim() },
    ]);
    setNewName("");
  };

  const filteredTees = selectedCourse
    ? tees?.filter((tee) => tee.courseId === selectedCourse)
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
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Start New Round</h2>

      <div className="space-y-2">
        <label className="text-sm font-medium text-white">
          Round Title (Optional)
        </label>
        <Input
          className="bg-slate-800 text-white"
          value={roundTitle}
          onChange={(e) => setRoundTitle(e.target.value)}
          placeholder="e.g. Weekend Game, Tournament, etc."
        />
      </div>

      {/* Course Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white">Course</label>
        <Select
          onValueChange={setSelectedCourse}
          value={selectedCourse}
          disabled={isLoadingCourses}
        >
          <SelectTrigger className="bg-slate-800 text-white">
            <SelectValue
              placeholder={
                isLoadingCourses ? "Loading courses..." : "Select a course"
              }
            />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 text-white">
            {isLoadingCourses ? (
              <SelectItem disabled value="loading">
                Loading...
              </SelectItem>
            ) : courses.length > 0 ? (
              courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem disabled value="none">
                No courses available
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Tee Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white">Tee</label>
        <Select
          onValueChange={setSelectedTee}
          value={selectedTee}
          disabled={!selectedCourse}
        >
          <SelectTrigger className="bg-slate-800 text-white">
            <SelectValue
              placeholder={
                !selectedCourse
                  ? "Select a course first"
                  : filteredTees?.length
                  ? "Select a tee"
                  : "No tees available"
              }
            />
          </SelectTrigger>

          <SelectContent className="bg-slate-800 text-white z-50">
            {selectedCourse ? (
              Array.isArray(filteredTees) && filteredTees.length > 0 ? (
                filteredTees.map((tee) => (
                  <SelectItem
                    key={tee?.id || `tee-${Math.random()}`}
                    value={tee?.id || ""}
                    className="hover:bg-slate-700"
                  >
                    {tee?.name || "Unnamed Tee"}
                  </SelectItem>
                ))
              ) : (
                <SelectItem disabled value="no-tees">
                  No tees available for this course
                </SelectItem>
              )
            ) : (
              <SelectItem disabled value="select-course-first">
                Please select a course first
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Date Picker */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white">Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className="w-full justify-start text-left font-normal bg-slate-800 text-white hover:bg-slate-700"
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
        {players.map((p) => (
          <Card
            key={p.id}
            className="p-3 flex justify-between items-center bg-slate-700 text-white"
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
      </div>

      <Button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        onClick={handleStart}
        disabled={!selectedCourse || !selectedTee}
      >
        Start Round
      </Button>
    </div>
  );
};
