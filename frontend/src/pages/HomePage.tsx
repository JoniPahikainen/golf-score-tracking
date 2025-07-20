import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/ui/header";
import { LoginForm } from "@/pages/LoginForm";
import { RegisterForm } from "@/pages/RegisterForm";
import { MainAppTabs } from "@/components/app/MainAppTabs";
import { useState } from "react";
import { BasicPlayer } from "@/pages/StartRoundPage";
import api from "@/api/axios"; // ✅ NEW

export const HomePage = () => {
  const {
    isLoggedIn,
    userName,
    setUserName,
    password,
    setPassword,
    handleLogin,
    handleLogout,
    mode,
    setMode,
  } = useAuth();

  const [activeTab, setActiveTab] = useState("score");
  const [roundPlayers, setRoundPlayers] = useState<BasicPlayer[] | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleRegister = async () => {
    try {
      const response = await api.post("/profiles", {
        userName,
        password,
      });

      console.log("Registered:", response.data);
      alert("User registered successfully!");
      setMode("login");
    } catch (error: any) {
  console.error("Register error:", error);

  // Log more detail if it's an Axios error
  if (error.response) {
    console.error("Response data:", error.response.data);
    console.error("Status:", error.response.status);
    console.error("Headers:", error.response.headers);
  } else if (error.request) {
    console.error("No response received:", error.request);
  } else {
    console.error("Other error:", error.message);
  }

  alert(error.response?.data?.error || "Registration failed");
}

  };

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
              handleRegister={handleRegister} // ✅ use local one
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
