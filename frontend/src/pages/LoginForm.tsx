import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom";

interface LoginFormProps {
  userName: string;
  setUserName: (name: string) => void;
  password: string;
  setPassword: (password: string) => void;
  handleLogin: () => void;
  switchToRegister?: () => void;
}

export const LoginForm = ({
  userName,
  setUserName,
  password,
  setPassword,
  handleLogin,
  switchToRegister,
}: LoginFormProps) => (
  <Card className="bg-slate-800 text-white max-w-md mx-auto">
    <CardHeader>
      <CardTitle>Welcome Back</CardTitle>
      <CardDescription className="text-slate-300">
        Sign in to access your golf stats
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <input
        type="text"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        placeholder="Username"
        className="w-full p-2 rounded bg-slate-700 text-white"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full p-2 rounded bg-slate-700 text-white"
      />
      <button
        onClick={handleLogin}
        className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
      >
        Sign In
      </button>
      <p className="text-sm text-slate-300 text-center">
        Don't have an account?{" "}
        <button
          onClick={switchToRegister}
          className="text-blue-400 hover:underline underline-offset-2"
        >
          Register
        </button>
      </p>
    </CardContent>
  </Card>
);

