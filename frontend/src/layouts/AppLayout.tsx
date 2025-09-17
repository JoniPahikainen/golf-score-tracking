import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/ui/header";

export const AppLayout = () => {
  const { isLoggedIn, handleLogout } = useAuth();
  

  return (
    <div className="min-h-screen bg-slate-900">
      <Header handleLogout={handleLogout} />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};