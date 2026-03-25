import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { handleLogin, handleVerifyToken, handleGetMe } from "../../controller/auth-controller.js";

// Mock repository and user-controller helpers
jest.mock("../../model/repository.js", () => ({
  findUserByEmail: jest.fn(),
}));

// formatUserResponse is imported by auth-controller from user-controller; mock that module
jest.mock("../../controller/user-controller.js", () => ({
  formatUserResponse: jest.fn((user) => ({
    id: user.id,
    username: user.username,
    email: user.email,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt,
  })),
}));

import { findUserByEmail } from "../../model/repository.js";

const JWT_SECRET = "test-secret";

beforeAll(() => {
  process.env.JWT_SECRET = JWT_SECRET;
});

afterEach(() => jest.clearAllMocks());

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

// ---------------------------------------------------------------------------
// handleLogin
// ---------------------------------------------------------------------------
describe("handleLogin", () => {
  test("returns 400 when email or password is missing", async () => {
    const req = { body: { email: "test@test.com" } }; // password missing
    const res = mockRes();

    await handleLogin(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Missing email and/or password",
    });
  });

  test("returns 401 when user is not found", async () => {
    findUserByEmail.mockResolvedValue(null);

    const req = { body: { email: "nobody@test.com", password: "pass" } };
    const res = mockRes();

    await handleLogin(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Wrong email and/or password",
    });
  });

  test("returns 401 when password does not match", async () => {
    const hashedPassword = await bcrypt.hash("correct-password", 10);
    findUserByEmail.mockResolvedValue({
      id: "user-1",
      username: "bob",
      email: "bob@test.com",
      password: hashedPassword,
      isAdmin: false,
      createdAt: new Date(),
    });

    const req = { body: { email: "bob@test.com", password: "wrong-password" } };
    const res = mockRes();

    await handleLogin(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Wrong email and/or password",
    });
  });

  test("returns 200 with accessToken on successful login", async () => {
    const plainPassword = "secret123";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const user = {
      id: "user-1",
      username: "alice",
      email: "alice@test.com",
      password: hashedPassword,
      isAdmin: false,
      createdAt: new Date(),
    };
    findUserByEmail.mockResolvedValue(user);

    const req = { body: { email: "alice@test.com", password: plainPassword } };
    const res = mockRes();

    await handleLogin(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const responseBody = res.json.mock.calls[0][0];
    expect(responseBody.message).toBe("User logged in");
    expect(responseBody.data).toHaveProperty("accessToken");
    // Verify the token is valid
    const decoded = jwt.verify(responseBody.data.accessToken, JWT_SECRET);
    expect(decoded.id).toBe("user-1");
  });
});

// ---------------------------------------------------------------------------
// handleVerifyToken
// ---------------------------------------------------------------------------
describe("handleVerifyToken", () => {
  test("returns 200 with the verified user from req.user", async () => {
    const user = { id: "u1", username: "test", email: "t@t.com", isAdmin: false };
    const req = { user };
    const res = mockRes();

    await handleVerifyToken(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Token verified",
      data: user,
    });
  });
});

// ---------------------------------------------------------------------------
// handleGetMe
// ---------------------------------------------------------------------------
describe("handleGetMe", () => {
  test("returns 200 with the current user from req.user", async () => {
    const user = { id: "u1", username: "test", email: "t@t.com", isAdmin: false };
    const req = { user };
    const res = mockRes();

    await handleGetMe(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "User profile fetched",
      data: user,
    });
  });
});
