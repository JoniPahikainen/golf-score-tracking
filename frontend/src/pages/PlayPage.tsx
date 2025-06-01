import React, { useState } from 'react';

const NUM_HOLES = 18;

const PlayPage = () => {
  const [playerName, setPlayerName] = useState('');
  const [scores, setScores] = useState(Array(NUM_HOLES).fill(null));

  const handleCellClick = (index: number) => {
    const input = prompt(`Enter strokes for Hole ${index + 1}:`);
    if (input === null) return; // Cancelled
    const value = parseInt(input);
    if (!isNaN(value) && value > 0) {
      const newScores = [...scores];
      newScores[index] = value;
      setScores(newScores);
    } else {
      alert('Please enter a valid positive number.');
    }
  };

  const renderTable = (start: number, end: number) => (
    <div className="mb-8 overflow-x-auto">
      <table className="min-w-full border border-gray-300 bg-white rounded shadow text-center">
        <thead>
          <tr className="bg-gray-100">
            {Array.from({ length: end - start + 1 }, (_, i) => (
              <th key={i} className="p-2 border">
                {start + i}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {Array.from({ length: end - start + 1 }, (_, i) => {
              const index = start + i - 1;
              return (
                <td
                  key={i}
                  className="p-4 border cursor-pointer hover:bg-green-100"
                  onClick={() => handleCellClick(index)}
                >
                  {scores[index] ?? ''}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );

  const totalScore = scores.reduce((sum, val) => sum + (val || 0), 0);

  return (
    <div className="max-w-4xl mx-auto min-h-screen p-6 bg-green-50">
      <h1 className="text-3xl font-bold text-center mb-6">⛳ Golf Score Tracker</h1>

      <div className="mb-6 max-w-md mx-auto">
        <label className="block text-sm font-medium mb-1">Player Name</label>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Enter player name"
        />
      </div>

      <h2 className="text-xl font-semibold mb-2">Front 9 (Holes 1–9)</h2>
      {renderTable(1, 9)}

      <h2 className="text-xl font-semibold mb-2">Back 9 (Holes 10–18)</h2>
      {renderTable(10, 18)}

      <div className="text-center mt-6 text-2xl font-bold">
        Total Score: {totalScore || '-'}
      </div>
    </div>
  );
};

export default PlayPage;
