import { Link } from "react-router-dom";

export const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-20 bg-gray-50 dark:bg-gray-900">
      <h1 className="text-5xl font-extrabold mb-4 text-gray-900 dark:text-gray-100">
        Golf Tracker
      </h1>
      <p className="mb-8 text-lg text-gray-700 dark:text-gray-300">
        Track your rounds and scores in detail
      </p>
      <div className="flex space-x-4">
        <Link
          to="/login"
          className="btn btn-primary px-6 py-2 text-lg bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="btn btn-secondary px-6 py-2 text-lg bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100"
        >
          Register
        </Link>
      </div>
    </div>
  );
};
