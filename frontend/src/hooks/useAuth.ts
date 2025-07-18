import { useState } from "react";

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");

  const handleLogin = () => {
    if (userName.trim() && password.trim()) {
      setIsLoggedIn(true);
    } else {
      alert("Please enter username and password");
    }
  };

  const handleRegister = () => {
    if (userName.trim() && password.trim()) {
      // You can save users somewhere in real auth
      alert(`Registered as ${userName}`);
      setIsLoggedIn(true);
    } else {
      alert("Please enter username and password to register");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName("");
    setPassword("");
  };

  return {
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
  };
};
