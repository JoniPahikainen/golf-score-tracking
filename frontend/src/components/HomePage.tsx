import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Plus, User, Trophy, Calendar } from "lucide-react";
import { ScoreEntry } from "./ScoreEntry";
import { RoundHistory } from "./RoundHistory";
import { UserProfile } from "./UserProfile";
import { StartRound, BasicPlayer } from "./StartRound";

export const HomePage = () => {
  const [activeTab, setActiveTab] = useState("score");
  const [roundPlayers, setRoundPlayers] = useState<BasicPlayer[] | null>(null);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-blue-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8 text-blue-300" />
            Golf Score Tracker
          </h1>
          <p className="text-blue-200 mt-2">Track your rounds, improve your game</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-blue-700 text-white rounded-lg overflow-hidden">
            <TabsTrigger value="score" className="flex items-center justify-center gap-2 data-[state=active]:bg-blue-900 py-2">
              <Plus className="h-4 w-4" />
              New Round
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center justify-center gap-2 data-[state=active]:bg-blue-900 py-2">
              <Calendar className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center justify-center gap-2 data-[state=active]:bg-blue-900 py-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="score">
            <Card className="bg-slate-800 text-white">
              <CardHeader>
                <CardTitle>{roundPlayers ? "Enter Scores" : "Record New Round"}</CardTitle>
                <CardDescription className="text-slate-300">
                  {roundPlayers ? "Enter your scores per hole" : "Add players to begin"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!roundPlayers ? (
                  <StartRound onStart={(players) => setRoundPlayers(players)} />
                ) : (
                  <ScoreEntry
                    initialPlayers={roundPlayers.map((p) => ({
                      ...p,
                      holes: Array.from({ length: 18 }, (_, i) => ({
                        holeNumber: i + 1,
                        strokes: 0,
                        putts: 0,
                        fairwayHit: false,
                        greenInReg: false,
                      })),
                    }))}
                    onExit={() => setRoundPlayers(null)}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="bg-slate-800 text-white">
              <CardHeader>
                <CardTitle>Round History</CardTitle>
                <CardDescription className="text-slate-300">
                  View your past rounds and track your progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RoundHistory />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card className="bg-slate-800 text-white">
              <CardHeader>
                <CardTitle>Player Profile</CardTitle>
                <CardDescription className="text-slate-300">
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
