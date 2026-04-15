import crypto from "crypto";

import {
  findUserByEmail as _findUserByEmail,
  createUser as _createUser,
  createOtp as _createOtp,
  findLatestOtpByEmail as _findLatestOtpByEmail,
  deleteOtpsByEmail as _deleteOtpsByEmail,
  verifyEmailById as _verifyEmailById,
  updateUserPrivilegeById as _updateUserPrivilegeById,
} from "../model/repository.js";

import { sendOtpEmail, sendPasswordResetEmail } from "../utils/mailer.js";
import bcrypt from "bcrypt";
import { resetPasswordById as _resetPasswordById } from "../model/repository.js";
import { validatePassword } from "../utils/validators.js";

/**
 * POST /auth/send-otp
 * Body: { email }
 *
 * Generates a 6-digit OTP and emails it to the supplied address.
 * The user account must already exist (registered) and must NOT yet be verified.
 */
export async function sendOtp(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    // First check if there is a pending registration (OTP with userData)
    const storedOtp = await _findLatestOtpByEmail(email, "email_verification");
    
    // If no pending registration and no existing user, we can't send an OTP
    const user = await _findUserByEmail(email);
    if (!user && (!storedOtp || !storedOtp.userData)) {
      // Return 200 for security – don't reveal whether the email is registered
      return res.status(200).json({ message: "If that email is registered, an OTP has been sent." });
    }

    if (user && user.isEmailVerified) {
      return res.status(400).json({ message: "Email is already verified." });
    }

    // Generate a cryptographically random 6-digit OTP
    const otp = String(crypto.randomInt(100000, 999999));

    // Preserve userData if it was a pending registration
    const userData = (storedOtp && storedOtp.userData) ? storedOtp.userData : null;

    await _createOtp(email, otp, "email_verification", userData);
    await sendOtpEmail(email, otp);

    return res.status(200).json({ message: "OTP sent to your email address. It expires in 10 minutes." });
  } catch (err) {
    console.error("sendOtp error:", err);
    return res.status(500).json({ message: "Failed to send OTP. Please try again later." });
  }
}

/**
 * POST /auth/verify-otp
 * Body: { email, otp }
 *
 * Verifies the OTP submitted by the user.
 * On success, marks the user's email as verified and removes stored OTPs.
 */
export async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required." });
    }

    const storedOtp = await _findLatestOtpByEmail(email, "email_verification");
    if (!storedOtp) {
      return res.status(400).json({ message: "No OTP found for this email. Please request a new one." });
    }

    if (storedOtp.otp !== String(otp)) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    // Handle deferred user creation if userData exists in the OTP record
    if (storedOtp.userData && storedOtp.userData.username) {
      const { username, password, isAdmin } = storedOtp.userData;
      
      // Double check uniqueness before final creation (to be safe)
      const existingUser = await _findUserByEmail(email);
      if (existingUser) {
        await _deleteOtpsByEmail(email, "email_verification");
        return res.status(400).json({ message: "User already exists." });
      }

      const createdUser = await _createUser(username, email, password);
      if (isAdmin) {
        await _updateUserPrivilegeById(createdUser.id, true);
      }
      
      // Automatically verify the newly created user
      await _verifyEmailById(createdUser.id);
      await _deleteOtpsByEmail(email, "email_verification");

      return res.status(201).json({ 
        message: "Email verified and account created successfully. You may now log in.",
        username: username 
      });
    }

    // If no userData, handle it as a verification for an already existing user (legacy/normal flow)
    const user = await _findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.isEmailVerified) {
      await _deleteOtpsByEmail(email, "email_verification");
      return res.status(400).json({ message: "Email is already verified." });
    }

    await _verifyEmailById(user.id);
    await _deleteOtpsByEmail(email, "email_verification");

    return res.status(200).json({ message: "Email verified successfully. You may now log in." });
  } catch (err) {
    console.error("verifyOtp error:", err);
    return res.status(500).json({ message: "Failed to verify OTP. Please try again later." });
  }
}

/**
 * POST /auth/forgot-password
 * Body: { email }
 *
 * Sends a password-reset OTP to the given email if an account exists.
 */
export async function sendPasswordResetOtp(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await _findUserByEmail(email);
    // Always return 200 to avoid leaking whether the email is registered
    if (!user) {
      return res.status(200).json({ message: "If that email is registered, a reset code has been sent." });
    }

    const otp = String(crypto.randomInt(100000, 999999));
    await _createOtp(email, otp, "password_reset");
    await sendPasswordResetEmail(email, otp);

    return res.status(200).json({ message: "Password reset code sent to your email. It expires in 10 minutes." });
  } catch (err) {
    console.error("sendPasswordResetOtp error:", err);
    return res.status(500).json({ message: "Failed to send reset code. Please try again later." });
  }
}

/**
 * POST /auth/reset-password
 * Body: { email, otp, newPassword }
 *
 * Verifies the password-reset OTP and updates the user's password.
 */
export async function resetPassword(req, res) {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP, and new password are required." });
    }

    const pwValidation = validatePassword(newPassword);
    if (!pwValidation.valid) {
      return res.status(400).json({ message: pwValidation.message });
    }

    const storedOtp = await _findLatestOtpByEmail(email, "password_reset");
    if (!storedOtp) {
      return res.status(400).json({ message: "No reset code found for this email. Please request a new one." });
    }

    if (storedOtp.otp !== String(otp)) {
      return res.status(400).json({ message: "Invalid reset code." });
    }

    const user = await _findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);

    await _resetPasswordById(user.id, hashedPassword);
    await _deleteOtpsByEmail(email, "password_reset");

    return res.status(200).json({ message: "Password reset successfully. You may now log in." });
  } catch (err) {
    console.error("resetPassword error:", err);
    return res.status(500).json({ message: "Failed to reset password. Please try again later." });
  }
}
