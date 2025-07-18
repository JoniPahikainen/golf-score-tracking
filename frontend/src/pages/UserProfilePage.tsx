import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Calendar, Trophy, Edit2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserData {
  userName: string;
  email: string;
  createdAt: string;
  handicap?: number;
  totalRounds: number;
  bestScore: number;
  averageScore: number;
}

export const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    userName: "John Golfer",
    email: "john.golfer@example.com",
    createdAt: "2024-01-01",
    handicap: 18,
    totalRounds: 25,
    bestScore: 85,
    averageScore: 92,
  });
  const [editData, setEditData] = useState(userData);
  const { toast } = useToast();

  const handleSave = () => {
    setUserData(editData);
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
  };

  const handleCancel = () => {
    setEditData(userData);
    setIsEditing(false);
  };

  const getHandicapBadgeColor = (handicap: number) => {
    if (handicap <= 5) return "bg-green-500";
    if (handicap <= 15) return "bg-yellow-500";
    return "bg-blue-500";
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback className="text-lg">
                  {userData.userName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{userData.userName}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  {userData.handicap && (
                    <Badge className={`${getHandicapBadgeColor(userData.handicap)} text-white`}>
                      HCP: {userData.handicap}
                    </Badge>
                  )}
                  <Badge variant="outline">
                    Member since {new Date(userData.createdAt).getFullYear()}
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              variant={isEditing ? "destructive" : "outline"}
              onClick={isEditing ? handleCancel : () => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              {isEditing ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={editData.userName}
                  onChange={(e) => setEditData({...editData, userName: e.target.value})}
                />
              ) : (
                <div className="text-sm bg-gray-50 p-2 rounded">{userData.userName}</div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({...editData, email: e.target.value})}
                />
              ) : (
                <div className="text-sm bg-gray-50 p-2 rounded flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {userData.email}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="handicap">Handicap</Label>
              {isEditing ? (
                <Input
                  id="handicap"
                  type="number"
                  min="0"
                  max="54"
                  value={editData.handicap || ""}
                  onChange={(e) => setEditData({...editData, handicap: parseInt(e.target.value) || undefined})}
                />
              ) : (
                <div className="text-sm bg-gray-50 p-2 rounded">
                  {userData.handicap || "Not set"}
                </div>
              )}
            </div>

            {isEditing && (
              <Button onClick={handleSave} className="w-full flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Golf Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Golf Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{userData.totalRounds}</div>
                <div className="text-sm text-green-600">Total Rounds</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">{userData.bestScore}</div>
                <div className="text-sm text-blue-600">Best Score</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg col-span-2">
                <div className="text-2xl font-bold text-purple-700">{userData.averageScore}</div>
                <div className="text-sm text-purple-600">Average Score</div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Member since {new Date(userData.createdAt).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};