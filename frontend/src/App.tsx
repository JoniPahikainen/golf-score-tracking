import { Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PlayPage from "./pages/PlayPage";
import LoginPage from "./pages/LoginPage";
import StartRoundPage from "./pages/StartRoundPage";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow p-4 flex justify-center gap-4">
        <Link to="/" className="text-blue-600 hover:underline">Home</Link>
        <Link to="/start" className="text-blue-600 hover:underline">Start Round</Link>
        <Link to="/play" className="text-blue-600 hover:underline">Play</Link>
        <Link to="/login" className="text-blue-600 hover:underline">Login</Link> {/* 👈 Add this */}
      </nav>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/play" element={<PlayPage />} />
        <Route path="/start" element={<StartRoundPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </div>
  );
}

export default App;
