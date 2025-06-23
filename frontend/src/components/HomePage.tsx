
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, User, Trophy, Calendar } from "lucide-react";
import { ScoreEntry } from "./ScoreEntry";
import { RoundHistory } from "./RoundHistory";
import { UserProfile } from "./UserProfile";

export const HomePage = () => {
  const [activeTab, setActiveTab] = useState("score");

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <header className="bg-green-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8" />
            Golf Score Tracker
          </h1>
          <p className="text-green-100 mt-2">Track your rounds, improve your game</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="score" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Round
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="score">
            <Card>
              <CardHeader>
                <CardTitle>Record New Round</CardTitle>
                <CardDescription>
                  Enter your scores for each hole to track your round
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScoreEntry />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Round History</CardTitle>
                <CardDescription>
                  View your past rounds and track your progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RoundHistory />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Player Profile</CardTitle>
                <CardDescription>
                  Manage your profile and view statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserProfile />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};