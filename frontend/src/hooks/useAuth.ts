import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { useUser } from "@/contexts/UserContext";

interface ApiError {
  message: string;
  status?: number;
}

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const { user, setUser, logout: contextLogout } = useUser();

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError("");

    try {
      const { data } = await api.post("/auth/login", { email, password });
      
      // Store token and user data
      localStorage.setItem("token", data.token);
      setUser(data.user);
      
      navigate("/app");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    setError("");

    try {
      await api.post("/auth/register", { userName: username, email, password });
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    contextLogout();
    navigate("/login");
  };

  return {
    isLoggedIn: !!user,
    isLoading,
    error,
    user,
    handleLogin,
    handleRegister,
    handleLogout,
  };
};