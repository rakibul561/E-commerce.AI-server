/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */

import { NextFunction, Request, Response } from "express"
import httpStatus from "http-status"


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.log("server error", err);

    let statusCode: number = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    const success = false;
    let message = err.message || "Something went wrong!";
    let error = err;



    res.status(statusCode).json({
        success,
        message,
        error
    })
};

export default globalErrorHandler;