import { useState } from "react";

// temporary auth hook for testing purposes
export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (email === "asd" && password === "asd") {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(true);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmail("");
    setPassword("");
  };

  return {
    isLoggedIn,
    email,
    setEmail,
    password,
    setPassword,
    handleLogin,
    handleLogout,
  };
};