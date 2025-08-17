import { StartRound } from "@/components/golf/StartRound";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { useEffect, useState } from "react";

export const StartRoundPage = () => {
  const navigate = useNavigate();
  const [teeSets, setTeeSets] = useState<TeeSet[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingTees, setIsLoadingTees] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const coursesResponse = await api.get("/courses");
        setCourses(coursesResponse.data.data || []);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchInitialData();
  }, []);

  const fetchTeesForCourse = async (courseId: string) => {
    setIsLoadingTees(true);
    try {
      const response = await api.get(`/courses/${courseId}/tees`);
      setTeeSets(response.data.data || []);
    } catch (error) {
      console.error("Error fetching tees:", error);
      setTeeSets([]);
    } finally {
      setIsLoadingTees(false);
    }
  };

  const handleStartRound = async (roundData: {
    players: BasicPlayer[];
    courseId: string;
    teeId: string;
    date: Date;
    title?: string;
  }) => {
    try {
      const [_, teeSetName] = roundData.teeId.split('-');
      
      const response = await api.post("/rounds", {
        courseId: roundData.courseId,
        teeSet: teeSetName,
        date: roundData.date.toISOString(),
        title: roundData.title,
        players: roundData.players.map(p => ({ 
          id: p.id,
          name: p.name 
        }))
      });
      
      navigate(`/app/score-entry/${response.data.roundId}`);
    } catch (error) {
      console.error("Error starting round:", error);
    }
  };

  return (
    <div className="p-4">
      <StartRound 
        onStart={handleStartRound} 
        tees={teeSets}
        courses={courses}
        onCourseSelect={fetchTeesForCourse}
        isLoadingTees={isLoadingTees}
      />
    </div>
  );
};

interface Course {
  id: string;
  name: string;
}

interface TeeSet {
  id: string;
  name: string;
  color?: string;
  courseId: string;
  holes: {
    holeNumber: number;
    length: number;
    par: number;
  }[];
}

interface BasicPlayer {
  id: string;
  name: string;
}