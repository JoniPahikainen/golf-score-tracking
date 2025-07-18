import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/ui/header";
import { LoginForm } from "@/pages/LoginForm";
import { RegisterForm } from "@/pages/RegisterForm";
import { MainAppTabs } from "@/components/app/MainAppTabs";
import { useState } from "react";
import { BasicPlayer } from "@/pages/StartRoundPage";

export const HomePage = () => {
  const {
    isLoggedIn,
    userName,
    setUserName,
    password,
    setPassword,
    handleLogin,
    handleRegister,
    handleLogout,
    mode,
    setMode,
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
          mode === "login" ? (
            <LoginForm
              userName={userName}
              setUserName={setUserName}
              password={password}
              setPassword={setPassword}
              handleLogin={handleLogin}
              switchToRegister={() => setMode("register")}
            />
          ) : (
            <RegisterForm
              userName={userName}
              setUserName={setUserName}
              password={password}
              setPassword={setPassword}
              handleRegister={handleRegister}
              switchToLogin={() => setMode("login")}
            />
          )
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
