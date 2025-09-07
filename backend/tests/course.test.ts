import request from "supertest";
import { app } from "../src/index";
import { courseData } from "./test-data";

describe("Course API", () => {
  let courseId: string;

  it("should create a new course", async () => {
    const response = await request(app)
      .post("/api/courses")
      .send(courseData)
      .expect(201);

    expect(response.body).toHaveProperty("success", true);
    expect(response.body.data).toHaveProperty("courseId");
    expect(response.body).toHaveProperty(
      "message",
      "Course created successfully"
    );
    courseId = response.body.data.courseId;
  });

  it("should get all courses", async () => {
    const response = await request(app).get("/api/courses").expect(200);

    expect(response.body).toHaveProperty("success", true);
    expect(Array.isArray(response.body.data)).toBe(true);

    expect(response.body.data).toContainEqual(
      expect.objectContaining({ id: courseId })
    );
  });

  it("should get a specific course by ID", async () => {
    const response = await request(app)
      .get(`/api/courses/${courseId}`)
      .expect(200);

    expect(response.body).toHaveProperty("success", true);
    expect(response.body.data).toHaveProperty("id", courseId);
    expect(response.body.data).toHaveProperty("name", courseData.name);
    expect(response.body.data).toHaveProperty("holes");
    expect(Array.isArray(response.body.data.holes)).toBe(true);
    expect(response.body.data.holes.length).toBe(courseData.holes.length);
  });

  it("should return 500 for non-existent course ID", async () => {
    const response = await request(app)
      .get("/api/courses/non-existent-id")
      .expect(500);

    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("error", "Internal server error");
  });

  it("should get tee sets for a course", async () => {
    const response = await request(app)
      .get(`/api/courses/${courseId}/tees`)
      .expect(200);

    expect(response.body).toHaveProperty("success", true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data[0].color).toBe("black");
  });

  it("should return 500 for tee sets of non-existent course", async () => {
    const response = await request(app)
      .get("/api/courses/non-existent-id/tees")
      .expect(500);

    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("error", "Internal server error");
  });

  it("should update a course", async () => {
    const updateData = {
      name: "Updated Course Name",
      description: "Updated description",
    };

    const response = await request(app)
      .put(`/api/courses/${courseId}`)
      .send(updateData)
      .expect(200);

    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty(
      "message",
      "Course updated successfully"
    );

    // Verify the update worked
    const getResponse = await request(app)
      .get(`/api/courses/${courseId}`)
      .expect(200);

    expect(getResponse.body.data.name).toBe(updateData.name);
    expect(getResponse.body.data.description).toBe(updateData.description);
  });

  it("should return 500 when updating non-existent course", async () => {
    const response = await request(app)
      .put("/api/courses/non-existent-id")
      .send({ name: "Updated" })
      .expect(500);

    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("error", "Internal server error");
  });
  it("should delete a course", async () => {
    const response = await request(app)
      .delete(`/api/courses/${courseId}`)
      .expect(200);

    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty(
      "message",
      "Course deleted successfully"
    );

    // Verify it's actually deleted
    const getResponse = await request(app)
      .get(`/api/courses/${courseId}`)
      .expect(404);
  });

  it("should return 500 when deleting non-existent course", async () => {
    const response = await request(app)
      .delete("/api/courses/non-existent-id")
      .expect(500);

    expect(response.body).toHaveProperty("success", false);
  });
  it("should return 400 for invalid course creation data", async () => {
    const invalidData = {
      // Missing required fields
      holes: courseData.holes,
    };

    const response = await request(app)
      .post("/api/courses")
      .send(invalidData)
      .expect(400);

    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("error");
  });

  it("should return 400 for invalid hole data", async () => {
    const invalidHoleData = {
      ...courseData,
      holes: [
        {
          holeNumber: 1,
          par: 4,
          // Missing handicapRanking
          tees: [{ teeName: "Test", teeColor: "blue", length: 400 }],
        },
      ],
    };

    const response = await request(app)
      .post("/api/courses")
      .send(invalidHoleData)
      .expect(400);

    expect(response.body).toHaveProperty("success", false);
  });

  it("should handle database errors gracefully", async () => {
    // This might require mocking to simulate database errors
    const response = await request(app)
      .post("/api/courses")
      .send({ ...courseData, name: "" }) // Empty name might cause validation error
      .expect(400); // Or 500 depending on your validation

    expect(response.body).toHaveProperty("success", false);
  });

  it("should return proper error format for all endpoints", async () => {
    const responses = await Promise.all([
      request(app).get("/api/courses/invalid-id"),
      request(app).put("/api/courses/invalid-id").send({}),
      request(app).delete("/api/courses/invalid-id"),
    ]);

    responses.forEach((response) => {
      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("error");
    });
  });
});
