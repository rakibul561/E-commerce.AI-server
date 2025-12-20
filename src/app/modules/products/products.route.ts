import express, { Request, Response, NextFunction } from "express";
import { fileUpload } from "../../utils/fileUpload";
import { productValidation } from "./product.validation";
import { ProductController } from "./products.controller";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";
import { checkCredits } from "../../middlewares/credits.middleware";

const router = express.Router();

router.post(
  "/",
  auth(Role.ADMIN, Role.USER),
  fileUpload.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // ✅ data field আছে কিনা check করুন
      if (req.body.data) {
        const parsedData = JSON.parse(req.body.data);
        // ✅ validation করুন
        req.body = productValidation.createProductSchema.parse(parsedData);
      } else {
        // ✅ data না থাকলে empty object (title optional তাই problem নেই)
        req.body = productValidation.createProductSchema.parse({});
      }
    } catch (error) {
      // ✅ validation error handle করুন
      return next(error);
    }
    
    return ProductController.createProduct(req, res, next);
  }
);

router.post(
  "/:id/generate-text",
  auth(Role.ADMIN, Role.USER),
  checkCredits(2),
  // ✅ title optional body থেকে নেওয়ার জন্য কোনো extra middleware লাগবে না
  ProductController.generateProductText
);

export const ProductRoutes = router;