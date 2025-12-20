
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

  // ✅ Optional title from request body
  const { title } = req.body || {};

  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product || !product.originalImage) {
    throw new ApiError(404, "Product not found");
  }

  // 🔹 Use existing title or new title from request or let AI generate
  const titleToUse = title || product.title || undefined;

  // 🔹 AI call with optional title
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

export const ProductService = {
  createProduct,
  generateProductText
};