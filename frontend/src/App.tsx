
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { AuthLayout } from "./layouts/AuthLayout";
import { AppLayout } from "./layouts/AppLayout";
import { StartRoundPage  } from "./pages/StartRoundPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { RoundHistory } from "./pages/RoundHistoryPage";
import { ScoreEntryPage } from "./pages/ScoreEntryPage";
import { UserProfile } from "./pages/UserProfilePage";


const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/app",
    element: <AppLayout />,
    children: [
      {
        path: "",
        element: <RoundHistory />,
      },
      {
        path: "start-round",
        element: <StartRoundPage />,
      },
      {
        path: "score-entry/:roundId",
        element: <ScoreEntryPage />,
      },
      {
        path: "user-profile",
        element: <UserProfile />,
      },
    ],
  },
]);

const App = () => (
  <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
  </QueryClientProvider>
);

export default App;