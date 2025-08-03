import { StartRound } from "@/components/golf/StartRound";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { useEffect, useState } from "react";

export const StartRoundPage = () => {
  const navigate = useNavigate();
  const [tees, setTees] = useState<Tee[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // First fetch all courses
        const coursesResponse = await api.get("/courses");
        setCourses(coursesResponse.data);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
    fetchInitialData();
  }, []);

  const fetchTeesForCourse = async (courseId: string) => {
    try {
      const response = await api.get(`/courses/${courseId}/tees`);
      setTees(response.data);
    } catch (error) {
      console.error("Error fetching tees:", error);
      setTees([]);
    }
  };

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
      <StartRound 
        onStart={handleStartRound} 
        tees={tees}
        courses={courses}
        onCourseSelect={fetchTeesForCourse}
      />
    </div>
  );
};

interface Course {
  id: string;
  name: string;
}

interface Tee {
  id: string;
  name: string;
  courseId: string;
}