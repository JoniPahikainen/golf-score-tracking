import { StartRound } from "@/components/golf/StartRound";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { useEffect, useState } from "react";

export const StartRoundPage = () => {
  const navigate = useNavigate();
  const [tees, setTees] = useState([]);

  useEffect(() => {
    const fetchTees = async () => {
      try {
        const response = await api.get("/tees");
        setTees(response.data);
      } catch (error) {
        console.error("Error fetching tees:", error);
      }
    };
    fetchTees();
  }, []);

  const handleStartRound = async (roundData: any) => {
  try {
    const response = await api.post("/rounds", roundData);
    navigate(`/app/score-entry/${response.data.id}`);
  } catch (error) {
    console.error("Error starting round:", error);
  }
};

  return (
    <div className="p-4">
      <StartRound onStart={handleStartRound} tees={tees} />
    </div>
  );
};