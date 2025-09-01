export type TeeColor =
  | "red"
  | "gold"
  | "blue"
  | "white"
  | "black"
  | "championship"
  | "forward"
  | "middle"
  | "back";
export type RoundStatus = "active" | "completed" | "abandoned";

export interface User {
  id: string;
  userName: string;
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  handicapIndex?: number;
  dateOfBirth?: Date;
  phone?: string;
  profilePictureUrl?: string;
  preferredTeeColor?: TeeColor;
  isActive?: boolean;
  emailVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}


export interface Course {
  id?: string;
  name: string;
  location?: string;
  description?: string;
  websiteUrl?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  parTotal?: number;
  holeCount?: number;
  designer?: string;
  yearBuilt?: number;
  amenities?: string[];
  courseRating?: number;
  slopeRating?: number;
  isActive?: boolean;
  holes?: CourseHole[];
  createdAt?: Date;
  updatedAt?: Date;
}


export interface CourseHole {
  id?: string;
  courseId?: string;
  holeNumber: number;
  par: number;
  handicapRanking?: number;
  description?: string;
  holeImageUrl?: string;
  tees?: CourseTee[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CourseTee {
  id?: string;
  holeId?: string;
  teeName: string;
  teeColor?: TeeColor;
  length: number;
  courseRating?: number;
  slopeRating?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateCourseRequest {
  name: string;
  location?: string;
  description?: string;
  holes: {
    holeNumber: number;
    par: number;
    handicapRanking?: number;
    tees: {
      teeName: string;
      teeColor?: TeeColor;
      length: number;
    }[];
  }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface TeeSet {
  id: string;
  name: string;
  courseId: string;
  color?: TeeColor;
  holes: {
    holeNumber: number;
    length: number;
    par: number;
  }[];
}

export interface CreateRoundRequest {
  courseId: string;
  date: string;
  teeName: string;
  title?: string;
  players: RoundPlayer[];
  notes?: string;
}

export interface Round {
  id: string;
  courseId: string;
  title?: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  teeName: string;
  notes?: string;
  status?: RoundStatus;
  isTournament?: boolean;
  tournamentName?: string;
  createdBy?: string;
  players: RoundPlayer[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RoundPlayer {
  id?: string;
  roundId?: string;
  userId: string;
  hcpAtTime: number;
  totalScore: number;
  totalPutts?: number;
  fairwaysHit?: number;
  greensInRegulation?: number;
  totalPenalties?: number;
  drivingDistanceAvg?: number;
  longestDrive?: number;
  position?: number;
  scores: PlayerScore[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PlayerScore {
  id?: string;
  roundPlayerId?: string;
  holeNumber: number;
  strokes: number;
  putts?: number;
  fairwayHit?: boolean;
  greenInRegulation?: boolean;
  penalties?: number;
  chipShots?: number;
  sandSaves?: number;
  drivingDistance?: number;
  approachDistance?: number;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
  
}

export interface DatabaseError extends Error {
  code?: string;
  detail?: string;
  hint?: string;
}

export interface ScoreUpdateData {
  strokes: number;
  putts?: number;
  fairwayHit?: boolean;
  greenInRegulation?: boolean;
  penalties?: number;
  drivingDistance?: number;
  notes?: string;
}

export interface CreateUserRequest {
  userName: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
}
