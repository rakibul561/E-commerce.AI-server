/* eslint-disable @typescript-eslint/no-explicit-any */

import { z } from "zod";

export const productValidation = {
  createProductSchema: z.object({
    title: z.string().optional(), 

  })
};

// ==========================================
import { Request } from "express";
import ApiError from "../../errors/apiError";
import { fileUpload } from "../../utils/fileUpload";
import { prisma } from "../../prisma/prisma";
import { deductCredits } from "../../utils/creadit";
import { aiService } from "../ai/ai.service";
import { PrismaQueryBuilder } from "../../utils/QueryBuilder";

const createProduct = async (req: Request, userId: string) => {
  if (!userId) {
    throw new ApiError(401, "User not found");
  }

  if (!req.file) {
    throw new ApiError(400, "Product image is required");
  }

  // 1️⃣ Upload image to cloudinary
  const uploadedImage = await fileUpload.uploadToCloudinary(req.file);

  if (!uploadedImage) {
    throw new ApiError(400, "Failed to upload product image");
  }

  const { title } = req.body || {};

  const product = await prisma.product.create({
    data: {
      userId,
      originalImage: uploadedImage.secure_url,
      title: title || null, 
      isDraft: true
    }
  });

  return product;
};

const generateProductText = async (req: Request, userId: string) => {
  const productId = req.params.id;

  const { title } = req.body || {};

  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product || !product.originalImage) {
    throw new ApiError(404, "Product not found");
  }

  const titleToUse = title || product.title || undefined;

  const aiResult = await aiService.generateTextFromImage(
    product.originalImage,
    titleToUse
  );

  // 🔹 DB update
  const updatedProduct = await prisma.product.update({
    where: { id: productId },
    data: {
      title: aiResult.title,
      description: aiResult.description,
      category: aiResult.category,
      tags: aiResult.tags,
      keywords: aiResult.keywords,
      seoTitle: aiResult.seoTitle,
      seoDescription: aiResult.seoDescription,
      seoKeywords: aiResult.seoKeywords
    }
  });

  // 🔹 Credit deduct + log
  await deductCredits(userId, "GENERATE_TEXT", 2);

  return updatedProduct;
};


const getProductById = async (id:string) =>{
  console.log("the product id is ",id)
   const result = await prisma.product.findUnique({
    where : {
      id: id
    }
   })
   return result
}

const getAllProducts = async (query: Record<string, any>)  => {
  const qb = new PrismaQueryBuilder(query)
     .filter()
    .search(["name", "email"])
    .sort()
    .fields()
    .paginate();

    const prismaQuery = qb.build();

    const [products, total] = await Promise.all([
      prisma.product.findMany(prismaQuery),
      prisma.product.count({ where: prismaQuery.where }),
    ]);
  return {
    meta:qb.getMeta(total),
    data:products
  };
};


const deleteProduct = async (productId: string) => {
  const result = await prisma.product.delete({
    where : {
      id:productId
    }
  })

  return result
};


export const ProductService = {
  createProduct,
  generateProductText,
  getAllProducts,
  deleteProduct,
  getProductById
};