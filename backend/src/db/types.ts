export interface User {
  id: string;
  userName: string;
  password?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Round {
  id: string;
  courseId: string;
  date: Date;
  teeId: string;
  title?: string;
  players: {
    userId: string;
    hcpAtTime: number;
    scores: {
      holeNumber: number;
      strokes: number;
      putts?: number;
      fairwayHit?: boolean;
      greenInReg?: boolean;
      penalties?: number;
    }[];
    totalScore: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  id: string;
  name: string;
  location?: string;
  description?: string;
  holes: {
    holeNumber: number;
    par: number;
    tees: {
      teeId: string;
      teeName: string;
      length: number;
      strokeIndex?: number;
    }[];
  }[];
  amenities?: string[];
  createdAt: Date;
  updatedAt: Date;
}