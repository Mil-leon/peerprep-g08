import express from "express";

import { handleLogin, handleVerifyToken, handleGetMe} from "../controller/auth-controller.js";
import { sendOtp, verifyOtp, sendPasswordResetOtp, resetPassword } from "../controller/otp-controller.js";
import { verifyAccessToken } from "../middleware/basic-access-control.js";

const router = express.Router();

router.post("/login", handleLogin);

router.get("/verify-token", verifyAccessToken, handleVerifyToken);

router.get("/me", verifyAccessToken, handleGetMe)

// Email OTP verification
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

// Password reset
router.post("/forgot-password", sendPasswordResetOtp);
router.post("/reset-password", resetPassword);

export default router;
