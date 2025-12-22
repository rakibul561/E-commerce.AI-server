/* eslint-disable @typescript-eslint/no-empty-function */
import crypto from "crypto";
import ApiError from "../../errors/apiError";
import { redisClient } from "../../config/redis.config";
import { sendEmail } from "../../utils/emailSender";
import { prisma } from "../../prisma/prisma";

const OTP_EXPIRATION = 2 * 60; // 2 minutes in seconds

export const generateOtp = (length = 6) => {
    const otp = crypto.randomInt(10 ** (length - 1), 10 ** length).toString();
    return otp;
};

const sendOTP = async (email: string, name: string) => {
    // findOne নয়, findUnique ব্যবহার করতে হবে Prisma তে
    const user = await prisma.user.findUnique({
        where: {
            email: email
        }
    });

    if (!user) {
        throw new ApiError(404, "User Not found");
    }

    if (user.isVerified) {
        throw new ApiError(401, "You Are Already Verified");
    }

    const otp = generateOtp();
    const redisKey = `otp:${email}`;

  
    await redisClient.setEx(redisKey, OTP_EXPIRATION, otp);

    await sendEmail({
        to: email,
        subject: "Your OTP Code",
        templateName: "otp",
        templateData: {      
            name: name,
            otp: otp
        }
    });

    return { message: "OTP sent successfully" };
};

const verifyOTP = async (email: string, otp: string) => {
    const redisKey = `otp:${email}`;
    const savedOtp = await redisClient.get(redisKey);

    const user = await prisma.user.findUnique({ 
        where: { email } 
    });

    if (!user) {
        throw new ApiError(404, "User Not found");
    }
    if (user.isVerified) {
        throw new ApiError(401, "You Are Already Verified");
    }

    if (!savedOtp) {
        throw new ApiError(401, "Invalid or Expired OTP");
    }

    if (savedOtp !== otp) {
        throw new ApiError(401, "Invalid OTP");
    }


    await Promise.all([
        prisma.user.update({
            where: { email },
            data: {
                isVerified: true
            }
        }),
        redisClient.del(redisKey) 
    ]);

    return { message: "OTP verified successfully" };
};

export const OTPService = {
    sendOTP,
    verifyOTP
};