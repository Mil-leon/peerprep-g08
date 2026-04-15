import UserModel from "./user-model.js";
import AdminCodeModel from "./admin-code-model.js";
import OtpModel from "./otp-model.js";

import "dotenv/config";
import { connect } from "mongoose";

export async function connectToDB() {
  let mongoDBUri =
    process.env.ENV === "PROD"
      ? process.env.DB_CLOUD_URI
      : process.env.DB_LOCAL_URI;

  await connect(mongoDBUri);
}

export async function createUser(username, email, password) {
  return new UserModel({ username, email, password }).save();
}

export async function findUserByEmail(email) {
  return UserModel.findOne({ email });
}

export async function findUserById(userId) {
  return UserModel.findById(userId);
}

export async function findUserByUsername(username) {
  return UserModel.findOne({ username });
}

export async function findUserByUsernameOrEmail(username, email) {
  return UserModel.findOne({
    $or: [
      { username },
      { email },
    ],
  });
}

export async function findAllUsers() {
  return UserModel.find();
}

export async function updateUserById(userId, username, email, password) {
  // Build the $set object dynamically so undefined fields are not overwritten
  const fields = {};
  if (username !== undefined) fields.username = username;
  if (email !== undefined) fields.email = email;
  if (password !== undefined) fields.password = password;

  return UserModel.findByIdAndUpdate(
    userId,
    { $set: fields },
    { new: true },  // return the updated user
  );
}

export async function updateUserPrivilegeById(userId, isAdmin) {
  return UserModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        isAdmin,
      },
    },
    { new: true },  // return the updated user
  );
}

export async function deleteUserById(userId) {
  return UserModel.findByIdAndDelete(userId);
}

export async function createAdminCode(code, createdBy) {
  return new AdminCodeModel({ code, createdBy }).save();
}


export async function findAndUseAdminCode(code) {
  return AdminCodeModel.findOneAndUpdate(
    { code, isUsed: false },
    { $set: { isUsed: true } },
    { new: true }
  );
}

// ---------------------------------------------------------------------------
// OTP functions (F1.1.2 – email confirmation, F3.3.2 – password reset)
// ---------------------------------------------------------------------------

/**
 * Deletes all existing OTPs for (email, purpose) then saves a new one.
 * @param {string} email
 * @param {string} otp
 * @param {'email_verification'|'purpose_reset'} purpose
 * @param {object} [userData] - Optional registration data for account verification
 */
export async function createOtp(email, otp, purpose = "email_verification", userData = null) {
  await OtpModel.deleteMany({ email, purpose });
  return new OtpModel({ email, otp, purpose, userData }).save();
}

/**
 * Finds the most recent unexpired OTP for the given email and purpose.
 * @param {string} email
 * @param {'email_verification'|'password_reset'} purpose
 */
export async function findLatestOtpByEmail(email, purpose = "email_verification") {
  return OtpModel.findOne({ email, purpose }).sort({ createdAt: -1 });
}

/**
 * Removes all OTP documents for a given (email, purpose).
 * @param {string} email
 * @param {'email_verification'|'password_reset'} [purpose] - omit to delete all purposes
 */
export async function deleteOtpsByEmail(email, purpose) {
  const filter = purpose ? { email, purpose } : { email };
  return OtpModel.deleteMany(filter);
}

/**
 * Marks the user's email as verified.
 */
export async function verifyEmailById(userId) {
  return UserModel.findByIdAndUpdate(
    userId,
    { $set: { isEmailVerified: true } },
    { new: true }
  );
}

// ---------------------------------------------------------------------------
// Profile picture (F3.1.2 / F3.2.3)
// ---------------------------------------------------------------------------

/**
 * Saves a base64-encoded profile picture for a user.
 * @param {string} userId
 * @param {string} base64DataUri  e.g. "data:image/jpeg;base64,..."
 */
export async function updateUserProfilePicture(userId, base64DataUri) {
  return UserModel.findByIdAndUpdate(
    userId,
    { $set: { profilePicture: base64DataUri } },
    { new: true }
  );
}

// ---------------------------------------------------------------------------
// Password reset (F3.3)
// ---------------------------------------------------------------------------

/**
 * Sets a new (already hashed) password for the given user.
 * @param {string} userId
 * @param {string} hashedPassword
 */
export async function resetPasswordById(userId, hashedPassword) {
  return UserModel.findByIdAndUpdate(
    userId,
    { $set: { password: hashedPassword } },
    { new: true }
  );
}
