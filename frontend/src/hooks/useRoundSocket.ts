import { useEffect, Dispatch, SetStateAction } from "react";
import { ScoreUser as User } from "@/types";

export const useRoundSocket = (
  roundId: string,
  setPlayers: Dispatch<SetStateAction<User[]>>
) => {
  useEffect(() => {
    const connectTimeout = setTimeout(() => {
    }, 5000);
    
    const ws = new WebSocket("ws://localhost:3000");

    ws.onopen = () => {
      clearTimeout(connectTimeout);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "score_update" && data.roundId === roundId) {
        setPlayers((prevPlayers: User[]) =>
          prevPlayers.map((p) =>
            p.id === data.userId
              ? {
                  ...p,
                  holes: p.holes.map((h) =>
                    h.holeNumber === data.holeNumber
                      ? { ...h, ...data.scoreData }
                      : h
                  ),
                }
              : p
          )
        );
      } else {

      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    ws.onclose = (event) => {
      console.warn("WebSocket Connection closed:", event);
    };

    return () => {
      clearTimeout(connectTimeout);
      ws.close();
    };
  }, [roundId, setPlayers]);
};
