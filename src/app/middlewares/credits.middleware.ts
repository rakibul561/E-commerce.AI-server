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

    // ✅ Different ways to get userId - try all possible fields
    const userId = req.user.userId || req.user.id || req.user._id;
    


    if (!userId) {
      console.error("❌ No userId found in req.user:", req.user);
      return res.status(401).json({
        success: false,
        message: "User ID not found in token"
      });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      console.log("✅ User from DB:", user ? "Found" : "Not Found"); // Debug

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
      console.error("❌ Error in checkCredits:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  };
};