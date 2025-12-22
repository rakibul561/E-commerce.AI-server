/* eslint-disable @typescript-eslint/no-explicit-any */

import { z } from "zod";
import { Request } from "express";
import ApiError from "../../errors/apiError";
import { fileUpload } from "../../utils/fileUpload";
import { prisma } from "../../prisma/prisma";
import { deductCredits } from "../../utils/creadit";
import { PrismaQueryBuilder } from "../../utils/QueryBuilder";
import { aiService } from "../ai"; // ✅ barrel import (recommended)

/* ===============================
   ZOD VALIDATION
================================ */
export const productValidation = {
  createProductSchema: z.object({
    title: z.string().optional()
  })
};

/* ===============================
   CREATE PRODUCT (IMAGE UPLOAD)
================================ */
const createProduct = async (req: Request, userId: string) => {
  if (!userId) {
    throw new ApiError(401, "User not found");
  }

  if (!req.file) {
    throw new ApiError(400, "Product image is required");
  }

  // 1️⃣ Upload image
  const uploadedImage = await fileUpload.uploadToCloudinary(req.file);

  if (!uploadedImage?.secure_url) {
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

/* ===============================
   GENERATE PRODUCT TEXT (AI)
================================ */
const generateProductText = async (req: Request, userId: string) => {
  const productId = req.params.id;
  const { title } = req.body || {};

  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product || !product.originalImage) {
    throw new ApiError(404, "Product not found");
  }

  // ✅ AI CALL (aligned with ai.service.ts)
  const aiResult = await aiService.generateCompleteProduct(
    product.originalImage,
    {
      userTitle: title || product.title || undefined
    }
  );

  const { content } = aiResult;

  // 🔹 DB update
  const updatedProduct = await prisma.product.update({
    where: { id: productId },
    data: {
      title: content.title,
      description: content.description,
      category: content.category,
      tags: content.tags,
      keywords: content.keywords,
      seoTitle: content.seoTitle,
      seoDescription: content.seoDescription,
      seoKeywords: content.seoKeywords,
      isDraft: false
    }
  });

  // 🔹 Credit deduct
  await deductCredits(userId, "GENERATE_TEXT", 2);

  return updatedProduct;
};

/* ===============================
   GET PRODUCT BY ID
================================ */
const getProductById = async (id: string) => {
  return prisma.product.findUnique({
    where: { id }
  });
};

/* ===============================
   GET ALL PRODUCTS
================================ */
const getAllProducts = async (query: Record<string, any>) => {
  const qb = new PrismaQueryBuilder(query)
    .filter()
    .search(["title", "category"])
    .sort()
    .fields()
    .paginate();

  const prismaQuery = qb.build();

  const [products, total] = await Promise.all([
    prisma.product.findMany(prismaQuery),
    prisma.product.count({ where: prismaQuery.where })
  ]);

  return {
    meta: qb.getMeta(total),
    data: products
  };
};

/* ===============================
   DELETE PRODUCT
================================ */
const deleteProduct = async (productId: string) => {
  return prisma.product.delete({
    where: { id: productId }
  });
};

/* ===============================
   EXPORT
================================ */
export const ProductService = {
  createProduct,
  generateProductText,
  getAllProducts,
  deleteProduct,
  getProductById
};
