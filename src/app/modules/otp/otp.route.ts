// src/modules/otp/otp.routes.ts
import express from "express";
import { OTPController } from "./otp.controller";
import { authRateLimiter } from "../../middlewares/authRateLimiter";

const router = express.Router();

router.post("/send", OTPController.sendOTP);
router.post("/verify",authRateLimiter, OTPController.verifyOTP);

export const OtpRoutes = router;