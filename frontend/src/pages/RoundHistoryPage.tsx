import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  Target,
  Eye,
  Trophy,
  BarChart2,
} from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import api from "@/api/axios";
import { useToast } from "@/hooks/use-toast";

interface Round {
  id: string;
  courseId: string;
  title?: string;
  date: string;
  teeName: string;
  status?: string;
  players: Array<{
    userId: string;
    totalScore: number;
    totalPutts?: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface Course {
  id: string;
  name: string;
  location?: string;
}

export const RoundHistory = () => {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch rounds and courses data
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch rounds for the current user
        const roundsResponse = await api.get(`/rounds/user/${user.id}`);
        if (roundsResponse.data.success) {
          setRounds(roundsResponse.data.data || []);
        }

        // Fetch all courses to get course names
        const coursesResponse = await api.get("/courses");
        if (coursesResponse.data.success) {
          setCourses(coursesResponse.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching rounds data:", error);
        setError("Failed to load rounds data");
        toast({
          title: "Error",
          description: "Failed to load your golf rounds. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.id, toast]);

  // Get course name by ID
  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course?.name || courseId;
  };

  // Get user's score for a round
  const getUserScore = (round: Round) => {
    const userPlayer = round.players.find(p => p.userId === user?.id);
    return userPlayer?.totalScore || 0;
  };

  // Get user's putts for a round
  const getUserPutts = (round: Round) => {
    const userPlayer = round.players.find(p => p.userId === user?.id);
    return userPlayer?.totalPutts || 0;
  };

  const getScoreBadgeColor = (score: number) => {
    if (score < 80) return "bg-green-500";
    if (score < 90) return "bg-yellow-500";
    return "bg-red-500";
  };

  const calculateAverage = () => {
    if (rounds.length === 0) return 0;
    const userScores = rounds
      .map(round => getUserScore(round))
      .filter(score => score > 0);
    
    if (userScores.length === 0) return 0;
    return Math.round(
      userScores.reduce((sum, score) => sum + score, 0) / userScores.length
    );
  };

  const getBestScore = () => {
    const userScores = rounds
      .map(round => getUserScore(round))
      .filter(score => score > 0);
    
    return userScores.length > 0 ? Math.min(...userScores) : 0;
  };

  if (isLoading) {
    return (
      <div className="space-y-10 p-4 md:p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-300">Loading your rounds...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-10 p-4 md:p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 p-4 md:p-8 max-w-5xl mx-auto">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Rounds */}
        <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-green-100 dark:bg-green-900/40 shadow-sm hover:shadow-md transition">
          <Trophy className="h-6 w-6 text-green-600 dark:text-green-400 mb-2" />
          <div className="text-3xl font-bold text-green-700 dark:text-green-400">
            {rounds.length}
          </div>
          <div className="text-sm text-green-600 dark:text-green-300">
            Rounds Played
          </div>
        </div>

        {/* Average Score */}
        <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-purple-100 dark:bg-purple-900/40 shadow-sm hover:shadow-md transition">
          <BarChart2 className="h-6 w-6 text-purple-600 dark:text-purple-400 mb-2" />
          <div className="text-3xl font-bold text-purple-700 dark:text-purple-400">
            {calculateAverage()}
          </div>
          <div className="text-sm text-purple-600 dark:text-purple-300">
            Average Score
          </div>
        </div>

        {/* Best Score */}
        <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-blue-100 dark:bg-blue-900/40 shadow-sm hover:shadow-md transition">
          <Target className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2" />
          <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">
            {getBestScore()}
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-300">
            Best Score
          </div>
        </div>
      </div>

      {/* Rounds List */}
      <div className="space-y-6">
        {rounds.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600 shadow-none rounded-2xl">
            <CardContent className="pt-12 pb-12 text-center text-gray-500 dark:text-gray-300">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No rounds recorded yet. Start tracking your golf scores!</p>
            </CardContent>
          </Card>
        ) : (
          rounds.map((round) => (
            <Card
              key={round.id}
              className="shadow-md rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:scale-[1.01] transition-all"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div>
                      <CardTitle className="text-lg text-gray-900 dark:text-white">
                        {round.title || `Round ${format(new Date(round.date), "MMM d")}`}
                      </CardTitle>
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 mt-1">
                        <MapPin className="h-3 w-3 text-blue-500" />
                        {getCourseName(round.courseId)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mt-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(round.date), "MMMM d, yyyy")}
                    </div>
                  </div>
                  <Badge
                    className={`${getScoreBadgeColor(
                      getUserScore(round)
                    )} text-white text-sm px-3 py-1 rounded-full shadow-sm`}
                  >
                    {getUserScore(round)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex justify-between items-center pt-3">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  18 holes •{" "}
                  {getUserPutts(round)}{" "}
                  total putts
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border border-gray-300 dark:border-gray-700 dark:text-gray-300 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  onClick={() => navigate(`/app/round/${round.id}`)}
                >
                  <Eye className="h-4 w-4" />
                  View
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
