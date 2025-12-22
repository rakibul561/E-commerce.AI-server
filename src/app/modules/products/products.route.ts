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
    
      if (req.body.data) {
        const parsedData = JSON.parse(req.body.data);
       
        req.body = productValidation.createProductSchema.parse(parsedData);
      } else {
       
        req.body = productValidation.createProductSchema.parse({});
      }
    } catch (error) {
     
      return next(error);
    }
    
    return ProductController.createProduct(req, res, next);
  }
);

router.post(
  "/:id/generate-text",
  auth(Role.ADMIN, Role.USER),
  checkCredits(2),
  ProductController.generateProductText
);

router.get("/", auth(Role.ADMIN, Role.USER), ProductController.getAllProducts);

router.get("/:id", auth(Role.ADMIN, Role.USER), ProductController.getProductById);

router.delete(
  "/:productId",
  auth(Role.ADMIN, Role.USER),
  ProductController.deleteProduct
);



export const ProductRoutes = router;