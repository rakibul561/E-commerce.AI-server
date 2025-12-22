/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ProductService } from "./products.service";
import { ImageSearchService, VideoSearchService } from "../ai";

/* ===============================
   CREATE PRODUCT
================================ */
const createProduct = catchAsync(async (req: Request, res: Response) => {
  const decodedUser = req.user as any;
  const result = await ProductService.createProduct(
    req,
    decodedUser.userId
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Product created successfully",
    data: result
  });
});

/* ===============================
   GENERATE PRODUCT TEXT (AI)
================================ */
const generateProductText = catchAsync(async (req: Request, res: Response) => {
  const decodedUser = req.user as any;
  const result = await ProductService.generateProductText(
    req,
    decodedUser.userId
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "AI product text generated successfully",
    data: result
  });
});

/* ===============================
   SEARCH PRODUCT IMAGES
================================ */
const searchProductImages = catchAsync(async (req: Request, res: Response) => {
  const { query } = req.query;

  if (!query) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "Query parameter is required",
      data: []
    });
  }

  const images = await ImageSearchService.searchPexels(
    query as string,
    10
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product images fetched successfully",
    data: images
  });
});

/* ===============================
   SEARCH PRODUCT VIDEOS
================================ */
const searchProductVideos = catchAsync(async (req: Request, res: Response) => {
  const { query } = req.query;

  if (!query) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "Query parameter is required",
      data: []
    });
  }

  const videos = await VideoSearchService.searchYouTube(
    query as string,
    6
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product videos fetched successfully",
    data: videos
  });
});

/* ===============================
   GET PRODUCT BY ID
================================ */
const getProductById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await ProductService.getProductById(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product retrieved successfully",
    data: result
  });
});

/* ===============================
   GET ALL PRODUCTS
================================ */
const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getAllProducts(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All products retrieved successfully",
    data: result
  });
});

/* ===============================
   DELETE PRODUCT
================================ */
const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const { productId } = req.params;

  await ProductService.deleteProduct(productId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product deleted successfully",
    data: []
  });
});

/* ===============================
   EXPORT CONTROLLER
================================ */
export const ProductController = {
  createProduct,
  generateProductText,
  searchProductImages,   
  searchProductVideos,   
  getAllProducts,
  deleteProduct,
  getProductById
};
