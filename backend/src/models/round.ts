export interface Round {
  userId: string;
  date: string;
  courseId: string;
  hcpAtTiem?: number;
  holes: {
    holeNumber: number;
    strokes: number;
    putts?: number;
    fairwayHit?: boolean;
    greenInReg?: boolean;
  }[];
  totalScore?: number;
}