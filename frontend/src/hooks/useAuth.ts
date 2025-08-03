// src/hooks/useAuth.ts
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";

interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const navigate = useNavigate();

  const handleApiError = (error: any): ApiError => {
    console.error("API Error:", error);
    if (error.response) {
      return {
        message: error.response.data?.message || "Request failed",
        status: error.response.status,
        data: error.response.data
      };
    }
    return {
      message: error.message || "Network error occurred"
    };
  };

  const handleLogin = async (username: string, password: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", { 
        userName: username, 
        password 
      });
      
      localStorage.setItem("token", response.data.token);
      setIsLoggedIn(true);
      navigate("/app");
    } catch (error: any) {
      const apiError = handleApiError(error);
      setError(apiError);
      
      if (apiError.status === 400) {
        setError({
          message: apiError.data?.error || "Invalid username or password"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (username: string, password: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.post("/auth/register", {
        username,
        password
      });
      navigate("/login");
    } catch (error: any) {
      const apiError = handleApiError(error);
      setError(apiError);

      if (apiError.status === 404) {
        setError({
          message: "Registration endpoint not found. Check API URL."
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return {
    isLoggedIn,
    isLoading,
    error,
    handleLogin,
    handleRegister,
    handleLogout,
  };
};