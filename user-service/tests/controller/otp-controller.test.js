import { sendOtp, verifyOtp } from "../../controller/otp-controller.js";
import {
  findUserByEmail,
  createUser,
  createOtp,
  findLatestOtpByEmail,
  deleteOtpsByEmail,
  verifyEmailById,
  updateUserPrivilegeById,
} from "../../model/repository.js";
import { sendOtpEmail } from "../../utils/mailer.js";

jest.mock("../../model/repository.js");
jest.mock("../../utils/mailer.js");

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("OTP Controller", () => {
  afterEach(() => jest.clearAllMocks());

  // -------------------------------------------------------------------------
  // sendOtp
  // -------------------------------------------------------------------------
  describe("sendOtp", () => {
    test("400 – missing email", async () => {
      const req = { body: {} };
      const res = mockRes();
      await sendOtp(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Email is required." });
    });

    test("200 – sends OTP if user is registered and unverified", async () => {
      findUserByEmail.mockResolvedValue({ email: "unverified@t.com", isEmailVerified: false });
      createOtp.mockResolvedValue({});
      sendOtpEmail.mockResolvedValue({});

      const req = { body: { email: "unverified@t.com" } };
      const res = mockRes();

      await sendOtp(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(createOtp).toHaveBeenCalledWith(
        "unverified@t.com",
        expect.any(String),
        "email_verification",
        null,
      );
      expect(sendOtpEmail).toHaveBeenCalled();
    });

    test("200 – resends OTP preserving userData for a pending registration", async () => {
      const userData = { username: "alice", password: "hashed", isAdmin: false };
      findUserByEmail.mockResolvedValue(null);
      findLatestOtpByEmail.mockResolvedValue({ userData, otp: "111111" });
      createOtp.mockResolvedValue({});
      sendOtpEmail.mockResolvedValue({});

      const req = { body: { email: "alice@t.com" } };
      const res = mockRes();

      await sendOtp(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(createOtp).toHaveBeenCalledWith(
        "alice@t.com",
        expect.any(String),
        "email_verification",
        userData,
      );
    });

    test("200 – silent no-op when email is not registered and no pending OTP", async () => {
      findUserByEmail.mockResolvedValue(null);
      findLatestOtpByEmail.mockResolvedValue(null);

      const req = { body: { email: "ghost@t.com" } };
      const res = mockRes();

      await sendOtp(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(createOtp).not.toHaveBeenCalled();
      expect(sendOtpEmail).not.toHaveBeenCalled();
    });

    test("400 – if user is already verified", async () => {
      findUserByEmail.mockResolvedValue({ email: "v@t.com", isEmailVerified: true });
      const req = { body: { email: "v@t.com" } };
      const res = mockRes();

      await sendOtp(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Email is already verified." });
    });
  });

  // -------------------------------------------------------------------------
  // verifyOtp
  // -------------------------------------------------------------------------
  describe("verifyOtp", () => {
    test("400 – missing email or otp", async () => {
      const req = { body: { email: "a@t.com" } };
      const res = mockRes();
      await verifyOtp(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Email and OTP are required." });
    });

    test("400 – no OTP record found", async () => {
      findLatestOtpByEmail.mockResolvedValue(null);
      const req = { body: { email: "a@t.com", otp: "123456" } };
      const res = mockRes();
      await verifyOtp(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "No OTP found for this email. Please request a new one.",
      });
    });

    test("400 – incorrect OTP", async () => {
      findLatestOtpByEmail.mockResolvedValue({ otp: "123456" });
      const req = { body: { email: "unverified@t.com", otp: "000000" } };
      const res = mockRes();
      await verifyOtp(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid OTP." });
    });

    test("201 – deferred registration: creates user and verifies on correct OTP", async () => {
      const userData = { username: "alice", password: "hashed_pw", isAdmin: false };
      findLatestOtpByEmail.mockResolvedValue({ otp: "123456", userData });
      findUserByEmail.mockResolvedValue(null);
      createUser.mockResolvedValue({ id: "u1", username: "alice" });
      verifyEmailById.mockResolvedValue({});
      deleteOtpsByEmail.mockResolvedValue({});

      const req = { body: { email: "alice@t.com", otp: "123456" } };
      const res = mockRes();

      await verifyOtp(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(createUser).toHaveBeenCalledWith("alice", "alice@t.com", "hashed_pw");
      expect(verifyEmailById).toHaveBeenCalledWith("u1");
      expect(deleteOtpsByEmail).toHaveBeenCalledWith("alice@t.com", "email_verification");
    });

    test("201 – deferred registration: upgrades to admin when isAdmin=true", async () => {
      const userData = { username: "admin", password: "hashed_pw", isAdmin: true };
      findLatestOtpByEmail.mockResolvedValue({ otp: "123456", userData });
      findUserByEmail.mockResolvedValue(null);
      createUser.mockResolvedValue({ id: "u2", username: "admin" });
      verifyEmailById.mockResolvedValue({});
      updateUserPrivilegeById.mockResolvedValue({});
      deleteOtpsByEmail.mockResolvedValue({});

      const req = { body: { email: "admin@t.com", otp: "123456" } };
      const res = mockRes();

      await verifyOtp(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(updateUserPrivilegeById).toHaveBeenCalledWith("u2", true);
    });

    test("400 – deferred registration: rejects if user was already created between send and verify", async () => {
      const userData = { username: "alice", password: "hashed_pw", isAdmin: false };
      findLatestOtpByEmail.mockResolvedValue({ otp: "123456", userData });
      findUserByEmail.mockResolvedValue({ id: "existing" });
      deleteOtpsByEmail.mockResolvedValue({});

      const req = { body: { email: "alice@t.com", otp: "123456" } };
      const res = mockRes();

      await verifyOtp(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "User already exists." });
    });

    test("200 – existing unverified user is verified", async () => {
      findLatestOtpByEmail.mockResolvedValue({ otp: "123456" });
      findUserByEmail.mockResolvedValue({ id: "u1", isEmailVerified: false });
      verifyEmailById.mockResolvedValue({});
      deleteOtpsByEmail.mockResolvedValue({});

      const req = { body: { email: "unverified@t.com", otp: "123456" } };
      const res = mockRes();

      await verifyOtp(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(verifyEmailById).toHaveBeenCalledWith("u1");
    });

    test("400 – returns error if existing user email is already verified", async () => {
      findLatestOtpByEmail.mockResolvedValue({ otp: "123456" });
      findUserByEmail.mockResolvedValue({ id: "u1", isEmailVerified: true });
      deleteOtpsByEmail.mockResolvedValue({});

      const req = { body: { email: "v@t.com", otp: "123456" } };
      const res = mockRes();

      await verifyOtp(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Email is already verified." });
    });
  });
});
