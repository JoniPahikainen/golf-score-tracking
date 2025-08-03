import { Link } from "react-router-dom";

export const HomePage = () => {
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold mb-6">Welcome to Golf Tracker</h1>
      <div className="space-x-4">
        <Link 
          to="/login" 
          className="btn btn-primary"
        >
          Login
        </Link>
        <Link 
          to="/register" 
          className="btn btn-secondary"
        >
          Register
        </Link>
      </div>
    </div>
  );
};