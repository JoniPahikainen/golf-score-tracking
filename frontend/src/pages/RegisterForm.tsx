import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";


interface RegisterFormProps {
  userName: string;
  setUserName: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  handleRegister: () => void;
  switchToLogin: () => void;
}

export const RegisterForm = ({
  userName,
  setUserName,
  password,
  setPassword,
  handleRegister,
  switchToLogin,
}: RegisterFormProps) => (
  <Card className="bg-slate-800 text-white max-w-md mx-auto">
    <CardHeader>
      <CardTitle>Create Account</CardTitle>
      <CardDescription className="text-slate-300">
        Register to start tracking your golf rounds
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
        onClick={handleRegister}
        className="w-full py-2 bg-green-600 hover:bg-green-700 rounded-lg"
      >
        Register
      </button>
      <p className="text-sm text-slate-300 text-center">
        Already have an account?{" "}
        <button
          onClick={switchToLogin}
          className="text-blue-400 hover:underline"
        >
          Login
        </button>
      </p>
    </CardContent>
  </Card>
);
