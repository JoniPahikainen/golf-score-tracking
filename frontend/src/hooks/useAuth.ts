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
      // Try different possible error message fields from backend
      const errorMessage = 
        error.response.data?.error || 
        error.response.data?.message || 
        error.response.data?.details ||
        `Request failed with status ${error.response.status}`;
      
      return {
        message: errorMessage,
        status: error.response.status,
        data: error.response.data
      };
    }
    return {
      message: error.message || "Network error occurred"
    };
  };

  const handleLogin = async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", { 
        email, 
        password 
      });
      
      localStorage.setItem("token", response.data.token);
      setIsLoggedIn(true);
      navigate("/app");
    } catch (error: any) {
      const apiError = handleApiError(error);
      setError(apiError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (username: string, email: string, password: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.post("/auth/register", {
        userName: username,
        email,
        password
      });
      navigate("/login");
    } catch (error: any) {
      const apiError = handleApiError(error);
      setError(apiError);
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