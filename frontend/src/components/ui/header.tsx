// components/ui/header.tsx
import { User, LogOut, Settings, Trophy } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  handleLogout: () => void;
}

export const Header = ({ handleLogout }: HeaderProps) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="bg-blue-800 text-white shadow-lg">
      <div className="flex items-center justify-between container mx-auto px-4 py-6">
        <div>
          <h1 
            className="text-3xl font-bold flex items-center gap-2 cursor-pointer hover:text-blue-300 transition-colors"
            onClick={() => navigate("/app")}
          >
            <Trophy className="h-8 w-8 text-blue-300" />
            Golf Score Tracker
          </h1>
          <p className="text-blue-200 mt-2">
            Track your rounds, improve your game
          </p>
        </div>

        <div className="flex items-center gap-6">
          {/* New Start Round Button REMOVE WHEN FOUND BETTER OPTION*/}
          <button
            onClick={() => navigate("/app/start-round")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 rounded-lg px-4 py-2 transition-colors"
          >
            <span className="hidden md:inline">Start Round</span>
          </button>
          {/* REMOVE WHEN FOUND BETTER OPTION */}

          {/* Existing Profile Button */}
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
                      navigate("/app/user-profile");
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
                    className="flex items-center w-full px-4 py-2 text-left hover:bg-slate-700 gap-2"
                    onClick={() => {
                      navigate("/app/friends");
                      setIsProfileOpen(false);
                    }}
                  >
                    <User className="h-4 w-4" />
                    Friends
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
        </div>
      </div>
    </header>
  );
};