import { useEffect, useState } from "react";

function App() {
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    fetch("http://localhost:3001/api/score")
      .then((res) => res.json())
      .then((data) => setScore(data.score));
  }, []);

  return (
    <div className="max-w-md mx-auto min-h-screen p-4 bg-green-50">
      <h1 className="text-2xl font-bold text-center mb-4">🏌️ Golf Score</h1>
      <div className="bg-white rounded-lg p-6 shadow text-center">
        <p className="text-lg">Your Score</p>
        <p className="text-4xl font-bold text-green-600">{score ?? "..."}</p>
      </div>
    </div>
  );
}

export default App;
