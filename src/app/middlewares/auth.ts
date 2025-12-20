/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import httpStatus from 'http-status';
import { jwtHelper } from "../utils/JwtHelper";
import ApiError from "../errors/apiError";
import config from "../config";

const auth = (...roles: string[]) => {
    return async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
        try {
            let user;

            const token = req.cookies.accessToken;

            if (token) {
                const secret = config.jwt.accessTokenSecret as string;
                const verifyUser = jwtHelper.verifyToken(token, secret);
                user = verifyUser;
            }

            else if (req.isAuthenticated && req.isAuthenticated()) {
                user = req.user;
            }


            if (!user) {
                throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
            }

            req.user = user;

            if (roles.length && !roles.includes(user.role)) {
                throw new ApiError(httpStatus.FORBIDDEN, "You don't have permission to access this resource!");
            }

            next();
        }
        catch (err) {
            next(err);
        }
    }
}

export default auth;

