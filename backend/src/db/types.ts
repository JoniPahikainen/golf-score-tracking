// Enums matching database types
export type TeeColor = 'red' | 'gold' | 'blue' | 'white' | 'black' | 'championship' | 'forward' | 'middle' | 'back';
export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'windy' | 'stormy';
export type RoundStatus = 'active' | 'completed' | 'abandoned';
export type CourseType = 'public' | 'private' | 'semi-private' | 'resort';

// Core interfaces
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
  courseType?: CourseType;
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

export interface Round {
  id: string;
  courseId: string;
  title?: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  teeName: string; // Changed from teeId to teeName to match schema
  weather?: WeatherCondition;
  temperature?: number;
  windSpeed?: number;
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
  handicapAtTime: number;
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

export interface UserStatistics {
  id?: string;
  userId: string;
  roundsPlayed: number;
  averageScore?: number;
  bestScore?: number;
  worstScore?: number;
  totalEagles: number;
  totalBirdies: number;
  totalPars: number;
  totalBogeys: number;
  totalDoubleBogeys: number;
  totalWorse: number;
  fairwayHitPercentage?: number;
  greenInRegulationPercentage?: number;
  averagePuttsPerRound?: number;
  longestDrive?: number;
  favoriteCourseId?: string;
  lastRoundDate?: Date;
  calculatedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CourseRating {
  id?: string;
  courseId: string;
  userId: string;
  rating: number;
  review?: string;
  difficultyRating?: number;
  conditionRating?: number;
  valueRating?: number;
  wouldPlayAgain?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface HandicapHistory {
  id?: string;
  userId: string;
  handicapIndex: number;
  effectiveDate: Date;
  calculationMethod?: string;
  roundsUsed?: number;
  notes?: string;
  createdAt?: Date;
}

export interface GolfEquipment {
  id?: string;
  userId: string;
  clubType: string;
  brand?: string;
  model?: string;
  loft?: number;
  shaftFlex?: string;
  purchaseDate?: Date;
  retireDate?: Date;
  notes?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// API Request/Response types
export interface CreateUserRequest {
  userName: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  handicapIndex?: number;
  preferredTeeColor?: TeeColor;
}

export interface CreateRoundRequest {
  courseId: string;
  date: string;
  teeName: string;
  title?: string;
  players: {
    userId: string;
    handicapAtTime?: number;
  }[];
  weather?: WeatherCondition;
  temperature?: number;
  notes?: string;
}

export interface UpdateScoreRequest {
  strokes: number;
  putts?: number;
  fairwayHit?: boolean;
  greenInRegulation?: boolean;
  penalties?: number;
  drivingDistance?: number;
  notes?: string;
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
  amenities?: string[];
  courseType?: CourseType;
}

// Database error types
export interface DatabaseError extends Error {
  code?: string;
  detail?: string;
  hint?: string;
}

// API Response wrapper types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Statistics aggregation types
export interface CourseStatistics {
  courseId: string;
  courseName: string;
  totalRounds: number;
  averageScore: number;
  bestScore: number;
  lastPlayedDate: Date;
}

export interface HoleStatistics {
  holeNumber: number;
  par: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  eagles: number;
  birdies: number;
  pars: number;
  bogeys: number;
  doubleBogeys: number;
  worse: number;
}

// Legacy interfaces for backward compatibility (will be deprecated)
export interface LegacyRound {
  id: string;
  courseId: string;
  date: Date;
  teeId: string; // deprecated - use teeName
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

export interface ScoreUpdateData {
  strokes: number;
  putts?: number;
  fairwayHit?: boolean;
  greenInRegulation?: boolean;
  penalties?: number;
  drivingDistance?: number;
  notes?: string;
}