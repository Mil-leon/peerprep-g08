import {
  createUser,
  getUser,
  getAllUsers,
  updateUser,
  updateUserPrivilege,
  deleteUser,
  generateAdminCode,
  upgradeUserToAdmin,
  formatUserResponse,
} from "../../controller/user-controller.js";

// Mock the repository so no DB is needed
jest.mock("../../model/repository.js", () => ({
  createUser: jest.fn(),
  deleteUserById: jest.fn(),
  findAllUsers: jest.fn(),
  findUserByEmail: jest.fn(),
  findUserById: jest.fn(),
  findUserByUsername: jest.fn(),
  findUserByUsernameOrEmail: jest.fn(),
  updateUserById: jest.fn(),
  updateUserPrivilegeById: jest.fn(),
  createAdminCode: jest.fn(),
  findAndUseAdminCode: jest.fn(),
}));

import {
  createUser as _createUser,
  deleteUserById as _deleteUserById,
  findAllUsers as _findAllUsers,
  findUserByEmail as _findUserByEmail,
  findUserById as _findUserById,
  findUserByUsername as _findUserByUsername,
  findUserByUsernameOrEmail as _findUserByUsernameOrEmail,
  updateUserById as _updateUserById,
  updateUserPrivilegeById as _updateUserPrivilegeById,
  createAdminCode as _createAdminCode,
  findAndUseAdminCode as _findAndUseAdminCode,
} from "../../model/repository.js";

beforeAll(() => {
  process.env.JWT_SECRET = "test-secret";
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

// A valid MongoDB ObjectId string for test purposes
const VALID_ID = "507f1f77bcf86cd799439011";
const OTHER_ID = "507f1f77bcf86cd799439012";

// ---------------------------------------------------------------------------
// formatUserResponse
// ---------------------------------------------------------------------------
describe("formatUserResponse", () => {
  test("returns only the expected fields", () => {
    const user = {
      id: VALID_ID,
      username: "alice",
      email: "alice@test.com",
      isAdmin: false,
      createdAt: new Date("2024-01-01"),
      password: "should-not-appear",
    };
    const result = formatUserResponse(user);
    expect(result).toEqual({
      id: VALID_ID,
      username: "alice",
      email: "alice@test.com",
      isAdmin: false,
      createdAt: user.createdAt,
    });
    expect(result).not.toHaveProperty("password");
  });
});

// ---------------------------------------------------------------------------
// createUser
// ---------------------------------------------------------------------------
describe("createUser", () => {
  test("returns 400 when required fields are missing", async () => {
    const req = { body: { username: "alice" } }; // no email or password
    const res = mockRes();

    await createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 409 when username or email already exists", async () => {
    _findUserByUsernameOrEmail.mockResolvedValue({ id: OTHER_ID });

    const req = { body: { username: "alice", email: "alice@test.com", password: "pass" } };
    const res = mockRes();

    await createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: "username or email already exists",
    });
  });

  test("returns 400 when admin code is invalid", async () => {
    _findUserByUsernameOrEmail.mockResolvedValue(null);
    _findAndUseAdminCode.mockResolvedValue(null); // invalid code

    const req = {
      body: { username: "alice", email: "alice@test.com", password: "pass", code: "BADCODE" },
    };
    const res = mockRes();

    await createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid or expired admin code" });
  });

  test("returns 201 with accessToken for a regular user", async () => {
    _findUserByUsernameOrEmail.mockResolvedValue(null);
    const createdUser = {
      id: VALID_ID,
      username: "alice",
      email: "alice@test.com",
      isAdmin: false,
      createdAt: new Date(),
    };
    _createUser.mockResolvedValue(createdUser);

    const req = { body: { username: "alice", email: "alice@test.com", password: "pass" } };
    const res = mockRes();

    await createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const body = res.json.mock.calls[0][0];
    expect(body.data).toHaveProperty("accessToken");
    expect(body.data.username).toBe("alice");
  });

  test("returns 201 and sets isAdmin when valid admin code is provided", async () => {
    _findUserByUsernameOrEmail.mockResolvedValue(null);
    _findAndUseAdminCode.mockResolvedValue({ code: "ABCD1234" });
    const createdUser = {
      id: VALID_ID,
      username: "admin",
      email: "admin@test.com",
      isAdmin: false,
      createdAt: new Date(),
    };
    _createUser.mockResolvedValue(createdUser);
    _updateUserPrivilegeById.mockResolvedValue({ ...createdUser, isAdmin: true });

    const req = {
      body: { username: "admin", email: "admin@test.com", password: "pass", code: "ABCD1234" },
    };
    const res = mockRes();

    await createUser(req, res);

    expect(_updateUserPrivilegeById).toHaveBeenCalledWith(VALID_ID, true);
    expect(res.status).toHaveBeenCalledWith(201);
    const body = res.json.mock.calls[0][0];
    expect(body.data.isAdmin).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getUser
// ---------------------------------------------------------------------------
describe("getUser", () => {
  test("returns 404 for an invalid ObjectId", async () => {
    const req = { params: { id: "not-an-id" } };
    const res = mockRes();

    await getUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("returns 404 when user is not found in DB", async () => {
    _findUserById.mockResolvedValue(null);

    const req = { params: { id: VALID_ID } };
    const res = mockRes();

    await getUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("returns 200 with user data when found", async () => {
    const user = { id: VALID_ID, username: "alice", email: "alice@test.com", isAdmin: false, createdAt: new Date() };
    _findUserById.mockResolvedValue(user);

    const req = { params: { id: VALID_ID } };
    const res = mockRes();

    await getUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0].data.username).toBe("alice");
  });
});

// ---------------------------------------------------------------------------
// getAllUsers
// ---------------------------------------------------------------------------
describe("getAllUsers", () => {
  test("returns 200 with array of users", async () => {
    const users = [
      { id: VALID_ID, username: "alice", email: "alice@test.com", isAdmin: false, createdAt: new Date() },
    ];
    _findAllUsers.mockResolvedValue(users);

    const req = {};
    const res = mockRes();

    await getAllUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0].data).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// updateUser
// ---------------------------------------------------------------------------
describe("updateUser", () => {
  test("returns 400 when no field is provided", async () => {
    const req = { body: {}, params: { id: VALID_ID } };
    const res = mockRes();

    await updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 404 for invalid ObjectId", async () => {
    const req = { body: { username: "new" }, params: { id: "bad-id" } };
    const res = mockRes();

    await updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("returns 404 when user does not exist", async () => {
    _findUserById.mockResolvedValue(null);

    const req = { body: { username: "new" }, params: { id: VALID_ID } };
    const res = mockRes();

    await updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("returns 409 when new username is already taken", async () => {
    _findUserById.mockResolvedValue({ id: VALID_ID, username: "alice", email: "a@t.com" });
    _findUserByUsername.mockResolvedValue({ id: OTHER_ID }); // different user has this name

    const req = { body: { username: "taken" }, params: { id: VALID_ID } };
    const res = mockRes();

    await updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: "username already exists" });
  });

  test("returns 200 on a successful update", async () => {
    const existing = { id: VALID_ID, username: "alice", email: "a@t.com", isAdmin: false, createdAt: new Date() };
    _findUserById.mockResolvedValue(existing);
    _findUserByUsername.mockResolvedValue(null);
    _findUserByEmail.mockResolvedValue(null);
    _updateUserById.mockResolvedValue({ ...existing, username: "alice2" });

    const req = { body: { username: "alice2" }, params: { id: VALID_ID } };
    const res = mockRes();

    await updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0].data.username).toBe("alice2");
  });
});

// ---------------------------------------------------------------------------
// updateUserPrivilege
// ---------------------------------------------------------------------------
describe("updateUserPrivilege", () => {
  test("returns 400 when isAdmin is missing", async () => {
    const req = { body: {}, params: { id: VALID_ID } };
    const res = mockRes();

    await updateUserPrivilege(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "isAdmin is missing!" });
  });

  test("returns 200 after privilege is updated", async () => {
    const user = { id: VALID_ID, username: "alice", email: "a@t.com", isAdmin: false, createdAt: new Date() };
    _findUserById.mockResolvedValue(user);
    _updateUserPrivilegeById.mockResolvedValue({ ...user, isAdmin: true });

    const req = { body: { isAdmin: true }, params: { id: VALID_ID } };
    const res = mockRes();

    await updateUserPrivilege(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0].data.isAdmin).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// deleteUser
// ---------------------------------------------------------------------------
describe("deleteUser", () => {
  test("returns 404 for invalid ObjectId", async () => {
    const req = { params: { id: "bad-id" } };
    const res = mockRes();

    await deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("returns 404 when user is not found", async () => {
    _findUserById.mockResolvedValue(null);

    const req = { params: { id: VALID_ID } };
    const res = mockRes();

    await deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("returns 200 on successful deletion", async () => {
    _findUserById.mockResolvedValue({ id: VALID_ID });
    _deleteUserById.mockResolvedValue({});

    const req = { params: { id: VALID_ID } };
    const res = mockRes();

    await deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});

// ---------------------------------------------------------------------------
// generateAdminCode
// ---------------------------------------------------------------------------
describe("generateAdminCode", () => {
  test("returns 201 with an 8-char uppercase code", async () => {
    _createAdminCode.mockResolvedValue({});

    const req = { user: { id: VALID_ID } };
    const res = mockRes();

    await generateAdminCode(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const code = res.json.mock.calls[0][0].data.code;
    expect(typeof code).toBe("string");
    expect(code).toHaveLength(8);
    expect(code).toBe(code.toUpperCase());
  });
});

// ---------------------------------------------------------------------------
// upgradeUserToAdmin
// ---------------------------------------------------------------------------
describe("upgradeUserToAdmin", () => {
  test("returns 400 when code is missing", async () => {
    const req = { body: {}, user: { id: VALID_ID } };
    const res = mockRes();

    await upgradeUserToAdmin(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Admin code is required" });
  });

  test("returns 400 when code is invalid", async () => {
    _findAndUseAdminCode.mockResolvedValue(null);

    const req = { body: { code: "BADCODE" }, user: { id: VALID_ID } };
    const res = mockRes();

    await upgradeUserToAdmin(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid or expired admin code" });
  });

  test("returns 200 and upgrades user successfully", async () => {
    _findAndUseAdminCode.mockResolvedValue({ code: "VALID123" });
    const updatedUser = {
      id: VALID_ID, username: "alice", email: "a@t.com", isAdmin: true, createdAt: new Date(),
    };
    _updateUserPrivilegeById.mockResolvedValue(updatedUser);

    const req = { body: { code: "VALID123" }, user: { id: VALID_ID } };
    const res = mockRes();

    await upgradeUserToAdmin(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0].data.isAdmin).toBe(true);
  });
});
