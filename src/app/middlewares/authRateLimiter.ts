import rateLimit from "express-rate-limit";

export const authRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 30,
    message: {
        success: false,
        message: "Too many login attempts. Try again after 1 minutes",
    },
});
