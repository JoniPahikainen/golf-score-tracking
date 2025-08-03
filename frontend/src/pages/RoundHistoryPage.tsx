
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Target, Eye } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface Round {
  id: string;
  date: string;
  courseId: string;
  totalScore: number;
  holes: Array<{
    holeNumber: number;
    strokes: number;
    putts?: number;
  }>;
}

export const RoundHistory = () => {
  const [rounds] = useState<Round[]>([
    {
      id: "1",
      date: "2024-01-15",
      courseId: "Pebble Beach Golf Links",
      totalScore: 89,
      holes: Array.from({ length: 18 }, (_, i) => ({
        holeNumber: i + 1,
        strokes: Math.floor(Math.random() * 6) + 3,
        putts: Math.floor(Math.random() * 3) + 1,
      })),
    },
    {
      id: "2", 
      date: "2024-01-10",
      courseId: "Augusta National",
      totalScore: 92,
      holes: Array.from({ length: 18 }, (_, i) => ({
        holeNumber: i + 1,
        strokes: Math.floor(Math.random() * 6) + 3,
        putts: Math.floor(Math.random() * 3) + 1,
      })),
    },
    {
      id: "3",
      date: "2024-01-05",
      courseId: "St. Andrews Old Course",
      totalScore: 85,
      holes: Array.from({ length: 18 }, (_, i) => ({
        holeNumber: i + 1,
        strokes: Math.floor(Math.random() * 6) + 3,
        putts: Math.floor(Math.random() * 3) + 1,
      })),
    },
  ]);
  const navigate = useNavigate();

  const getScoreBadgeColor = (score: number) => {
    if (score < 80) return "bg-green-500";
    if (score < 90) return "bg-yellow-500";
    return "bg-red-500";
  };

  const calculateAverage = () => {
    if (rounds.length === 0) return 0;
    return Math.round(rounds.reduce((sum, round) => sum + round.totalScore, 0) / rounds.length);
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{rounds.length}</div>
              <div className="text-sm text-muted-foreground">Rounds Played</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{calculateAverage()}</div>
              <div className="text-sm text-muted-foreground">Average Score</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{Math.min(...rounds.map(r => r.totalScore))}</div>
              <div className="text-sm text-muted-foreground">Best Score</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rounds List */}
      <div className="space-y-4">
        {rounds.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No rounds recorded yet. Start tracking your golf scores!</p>
            </CardContent>
          </Card>
        ) : (
          rounds.map((round) => (
            <Card key={round.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {round.courseId}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(round.date), "MMMM d, yyyy")}
                    </div>
                  </div>
                  <Badge 
                    className={`${getScoreBadgeColor(round.totalScore)} text-white`}
                  >
                    {round.totalScore}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    18 holes • {round.holes.reduce((sum, hole) => sum + (hole.putts || 0), 0)} total putts
                  </div>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};