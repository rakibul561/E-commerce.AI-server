/* eslint-disable @typescript-eslint/no-unused-vars */
import config from "../../config";
import ApiError from "../../errors/apiError";
import { prisma } from "../../prisma/prisma";

import { jwtHelper } from "../../utils/JwtHelper";
import bcrypt from 'bcrypt'


const login = async (payload: { email: string, password: string }) => {

    const user = await prisma.user.findUniqueOrThrow({
        where: {
            email: payload.email
        }
    })

    if (!user || !user.password) {
        throw new ApiError(401, "Invalid credentials");
    }

    const isCorrectPassword = await bcrypt.compare(payload.password, user.password);


    const accessToken = jwtHelper.generateToken(
        {
            userId: user.id,
            email: user.email,
            role: user.role
        },
        config.jwt.accessTokenSecret as string,
        "10d"
    );
    const refreshToken = jwtHelper.generateToken(
        {
            userId: user.id,
            email: user.email,
            role: user.role
        },
        config.jwt.refreshTokenSecret as string,
        "90d"
    );


    return {
        accessToken,
        refreshToken,

    }
}


export const AuthServices = {
    login
}