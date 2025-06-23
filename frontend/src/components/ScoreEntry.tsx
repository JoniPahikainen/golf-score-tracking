import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Save, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Hole {
  holeNumber: number;
  strokes: number;
  putts?: number;
  fairwayHit?: boolean;
  greenInReg?: boolean;
}

const COURSE_LIST = [
  "Virpiniemi Golf",
  "Tammer-Golf",
  "Espoo Ringside Golf",
  "Helsinki Golf Club",
  "Kytäjä Golf",
];

export const ScoreEntry = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [courseId, setCourseId] = useState("");
  const [filteredCourses, setFilteredCourses] = useState<string[]>([]);
  const [holes, setHoles] = useState<Hole[]>(
    Array.from({ length: 18 }, (_, i) => ({
      holeNumber: i + 1,
      strokes: 0,
      putts: 0,
      fairwayHit: false,
      greenInReg: false,
    }))
  );
  const { toast } = useToast();

  const handleCourseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setCourseId(input);
    setFilteredCourses(
      input
        ? COURSE_LIST.filter((c) =>
            c.toLowerCase().includes(input.toLowerCase())
          )
        : []
    );
    setCourseId(e.target.value);
  };

  const updateHole = (holeIndex: number, field: keyof Hole, value: any) => {
    setHoles((prev) =>
      prev.map((hole, index) =>
        index === holeIndex ? { ...hole, [field]: value } : hole
      )
    );
  };

  const calculateTotal = () => {
    return holes.reduce((total, hole) => total + hole.strokes, 0);
  };

  const handleSave = async () => {
    const totalScore = calculateTotal();

    if (totalScore === 0) {
      toast({
        title: "Error",
        description: "Please enter scores for at least one hole",
        variant: "destructive",
      });
      return;
    }

    //integrate with your backend API
    console.log("Saving round:", {
      date: format(date, "yyyy-MM-dd"),
      courseId,
      holes,
      totalScore,
    });

    toast({
      title: "Round Saved!",
      description: `Total score: ${totalScore}`,
    });
  };

  const handleReset = () => {
    setHoles((prev) =>
      prev.map((hole) => ({
        ...hole,
        strokes: 0,
        putts: 0,
        fairwayHit: false,
        greenInReg: false,
      }))
    );
  };

  return (
    <div className="space-y-6">
      {/* Round Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="course">Course Name</Label>
          <Input
            id="course"
            placeholder="Enter course name"
            value={courseId}
            /*onChange={(e) => setCourseId(e.target.value)}*/
            onChange={handleCourseChange}
          />
          {filteredCourses.length > 0 && (
            <div className="mt-2 bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
              <ul className="p-2">
                {filteredCourses.map((course) => (
                  <li
                    key={course}
                    className="p-2 hover:bg-green-100 cursor-pointer"
                    onClick={() => {
                      setCourseId(course);
                      setFilteredCourses([]);
                    }}
                  >
                    {course}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Score Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Front Nine */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Front Nine</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              <div className="font-semibold">Hole</div>
              <div className="font-semibold">Strokes</div>
              <div className="font-semibold">Putts</div>
              {holes.slice(0, 9).map((hole, index) => (
                <div key={hole.holeNumber} className="contents">
                  <div className="flex items-center justify-center py-2 bg-green-100 rounded">
                    {hole.holeNumber}
                  </div>
                  <Input
                    type="number"
                    min="0"
                    max="15"
                    value={hole.strokes || ""}
                    onChange={(e) =>
                      updateHole(
                        index,
                        "strokes",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="text-center"
                  />
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={hole.putts || ""}
                    onChange={(e) =>
                      updateHole(index, "putts", parseInt(e.target.value) || 0)
                    }
                    className="text-center"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Back Nine */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Back Nine</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              <div className="font-semibold">Hole</div>
              <div className="font-semibold">Strokes</div>
              <div className="font-semibold">Putts</div>
              {holes.slice(9, 18).map((hole, index) => (
                <div key={hole.holeNumber} className="contents">
                  <div className="flex items-center justify-center py-2 bg-green-100 rounded">
                    {hole.holeNumber}
                  </div>
                  <Input
                    type="number"
                    min="0"
                    max="15"
                    value={hole.strokes || ""}
                    onChange={(e) =>
                      updateHole(
                        index + 9,
                        "strokes",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="text-center"
                  />
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={hole.putts || ""}
                    onChange={(e) =>
                      updateHole(
                        index + 9,
                        "putts",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="text-center"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Total Score */}
      <Card className="bg-green-100">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-800">
              Total Score: {calculateTotal()}
            </div>
          </div>
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
          Reset
        </Button>
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save Round
        </Button>
      </div>
    </div>
  );
};
