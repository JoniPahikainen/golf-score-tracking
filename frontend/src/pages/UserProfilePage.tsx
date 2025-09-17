import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Calendar,
  Trophy,
  Edit2,
  Save,
  X,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import api from "@/api/axios";
import { cn } from "@/lib/utils";

interface UserStatistics {
  totalRounds: number;
  bestScore: number;
  averageScore: number;
}

interface Round {
  id: string;
  players: Array<{
    userId: string;
    totalScore: number;
  }>;
}

export const UserProfile = () => {
  const { user, setUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statistics, setStatistics] = useState<UserStatistics>({
    totalRounds: 0,
    bestScore: 0,
    averageScore: 0,
  });
  const [editData, setEditData] = useState({
    userName: user?.userName || "",
    email: user?.email || "",
    handicapIndex: user?.handicapIndex || undefined,
  });
  const { toast } = useToast();

  // Fetch user statistics
  useEffect(() => {
    const fetchUserStatistics = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        const response = await api.get(`/rounds/user/${user.id}`);

        if (response.data.success) {
          const rounds: Round[] = response.data.data;
          const userRounds = rounds.filter((round) =>
            round.players.some((player) => player.userId === user.id)
          );

          if (userRounds.length > 0) {
            const userScores = userRounds
              .map(
                (round) =>
                  round.players.find((player) => player.userId === user.id)
                    ?.totalScore
              )
              .filter((score): score is number => score !== undefined);

            const totalRounds = userScores.length;
            const bestScore = Math.min(...userScores);
            const averageScore = Math.round(
              userScores.reduce((sum, score) => sum + score, 0) / totalRounds
            );

            setStatistics({ totalRounds, bestScore, averageScore });
          }
        }
      } catch (error) {
        console.error("Error fetching user statistics:", error);
        toast({
          title: "Error",
          description: "Failed to load your golf statistics.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserStatistics();
  }, [user?.id, toast]);

  // Update edit data when user changes
  useEffect(() => {
    if (user) {
      setEditData({
        userName: user.userName || "",
        email: user.email || "",
        handicapIndex: user.handicapIndex || undefined,
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      setIsSaving(true);
      const response = await api.put(`/users/${user.id}`, {
        userName: editData.userName,
        email: editData.email,
        handicapIndex: editData.handicapIndex,
      });

      if (response.data.success) {
        // Update user context with new data
        setUser({
          ...user,
          userName: editData.userName,
          email: editData.email,
          handicapIndex: editData.handicapIndex,
        });

        setIsEditing(false);
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      userName: user?.userName || "",
      email: user?.email || "",
      handicapIndex: user?.handicapIndex || undefined,
    });
    setIsEditing(false);
  };

  const getHandicapBadgeColor = (handicap: number) => {
    if (handicap <= 5) return "bg-green-500";
    if (handicap <= 15) return "bg-yellow-500";
    return "bg-blue-500";
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  const displayName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.userName;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="rounded-2xl shadow-md border dark:border-white/20 overflow-hidden">
        <CardHeader className="p-6 bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center justify-between">
            {/* Left side: Avatar + Info */}
            <div className="flex items-center space-x-5">
              <Avatar className="h-20 w-20 ring-4 ring-white dark:ring-gray-700 shadow-lg">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback className="text-xl font-semibold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100">
                  {displayName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="text-white">
                <CardTitle className="text-2xl font-bold">
                  {displayName}
                </CardTitle>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {user.handicapIndex && (
                    <Badge
                      className={`${getHandicapBadgeColor(
                        user.handicapIndex
                      )} text-white px-3 py-1 rounded-full text-xs shadow`}
                    >
                      HCP: {user.handicapIndex}
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className="bg-white/10 text-white border-white/20 px-3 py-1 rounded-full text-xs"
                  >
                    Member since{" "}
                    {user.createdAt
                      ? new Date(user.createdAt).getFullYear()
                      : "2024"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Right side: Edit/Cancel button */}
            <Button
              variant={isEditing ? "destructive" : "outline"}
              onClick={isEditing ? handleCancel : () => setIsEditing(true)}
              className="flex items-center gap-2 rounded-full shadow-sm bg-white/20 hover:bg-white/30 text-white border border-white/30"
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isEditing ? (
                <X className="h-4 w-4" />
              ) : (
                <Edit2 className="h-4 w-4" />
              )}
              {isSaving ? "Saving..." : isEditing ? "Cancel" : "Edit"}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="shadow-md rounded-2xl dark:border-white/20">
          <CardHeader className="p-6 border-b border-gray-200 dark:border-white/10">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold dark:text-white">
              <User className="h-5 w-5 text-blue-500" />
              Personal Information
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            {/* Username */}
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium dark:text-gray-200"
              >
                Username
              </Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={editData.userName}
                  onChange={(e) =>
                    setEditData({ ...editData, userName: e.target.value })
                  }
                  className="text-gray-900 bg-white dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
                />
              ) : (
                <div className="text-sm bg-gray-50 dark:bg-gray-800 dark:text-gray-200 p-2 rounded-md border border-gray-200 dark:border-gray-700">
                  {user.userName}
                </div>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium dark:text-gray-200"
              >
                Email
              </Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={editData.email}
                  onChange={(e) =>
                    setEditData({ ...editData, email: e.target.value })
                  }
                  className="text-gray-900 bg-white dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
                />
              ) : (
                <div className="text-sm bg-gray-50 dark:bg-gray-800 dark:text-gray-200 p-2 rounded-md border border-gray-200 dark:border-gray-700 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  {user.email}
                </div>
              )}
            </div>

            {/* Handicap */}
            <div className="space-y-2">
              <Label
                htmlFor="handicap"
                className="text-sm font-medium dark:text-gray-200"
              >
                Handicap Index
              </Label>
              {isEditing ? (
                <Input
                  id="handicap"
                  type="number"
                  min="0"
                  max="54"
                  step="0.1"
                  value={editData.handicapIndex || ""}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      handicapIndex: parseFloat(e.target.value) || undefined,
                    })
                  }
                  className="text-gray-900 bg-white dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
                />
              ) : (
                <div className="text-sm bg-gray-50 dark:bg-gray-800 dark:text-gray-200 p-2 rounded-md border border-gray-200 dark:border-gray-700">
                  {user.handicapIndex || "Not set"}
                </div>
              )}
            </div>

            {/* Save button */}
            {isEditing && (
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className={cn(
                  "w-full flex items-center justify-center gap-2 mt-6 px-4 py-3 rounded-full font-medium",
                  "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md",
                  "transition-all duration-200 hover:from-blue-600 hover:to-indigo-700 hover:shadow-lg",
                  "disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
                )}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Save Changes
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Golf Statistics */}
        <Card className="dark:border-white/20 shadow-md rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-gray-200 dark:border-white/10">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold dark:text-white">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Golf Statistics
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground dark:text-gray-300">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading statistics...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {/* Total Rounds */}
                <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-green-100 dark:bg-green-900/40 shadow-sm hover:shadow-md transition">
                  <div className="text-3xl font-bold text-green-700 dark:text-green-400">
                    {statistics.totalRounds}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-300">
                    Total Rounds
                  </div>
                </div>

                {/* Best Score */}
                <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-blue-100 dark:bg-blue-900/40 shadow-sm hover:shadow-md transition">
                  <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                    {statistics.bestScore || "N/A"}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-300">
                    Best Score
                  </div>
                </div>

                {/* Average Score */}
                <div className="col-span-2 flex flex-col items-center justify-center p-6 rounded-xl bg-purple-100 dark:bg-purple-900/40 shadow-sm hover:shadow-md transition">
                  <div className="text-3xl font-bold text-purple-700 dark:text-purple-400">
                    {statistics.averageScore || "N/A"}
                  </div>
                  <div className="text-sm text-purple-600 dark:text-purple-300">
                    Average Score
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="pt-4 border-t border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-gray-300">
                <Calendar className="h-4 w-4" />
                Member since{" "}
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "2024"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
