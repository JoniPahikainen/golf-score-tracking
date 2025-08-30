import request from "supertest";
import { app } from "../src/index";
import { createRoundData, roundPlayerId, roundPlayerId2, roundCourseId } from "./test-data";

describe("Round API", () => {
  let roundId: string;
  let userId = roundPlayerId;
  let userId2 = roundPlayerId2;

  it("should create a new round", async () => {
    const roundData = createRoundData;
    const response = await request(app)
      .post("/api/rounds")
      .send(roundData)
      .expect(201);

    expect(response.body).toHaveProperty("success", true);
    expect(response.body.data).toHaveProperty("roundId");
    expect(response.body).toHaveProperty(
      "message",
      "Round created successfully"
    );
    roundId = response.body.data.roundId;
  });

  it("should return 400 for invalid round data", async () => {
    const invalidRoundData = { 
      courseId: "2d7ebc99-4c5f-4d74-9655-5a8b807aee1b",
      date: "2025-07-26T12:00:00Z",
      teeName: "White Tees",
      title: "Friendly Match - Sunny Hills",
      players: []
    };

    const response = await request(app)
      .post("/api/rounds")
      .send(invalidRoundData)
      .expect(400);

    expect(response.body).toHaveProperty("success", false);
  });

  it("should get all rounds", async () => {
    const response = await request(app).get("/api/rounds").expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    if (response.body.length > 0) {
      expect(response.body).toContainEqual(
        expect.objectContaining({ id: roundId })
      );
    }
  });

  it("should get a specific round by ID", async () => {
    const response = await request(app)
      .get(`/api/rounds/${roundId}`)
      .expect(200);

    expect(response.body).toHaveProperty("success", true);
    expect(response.body.data).toHaveProperty("id", roundId);
    expect(response.body.data).toHaveProperty("courseId", createRoundData.courseId);
    expect(response.body.data).toHaveProperty("players");
    expect(Array.isArray(response.body.data.players)).toBe(true);
    expect(response.body.data.players.length).toBe(2);
    
    const playerIds = response.body.data.players.map((player: any) => player.userId);
    expect(playerIds).toContain(userId);
    expect(playerIds).toContain(userId2);
    
    const player1 = response.body.data.players.find((player: any) => player.userId === userId);
    const player2 = response.body.data.players.find((player: any) => player.userId === userId2);
    
    expect(player1).toBeDefined();
    expect(player2).toBeDefined();
    expect(player1).toHaveProperty("handicapAtTime");
    expect(player2).toHaveProperty("handicapAtTime");
    expect(player1).toHaveProperty("scores");
    expect(player2).toHaveProperty("scores");
    expect(Array.isArray(player1.scores)).toBe(true);
    expect(Array.isArray(player2.scores)).toBe(true);
    expect(player1.scores.length).toBe(18);
    expect(player2.scores.length).toBe(18);
  });

  it("should return 500 for non-existent round ID", async () => {
    const response = await request(app)
      .get("/api/rounds/non-existent-id")
      .expect(500);

    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("error", "Internal server error");
  });

  it("should get rounds by user ID", async () => {
    const response = await request(app)
      .get(`/api/rounds/user/${userId}`)
      .expect(200);

    expect(response.body).toHaveProperty("success", true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it("should get rounds by user ID with limit", async () => {
    const limit = 5;
    const response = await request(app)
      .get(`/api/rounds/user/${userId}?limit=${limit}`)
      .expect(200);

    expect(response.body).toHaveProperty("success", true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeLessThanOrEqual(limit);
  });

  it("should return 400 for invalid limit parameter", async () => {
    const response = await request(app)
      .get(`/api/rounds/user/${userId}?limit=invalid`)
      .expect(400);

    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("error", "Invalid limit parameter");
  });

  it("should update a round", async () => {
    const updateData = { date: "2023-10-15" };
    const response = await request(app)
      .put(`/api/rounds/${roundId}`)
      .send(updateData)
      .expect(200);

    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty("message", "Round updated successfully");
    expect(response.body.data).toHaveProperty("date", updateData.date);
  });

  it("should return 500 when updating non-existent round", async () => {
    const updateData = { date: "2023-10-15" };
    const response = await request(app)
      .put("/api/rounds/non-existent-id")
      .send(updateData)
      .expect(500);

    expect(response.body).toHaveProperty("success", false);
    //expect(response.body).toHaveProperty("error", "Internal server error");
  });

  it("should update a score for a specific hole", async () => {
    const holeNumber = 1;
    const scoreUpdate = { strokes: 4, putts: 2 };
    const response = await request(app)
      .put(`/api/rounds/${roundId}/score/${userId}/${holeNumber}`)
      .send(scoreUpdate)
      .expect(200);

    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty("message", "Score updated successfully");
  });

  it("should return 400 for invalid hole number", async () => {
    const holeNumber = 19;
    const scoreUpdate = { strokes: 4, putts: 2 };
    const response = await request(app)
      .put(`/api/rounds/${roundId}/score/${userId}/${holeNumber}`)
      .send(scoreUpdate)
      .expect(400);

    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("error", "Invalid hole number (must be 1-18)");
  });

  it("should return 500 when updating score for non-existent round", async () => {
    const holeNumber = 1;
    const scoreUpdate = { strokes: 4, putts: 2 };
    const response = await request(app)
      .put(`/api/rounds/non-existent-id/score/${userId}/${holeNumber}`)
      .send(scoreUpdate)
      .expect(500);

    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("error", "Internal server error");
  });

  it("should delete a round", async () => {
    const response = await request(app)
      .delete(`/api/rounds/${roundId}`)
      .expect(200);

    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty("message", "Round deleted successfully");
  });

  it("should return 500 when deleting non-existent round", async () => {
    const response = await request(app)
      .delete("/api/rounds/non-existent-id")
      .expect(500);

    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("error", "Internal server error");
  });

  it("should delete all rounds", async () => {
    const response = await request(app)
      .delete("/api/rounds")
      .expect(200);

    expect(response.body).toBe(true);
  });
});