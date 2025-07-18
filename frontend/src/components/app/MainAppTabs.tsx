import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StartRound, BasicPlayer } from "@/pages/StartRoundPage";
import { ScoreEntry } from "@/pages/ScoreEntryPage";
import { RoundHistory } from "@/pages/RoundHistoryPage";
import { UserProfile } from "@/pages/UserProfilePage";
import { Plus, Calendar, User } from "lucide-react";


interface MainAppTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  roundPlayers: BasicPlayer[] | null;
  setRoundPlayers: (players: BasicPlayer[] | null) => void;
}

export const MainAppTabs = ({
  activeTab,
  setActiveTab,
  roundPlayers,
  setRoundPlayers,
}: MainAppTabsProps) => (
  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
    <TabsList className="grid w-full grid-cols-3 mb-8 bg-blue-700 text-white rounded-lg overflow-hidden">
      <TabsTrigger
        value="score"
        className="flex items-center justify-center gap-2 data-[state=active]:bg-blue-900 py-2"
      >
        <Plus className="h-4 w-4" />
        New Round
      </TabsTrigger>
      <TabsTrigger
        value="history"
        className="flex items-center justify-center gap-2 data-[state=active]:bg-blue-900 py-2"
      >
        <Calendar className="h-4 w-4" />
        History
      </TabsTrigger>
      <TabsTrigger
        value="profile"
        className="flex items-center justify-center gap-2 data-[state=active]:bg-blue-900 py-2"
      >
        <User className="h-4 w-4" />
        Profile
      </TabsTrigger>
    </TabsList>

    <TabsContent value="score">
      <Card className="bg-slate-800 text-white">
        <CardHeader>
          <CardTitle>
            {roundPlayers ? "Enter Scores" : "Record New Round"}
          </CardTitle>
          <CardDescription className="text-slate-300">
            {roundPlayers
              ? "Enter your scores per hole"
              : "Add players to begin"}
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
);
