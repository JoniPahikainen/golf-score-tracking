import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  handleLogin: () => void;
}

export const LoginForm = ({
  email,
  setEmail,
  password,
  setPassword,
  handleLogin,
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
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
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
    </CardContent>
  </Card>
);