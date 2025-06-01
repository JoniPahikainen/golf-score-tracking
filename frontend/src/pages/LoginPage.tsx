// pages/LoginPage.jsx
import React from 'react';

function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form className="flex flex-col gap-4 w-full max-w-sm">
        <input
          type="email"
          placeholder="Email"
          className="p-2 border border-gray-300 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          className="p-2 border border-gray-300 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Log In
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
