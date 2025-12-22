/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { prisma } from "../prisma/prisma";

export const checkCredits = (cost: number) => {
  return async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "You are Unauthorized"
      });
    }
    const userId = req.user.userId || req.user.id || req.user._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in token"
      });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });


      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found in database"
        });
      }

      if (user.credits < cost) {
        return res.status(403).json({
          success: false,
          message: `Not enough credits. Required: ${cost}, Available: ${user.credits}`
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  };
};