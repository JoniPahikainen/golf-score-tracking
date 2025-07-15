import { User, ChevronDown, LogOut, Settings, Trophy } from "lucide-react";

interface HeaderProps {
  isLoggedIn: boolean;
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
  setActiveTab: (tab: string) => void;
  handleLogout: () => void;
}

export const Header = ({
  isLoggedIn,
  isProfileOpen,
  setIsProfileOpen,
  setActiveTab,
  handleLogout,
}: HeaderProps) => {
  return (
    <header className="bg-blue-800 text-white shadow-lg">
      <div className="flex items-center justify-between container mx-auto px-4 py-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8 text-blue-300" />
            Golf Score Tracker
          </h1>
          <p className="text-blue-200 mt-2">
            Track your rounds, improve your game
          </p>
        </div>

        {isLoggedIn && (
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 hover:bg-blue-700 rounded-lg px-4 py-2 transition-colors"
            >
              <div className="bg-blue-600 rounded-full p-2">
                <User className="h-5 w-5" />
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-md shadow-lg z-50 border border-slate-700">
                <div className="py-1">
                  <button
                    className="flex items-center w-full px-4 py-2 text-left hover:bg-slate-700 gap-2"
                    onClick={() => {
                      setActiveTab("profile");
                      setIsProfileOpen(false);
                    }}
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-left hover:bg-slate-700 gap-2"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-left hover:bg-slate-700 gap-2 text-red-400 hover:text-red-300"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
