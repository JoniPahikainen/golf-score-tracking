export const courseData = {
    name: "Pine Valley Championship Course",
    location: "New Jersey, USA",
    description: "World's #1 ranked golf course featuring dramatic elevation changes",
    holes: [
        {
            holeNumber: 1,
            par: 4,
            handicapRanking: 11,
            tees: [
                { teeName: "Tournament", teeColor: "black", length: 425 },
                { teeName: "Member", teeColor: "blue", length: 395 }
            ]
        },
        {
            holeNumber: 2,
            par: 5,
            handicapRanking: 5,
            tees: [
                { teeName: "Tournament", teeColor: "black", length: 545 },
                { teeName: "Member", teeColor: "blue", length: 510 }
            ]
        },
        {
            holeNumber: 3,
            par: 3,
            handicapRanking: 17,
            tees: [
                { teeName: "Tournament", teeColor: "black", length: 185 },
                { teeName: "Member", teeColor: "blue", length: 185 }
            ]
        },
        {
            holeNumber: 4,
            par: 4,
            handicapRanking: 7,
            tees: [
                { teeName: "Tournament", teeColor: "black", length: 440 },
                { teeName: "Member", teeColor: "blue", length: 185 }
            ]
        },
        {
            holeNumber: 5,
            par: 4,
            handicapRanking: 13,
            tees: [
                { teeName: "Tournament", teeColor: "black", length: 400 },
                { teeName: "Member", teeColor: "blue", length: 185 }
            ]
        },
        {
            holeNumber: 6,
            par: 3,
            handicapRanking: 15,
            tees: [
                { teeName: "Tournament", teeColor: "black", length: 170 },
                { teeName: "Member", teeColor: "blue", length: 185 }
            ]
        },
        {
            holeNumber: 7,
            par: 5,
            handicapRanking: 3,
            tees: [
                { teeName: "Tournament", teeColor: "black", length: 575 },
                { teeName: "Member", teeColor: "blue", length: 185 }
            ]
        },
        {
            holeNumber: 8,
            par: 4,
            handicapRanking: 9,
            tees: [
                { teeName: "Tournament", teeColor: "black", length: 430 },
                { teeName: "Member", teeColor: "blue", length: 405 }
            ]
        },
        {
            holeNumber: 9,
            par: 4,
            handicapRanking: 1,
            tees: [
                { teeName: "Tournament", teeColor: "black", length: 460 },
                { teeName: "Member", teeColor: "blue", length: 185 }
            ]
        },
        {
            holeNumber: 10,
            par: 4,
            handicapRanking: 6,
            tees: [
                { teeName: "Tournament", teeColor: "black", length: 435 },
                { teeName: "Member", teeColor: "blue", length: 410 }
            ]
        },
        {
            holeNumber: 11,
            par: 3,
            handicapRanking: 18,
            tees: [
                { teeName: "Tournament", teeColor: "black", length: 155 },
                { teeName: "Member", teeColor: "blue", length: 185 }
            ]
        },
        {
            holeNumber: 12,
            par: 5,
            handicapRanking: 4,
            tees: [
                { teeName: "Tournament", teeColor: "black", length: 560 },
                { teeName: "Member", teeColor: "blue", length: 525 }
            ]
        },
        {
            holeNumber: 13,
            par: 4,
            handicapRanking: 12,
            tees: [
                { teeName: "Tournament", teeColor: "black", length: 410 },
                { teeName: "Member", teeColor: "blue", length: 185 }
            ]
        },
        {
            holeNumber: 14,
            par: 4,
            handicapRanking: 2,
            tees: [
                { teeName: "Tournament", teeColor: "black", length: 475 },
                { teeName: "Member", teeColor: "blue", length: 445 }
            ]
        },
        {
            holeNumber: 15,
            par: 3,
            handicapRanking: 16,
            tees: [
                { teeName: "Tournament", teeColor: "black", length: 195 },
                { teeName: "Member", teeColor: "blue", length: 185 }
            ]
        },
        {
            holeNumber: 16,
            par: 4,
            handicapRanking: 8,
            tees: [
                { teeName: "Tournament", teeColor: "black", length: 425 },
                { teeName: "Member", teeColor: "blue", length: 395 }
            ]
        },
        {
            holeNumber: 17,
            par: 5,
            handicapRanking: 10,
            tees: [
                { teeName: "Tournament", teeColor: "black", length: 530 },
                { teeName: "Member", teeColor: "blue", length: 185 }
            ]
        },
        {
            holeNumber: 18,
            par: 4,
            handicapRanking: 14,
            tees: [
                { teeName: "Tournament", teeColor: "black", length: 445 },
                { teeName: "Member", teeColor: "blue", length: 420 }
            ]
        }
    ]
}

export const createRoundData = (userId: string, courseId: string) => {
    return {
      courseId: courseId,
      date: "2025-07-26T12:00:00Z",
      teeName: "White Tees",
      title: "Friendly Match - Sunny Hills",
      players: [
        {
          userId: userId,
          handicapAtTime: 12.4,
          scores: [
            { holeNumber: 1, strokes: 5, putts: 2, fairwayHit: true, greenInRegulation: false, penalties: 0 },
            { holeNumber: 2, strokes: 6, putts: 3, fairwayHit: false, greenInRegulation: false, penalties: 1 },
            { holeNumber: 3, strokes: 4, putts: 2, fairwayHit: true, greenInRegulation: true, penalties: 0 },
            { holeNumber: 4, strokes: 5, putts: 2, fairwayHit: true, greenInRegulation: false, penalties: 0 },
            { holeNumber: 5, strokes: 6, putts: 3, fairwayHit: false, greenInRegulation: false, penalties: 1 },
            { holeNumber: 6, strokes: 4, putts: 2, fairwayHit: true, greenInRegulation: true, penalties: 0 },
            { holeNumber: 7, strokes: 5, putts: 2, fairwayHit: true, greenInRegulation: false, penalties: 0 },
            { holeNumber: 8, strokes: 5, putts: 2, fairwayHit: true, greenInRegulation: false, penalties: 0 },
            { holeNumber: 9, strokes: 5, putts: 2, fairwayHit: true, greenInRegulation: false, penalties: 0 },
            { holeNumber: 10, strokes: 6, putts: 3, fairwayHit: false, greenInRegulation: false, penalties: 1 },
            { holeNumber: 11, strokes: 4, putts: 2, fairwayHit: true, greenInRegulation: true, penalties: 0 },
            { holeNumber: 12, strokes: 5, putts: 2, fairwayHit: true, greenInRegulation: false, penalties: 0 },
            { holeNumber: 13, strokes: 5, putts: 2, fairwayHit: true, greenInRegulation: false, penalties: 0 },
            { holeNumber: 14, strokes: 4, putts: 2, fairwayHit: true, greenInRegulation: true, penalties: 0 },
            { holeNumber: 15, strokes: 5, putts: 2, fairwayHit: true, greenInRegulation: false, penalties: 0 },
            { holeNumber: 16, strokes: 6, putts: 3, fairwayHit: false, greenInRegulation: false, penalties: 1 },
            { holeNumber: 17, strokes: 5, putts: 2, fairwayHit: true, greenInRegulation: false, penalties: 0 },
            { holeNumber: 18, strokes: 5, putts: 2, fairwayHit: true, greenInRegulation: false, penalties: 0 }
          ]
        }
      ]
    };
  };


