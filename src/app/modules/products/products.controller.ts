/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ProductService } from "./products.service";

const createProduct = catchAsync(async (req: Request, res: Response) => {
  const decodedUser = req.user as any;
  const result = await ProductService.createProduct(req,decodedUser.userId);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Product created successfully",
    data: result
  });
});

const generateProductText = catchAsync(
  async (req: Request, res: Response) => {
      const decodedUser = req.user as any;
    const result = await ProductService.generateProductText(req, decodedUser.userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "AI product text generated successfully",
      data: result
    });
  }
);




export const ProductController = {
  createProduct,
  generateProductText
};
