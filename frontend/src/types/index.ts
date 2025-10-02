// StartRound.tsx
export interface User {
  id: string;
  name: string;
}

export interface ScoreUser extends User {
  holes: Hole[];
}

export interface RoundPlayer {
  userId: string;
  totalScore: number;
  totalPutts?: number;
  scores?: Array<{
    holeNumber: number;
    strokes: number;
    putts?: number;
  }>;
}

export interface Round {
  id: string;
  players: RoundPlayer[];
}

export interface FullRound extends Round {
  courseId: string;
  title?: string;
  date: string;
  teeName: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  name: string;
}

export interface RoundHistoryCourse extends Course {
  location?: string;
}

export interface DetailsCourse {
  id: string;
  name: string;
  location?: string;
  holes?: Array<{ holeNumber: number; par: number }>;
}

export interface Hole {
  holeNumber: number;
  strokes: number;
  putts: number;
  fairwayHit?: boolean;
  greenInReg?: boolean;
}

export interface TeeSet {
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
