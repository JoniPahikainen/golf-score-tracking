import { useState } from "react";
import api from "@/api/axios";

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");

  const asd = () => {
    if (userName.trim() && password.trim()) {
      setIsLoggedIn(true);
    } else {
      alert("Please enter username and password");
    }
  };

  const handleLogin = async () => {
  if (!userName.trim() || !password.trim()) {
    alert("Please enter username and password");
    return;
  }

  try {
    const response = await api.post("profiles/login", { userName, password });
    console.log("Login successful:", response.data);
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
    setIsLoggedIn(true);
  } catch (error: any) {
    console.error("Login error:", error);
    alert(error.response?.data?.error || "Login failed");
  }
};

  const handleRegister = () => {
    if (userName.trim() && password.trim()) {
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
