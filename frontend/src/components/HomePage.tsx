import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/ui/header";
import { LoginForm } from "@/components/ui/Login";
import { MainAppTabs } from "@/components/app/MainAppTabs";
import { useState } from "react";
import { BasicPlayer } from "@/components/StartRound";

export const HomePage = () => {
  const {
    isLoggedIn,
    email,
    setEmail,
    password,
    setPassword,
    handleLogin,
    handleLogout,
  } = useAuth();
  
  const [activeTab, setActiveTab] = useState("score");
  const [roundPlayers, setRoundPlayers] = useState<BasicPlayer[] | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header
        isLoggedIn={isLoggedIn}
        isProfileOpen={isProfileOpen}
        setIsProfileOpen={setIsProfileOpen}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
      />

      <main className="container mx-auto px-4 py-8">
        {!isLoggedIn ? (
          <LoginForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            handleLogin={handleLogin}
          />
        ) : (
          <MainAppTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            roundPlayers={roundPlayers}
            setRoundPlayers={setRoundPlayers}
          />
        )}
      </main>
    </div>
  );
};