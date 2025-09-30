import { StartRound } from "@/components/golf/StartRound";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Course, TeeSet, User } from "@/types";

export const StartRoundPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [teeSets, setTeeSets] = useState<TeeSet[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [isLoadingTees, setIsLoadingTees] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const coursesResponse = await api.get("/courses");
        setCourses(coursesResponse.data.data || []);

        if (user?.id) {
          const friendsResponse = await api.get(`/friends/${user.id}`);
          const friendsData = friendsResponse.data.data || [];
          const transformedFriends = friendsData.map((friend: any) => {
            const friendUser = friend.users;
            const name =
              friendUser?.first_name && friendUser?.last_name
                ? `${friendUser.first_name} ${friendUser.last_name}`
                : friendUser?.user_name ||
                  `Friend ${friend.friend_id.slice(-4)}`;

            return {
              id: friend.friend_id,
              name: name,
            };
          });
          setFriends(transformedFriends);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
    fetchInitialData();
  }, [user]);

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
    players: User[];
    courseId: string;
    teeId: string;
    date: Date;
    title?: string;
  }) => {
    try {
      const selectedTee = teeSets.find((tee) => tee.id === roundData.teeId);
      const teeColor = selectedTee?.color || "white";

      console.log(
        "Starting round with data:",
        roundData,
        "Tee color:",
        teeColor
      );

      const response = await api.post("/rounds", {
        courseId: roundData.courseId,
        teeName: teeColor.charAt(0).toUpperCase() + teeColor.slice(1),
        date: roundData.date.toISOString(),
        title: roundData.title,
        players: roundData.players.map((p) => ({
          userId: p.id,
          hcpAtTime: 54, // FIX: Default handicap, can be updated later
          scores: [],
        })),
      });
      navigate(`/app/score-entry/${response.data.data.roundId}`);
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
        friends={friends}
        isLoadingTees={isLoadingTees}
      />
    </div>
  );
};
