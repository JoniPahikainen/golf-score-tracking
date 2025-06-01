const HomePage = () => {
  return (
    <div className="max-w-md mx-auto min-h-screen p-4 bg-green-50">
      <h1 className="text-2xl font-bold text-center mb-4">🏌️ Golf Score</h1>
      <div className="bg-white rounded-lg p-6 shadow text-center">
        <p className="text-lg">Your Score</p>
        <p className="text-4xl font-bold text-green-600">72</p>
      </div>
    </div>
  );
};

export default HomePage;
