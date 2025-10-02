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
import { FullRound as Round, DetailsCourse as Course } from "@/types";

export interface User {
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

  const holes =
    course?.holes ||
    Array.from({ length: 18 }, (_, i) => ({ holeNumber: i + 1, par: 4 }));

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
            const courseResponse = await api.get(
              `/courses/${roundData.courseId}`
            );
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
            .filter((response) => response?.data.success)
            .map((response) => response.data.data);

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

  const getScoreDifferenceClass = (strokes: number, par: number) => {
    const difference = strokes - par;

    if (difference <= -2)
      return "text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded";
    if (difference === -1)
      return "text-green-600 dark:text-green-400 font-semibold bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded";
    if (difference === 0)
      return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 px-2 py-1 rounded";
    if (difference === 1)
      return "text-yellow-600 dark:text-yellow-400 font-semibold bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded";
    return "text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded";
  };

  const getPlayerName = (userId: string) => {
    const player = players.find((p) => p.id === userId);
    if (player) {
      return player.firstName && player.lastName
        ? `${player.firstName} ${player.lastName}`
        : player.userName;
    }
    return `Player ${userId.slice(-4)}`;
  };

  const getUserScore = (round: Round) => {
    const userPlayer = round.players.find((p) => p.userId === user?.id);
    return userPlayer?.totalScore || 0;
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-300">
              Loading round details...
            </p>
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
            <Button onClick={() => navigate("/app")}>Back to Rounds</Button>
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
                {round.players.length} player
                {round.players.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Status: {round.status || "Completed"}
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
                      {player.totalPutts
                        ? `${player.totalPutts} putts`
                        : "No putts recorded"}
                    </p>
                  </div>
                </div>
                <Badge
                  className={`${getScoreBadgeColor(
                    player.totalScore
                  )} text-white text-lg px-4 py-2 rounded-full`}
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
          <CardTitle className="text-lg flex items-center gap-2 dark:text-gray-300">
            <Target className="h-5 w-5 text-indigo-500" />
            Scorecard Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-1">
              <thead className="sticky top-0 z-10 bg-white dark:bg-gray-900">
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="sticky left-0 bg-white dark:bg-gray-900 text-left py-2 px-3 text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 min-w-[100px] z-20">
                    HOLE
                  </th>
                  {round.players.map((player) => (
                    <th
                      key={player.userId}
                      className="text-center py-2 px-3 text-xs md:text-sm font-medium text-gray-800 dark:text-white min-w-[80px]"
                    >
                      {getPlayerName(player.userId).split(" ")[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Front 9 Holes */}
                {holes.slice(0, 9).map((hole, index) => (
                  <tr
                    key={hole.holeNumber}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="sticky left-0 bg-white dark:bg-gray-900 py-2 px-3 text-sm font-medium text-gray-900 dark:text-white border-r dark:border-gray-700 z-10">
                      <span className="font-bold">{hole.holeNumber}</span>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">
                        {" "}
                        (Par {hole.par})
                      </span>
                    </td>
                    {round.players.map((player) => {
                      const score = player.scores?.find(
                        (s) => s.holeNumber === hole.holeNumber
                      );
                      const strokes = score?.strokes || 0;
                      const par = hole.par || 4;

                      return (
                        <td
                          key={player.userId}
                          className="text-center py-2 px-3 text-sm text-gray-900 dark:text-white"
                        >
                          {strokes > 0 ? (
                            <div
                              className={`inline-flex items-center justify-center ${getScoreDifferenceClass(
                                strokes,
                                par
                              )}`}
                            >
                              {strokes}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* OUT (Front 9) Summary */}
                <tr className="bg-blue-50 dark:bg-blue-900/50 border-y-2 border-blue-200 dark:border-blue-800 font-semibold">
                  <td className="sticky left-0 bg-blue-50 dark:bg-blue-900/50 py-2 px-3 text-sm font-extrabold text-blue-700 dark:text-blue-300 border-r dark:border-blue-800 z-10">
                    OUT
                  </td>
                  {round.players.map((player) => {
                    const frontNineScores =
                      player.scores?.filter((s) => s.holeNumber <= 9) || [];
                    const totalStrokes = frontNineScores.reduce(
                      (sum, s) => sum + (s.strokes || 0),
                      0
                    );
                    const frontNinePar = holes
                      .slice(0, 9)
                      .reduce((sum, hole) => sum + hole.par, 0);
                    const relativeToPar = totalStrokes - frontNinePar;

                    return (
                      <td key={player.userId} className="text-center py-2 px-3">
                        <div className="flex flex-col items-center">
                          <span className="text-base font-bold text-blue-700 dark:text-blue-300">
                            {totalStrokes > 0 ? totalStrokes : "-"}
                          </span>
                          {totalStrokes > 0 && (
                            <span
                              className={`text-xs ${
                                relativeToPar > 0
                                  ? "text-red-500"
                                  : relativeToPar < 0
                                  ? "text-green-500"
                                  : "text-blue-500"
                              }`}
                            >
                              {relativeToPar > 0
                                ? `+${relativeToPar}`
                                : relativeToPar}
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Back 9 Holes */}
                {holes.slice(9, 18).map((hole, index) => (
                  <tr
                    key={hole.holeNumber}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="sticky left-0 bg-white dark:bg-gray-900 py-2 px-3 text-sm font-medium text-gray-900 dark:text-white border-r dark:border-gray-700 z-10">
                      <span className="font-bold">{hole.holeNumber}</span>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">
                        {" "}
                        (Par {hole.par})
                      </span>
                    </td>
                    {round.players.map((player) => {
                      const score = player.scores?.find(
                        (s) => s.holeNumber === hole.holeNumber
                      );
                      const strokes = score?.strokes || 0;
                      const par = hole.par || 4;

                      return (
                        <td
                          key={player.userId}
                          className="text-center py-2 px-3 text-sm text-gray-900 dark:text-white"
                        >
                          {strokes > 0 ? (
                            <div
                              className={`inline-flex items-center justify-center ${getScoreDifferenceClass(
                                strokes,
                                par
                              )}`}
                            >
                              {strokes}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* IN (Back 9) Summary */}
                <tr className="bg-blue-50 dark:bg-blue-900/50 border-y-2 border-blue-200 dark:border-blue-800 font-semibold">
                  <td className="sticky left-0 bg-blue-50 dark:bg-blue-900/50 py-2 px-3 text-sm font-extrabold text-blue-700 dark:text-blue-300 border-r dark:border-blue-800 z-10">
                    IN
                  </td>
                  {round.players.map((player) => {
                    const backNineScores =
                      player.scores?.filter(
                        (s) => s.holeNumber >= 10 && s.holeNumber <= 18
                      ) || [];
                    const totalStrokes = backNineScores.reduce(
                      (sum, s) => sum + (s.strokes || 0),
                      0
                    );
                    const backNinePar = holes
                      .slice(9, 18)
                      .reduce((sum, hole) => sum + hole.par, 0);
                    const relativeToPar = totalStrokes - backNinePar;

                    return (
                      <td key={player.userId} className="text-center py-2 px-3">
                        <div className="flex flex-col items-center">
                          <span className="text-base font-bold text-blue-700 dark:text-blue-300">
                            {totalStrokes > 0 ? totalStrokes : "-"}
                          </span>
                          {totalStrokes > 0 && (
                            <span
                              className={`text-xs ${
                                relativeToPar > 0
                                  ? "text-red-500"
                                  : relativeToPar < 0
                                  ? "text-green-500"
                                  : "text-blue-500"
                              }`}
                            >
                              {relativeToPar > 0
                                ? `+${relativeToPar}`
                                : relativeToPar}
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* TOTAL Row */}
                <tr className="bg-gray-200 dark:bg-gray-700/80 border-t-2 border-gray-400 dark:border-gray-500">
                  <td className="sticky left-0 bg-gray-200 dark:bg-gray-700/80 py-2 px-3 text-lg font-extrabold text-gray-800 dark:text-white border-r dark:border-gray-500 z-10">
                    TOTAL
                  </td>
                  {round.players.map((player) => {
                    const playerTotalScore = player.totalScore || 0;
                    const totalPar = holes.reduce(
                      (sum, hole) => sum + hole.par,
                      0
                    );
                    const relativeToPar = playerTotalScore - totalPar;

                    return (
                      <td key={player.userId} className="text-center py-2 px-3">
                        <div className="flex flex-col items-center">
                          <span className="text-lg font-extrabold text-gray-800 dark:text-white">
                            {playerTotalScore > 0 ? playerTotalScore : "-"}
                          </span>
                          {playerTotalScore > 0 && (
                            <span
                              className={`text-sm font-semibold ${
                                relativeToPar > 0
                                  ? "text-red-500"
                                  : relativeToPar < 0
                                  ? "text-green-500"
                                  : "text-blue-500"
                              }`}
                            >
                              {relativeToPar > 0
                                ? `+${relativeToPar}`
                                : relativeToPar}
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Score Legend */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Eagle or better</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Birdie</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <span>Par</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span>Bogey</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Double Bogey or worse</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
