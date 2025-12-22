/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ProductService } from './products.service';
import { generateOtp } from '../otp/otp.service';

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

const getProductById = catchAsync (async (req:Request, res:Response) =>{
    
  const {id} = req.params;

  const result = await ProductService.getProductById(id);
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product retrieved successfully",
    data: result
  });
})

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getAllProducts(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All products retrieved successfully",
    data: result
  });
});


const deleteProduct = catchAsync(async (req: Request, res: Response) => {
   const {productId} = req.params;

   const result = await ProductService.deleteProduct(productId);
   sendResponse(res, {
    statusCode :200,
    success:true,
    message:"Product deleted successfully",
    data:[]
   })

})



export const ProductController = {
  createProduct,
  generateProductText,
  getAllProducts,
  deleteProduct,
  getProductById
};
