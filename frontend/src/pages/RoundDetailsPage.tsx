import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Target,
  Trophy,
  Users,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";
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
    scores: Array<{
      holeNumber: number;
      strokes: number;
      putts?: number;
    }>;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface Course {
  id: string;
  name: string;
  location?: string;
}

interface User {
  id: string;
  userName: string;
  firstName?: string;
  lastName?: string;
}

export const RoundDetailsPage = () => {
  const { roundId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [round, setRound] = useState<Round | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [players, setPlayers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoundDetails = async () => {
      if (!roundId) {
        setError("Round ID not provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch round details
        const roundResponse = await api.get(`/rounds/${roundId}`);
        if (roundResponse.data.success) {
          const roundData = roundResponse.data.data;
          setRound(roundData);

          // Fetch course details
          if (roundData.courseId) {
            const courseResponse = await api.get(`/courses/${roundData.courseId}`);
            if (courseResponse.data.success) {
              setCourse(courseResponse.data.data);
            }
          }

          // Fetch player details
          const playerIds = roundData.players.map((p: any) => p.userId);
          const playerPromises = playerIds.map((playerId: string) =>
            api.get(`/users/${playerId}`).catch(() => null)
          );
          
          const playerResponses = await Promise.all(playerPromises);
          const validPlayers = playerResponses
            .filter(response => response?.data.success)
            .map(response => response.data.data);
          
          setPlayers(validPlayers);
        }
      } catch (error) {
        console.error("Error fetching round details:", error);
        setError("Failed to load round details");
        toast({
          title: "Error",
          description: "Failed to load round details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoundDetails();
  }, [roundId, toast]);

  const getScoreBadgeColor = (score: number) => {
    if (score < 80) return "bg-green-500";
    if (score < 90) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getPlayerName = (userId: string) => {
    const player = players.find(p => p.id === userId);
    if (player) {
      return player.firstName && player.lastName 
        ? `${player.firstName} ${player.lastName}`
        : player.userName;
    }
    return `Player ${userId.slice(-4)}`;
  };

  const getUserScore = (round: Round) => {
    const userPlayer = round.players.find(p => p.userId === user?.id);
    return userPlayer?.totalScore || 0;
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-300">Loading round details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !round) {
    return (
      <div className="space-y-6 p-4 md:p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error || "Round not found"}</p>
            <Button onClick={() => navigate("/app")}>
              Back to Rounds
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 dark:text-gray-300">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/app")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Round Details
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {course?.name || round.courseId}
          </p>
        </div>
      </div>

      {/* Round Info */}
      <Card className="shadow-md rounded-2xl dark:outline dark:outline-gray-700">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg dark:text-gray-300">
            <MapPin className="h-5 w-5 text-blue-500" />
            Round Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {format(new Date(round.date), "MMMM d, yyyy")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Tee: {round.teeName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {round.players.length} player{round.players.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Status: {round.status || 'Completed'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Player Scores */}
      <Card className="shadow-md rounded-2xl dark:outline dark:outline-gray-700">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg dark:text-gray-300">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Player Scores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {round.players.map((player, index) => (
              <div
                key={player.userId}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {getPlayerName(player.userId)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {player.totalPutts ? `${player.totalPutts} putts` : 'No putts recorded'}
                    </p>
                  </div>
                </div>
                <Badge
                  className={`${getScoreBadgeColor(player.totalScore)} text-white text-lg px-4 py-2 rounded-full`}
                >
                  {player.totalScore}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hole-by-Hole Scores */}
      <Card className="shadow-md rounded-2xl dark:outline dark:outline-gray-700">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg dark:text-gray-300">Hole-by-Hole Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                    Hole
                  </th>
                  {round.players.map((player) => (
                    <th
                      key={player.userId}
                      className="text-center py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-300"
                    >
                      {getPlayerName(player.userId)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 18 }, (_, holeIndex) => (
                  <tr key={holeIndex + 1} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 px-3 text-sm font-medium text-gray-900 dark:text-white">
                      {holeIndex + 1}
                    </td>
                    {round.players.map((player) => {
                      const holeScore = player.scores.find(s => s.holeNumber === holeIndex + 1);
                      return (
                        <td
                          key={player.userId}
                          className="text-center py-2 px-3 text-sm text-gray-900 dark:text-white"
                        >
                          {holeScore ? (
                            <div>
                              <div className="font-medium">{holeScore.strokes}</div>
                              {holeScore.putts && (
                                <div className="text-xs text-gray-500">
                                  ({holeScore.putts})
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
