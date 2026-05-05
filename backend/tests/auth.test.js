import request from "supertest";
import app from "../server.js";
import User from "../models/User.js";

describe("Auth API", () => {
  const userPayload = {
    name: "Test User",
    email: "test@example.com",
    password: "password123",
  };

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe("POST /api/auth/register", () => {
    it("registers successfully and returns token + user", async () => {
      const res = await request(app).post("/api/auth/register").send(userPayload);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("_id");
      expect(res.body.email).toBe(userPayload.email);
      expect(res.body.name).toBe(userPayload.name);
    });

    it("returns 400 when email already exists", async () => {
      await request(app).post("/api/auth/register").send(userPayload);

      const res = await request(app).post("/api/auth/register").send(userPayload);

      expect([400, 409]).toContain(res.statusCode);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/api/auth/register").send(userPayload);
    });

    it("logs in successfully and returns token", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: userPayload.email,
        password: userPayload.password,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body.email).toBe(userPayload.email);
    });

    it("returns 401 for wrong password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: userPayload.email,
        password: "wrong-password",
      });

      expect(res.statusCode).toBe(401);
    });

    it("returns 401 for non-existent email", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "nope@example.com",
        password: "password123",
      });

      expect(res.statusCode).toBe(401);
    });
  });

  describe("GET /api/auth/me", () => {
    it("returns current user with valid token", async () => {
      const registerRes = await request(app)
        .post("/api/auth/register")
        .send(userPayload);

      const token = registerRes.body.token;
      const meRes = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(meRes.statusCode).toBe(200);
      expect(meRes.body.email).toBe(userPayload.email);
      expect(meRes.body).not.toHaveProperty("password");
    });

    it("returns 401 without token", async () => {
      const res = await request(app).get("/api/auth/me");

      expect(res.statusCode).toBe(401);
    });
  });
});
