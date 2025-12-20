/* eslint-disable @typescript-eslint/no-explicit-any */
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import config from "../../config";
import ApiError from "../../errors/apiError";
import { prisma } from "../../prisma/prisma";
import { PrismaQueryBuilder } from "../../utils/QueryBuilder";
import catchAsync from "../../utils/catchAsync";
import { fileUpload } from "../../utils/fileUpload";
import { jwtHelper } from "../../utils/JwtHelper";

const createUser = async (req: Request) => {
  const { password } = req.body;

  const isExistingUser = await prisma.user.findUnique({
    where: {
      email: req.body.email
    }
  })

  if (!password) {
    throw new ApiError(500, "password is required")
  }

  const hashPassword = await bcrypt.hash(password, 10)

  if (isExistingUser) {
    throw new ApiError(403, "User already exists!")
  }

  if (!req.file) {
    throw new ApiError(404, "file is required!");
  }

  const uploadedResult = await fileUpload.uploadToCloudinary(req.file);
  const image_url = uploadedResult?.secure_url;


  const result = await prisma.user.create({
    data: {
      name: req.body.name,
      email: req.body.email,
      password: hashPassword,
      role: req.body.role ?? "USER",
      profilePicture: image_url,
      authProvider: "LOCAL",

    }
  })



  return result

};

// New: Find or create Google user

// New: Find user by ID (for passport deserialize)
const findUserById = async (id: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return user;
  } catch (error) {
    throw new ApiError(500, `Error finding user: ${error}`);
  }
};


const getAllUsers = async (query: Record<string, any>) => {
  const qb = new PrismaQueryBuilder(query)
    .filter()
    .search(["name", "email"])
    .sort()
    .fields()
    .paginate();

  const prismaQuery = qb.build();

  const [data, total] = await Promise.all([
    prisma.user.findMany(prismaQuery),
    prisma.user.count({ where: prismaQuery.where }),
  ]);
  return {
    meta: qb.getMeta(total),
    data
  };
};

// New: Get current authenticated user
const getSingleUser = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
  });
};

const userUpdateProfile = async (userId: string, payload: any) => {
  const { name, oldPassword, newPassword, email } = payload;


  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const updateData: any = {};

  // update name
  if (name) {
    updateData.name = name;
  }

  if (email) {
    updateData.email = email
  }


  // update password
  if (oldPassword && newPassword) {

    if (!user.password) {
      throw new Error("Password not set for this user");
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      throw new Error("Old password is incorrect");
    }

    updateData.password = await bcrypt.hash(newPassword, 10);
  }


  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  return updatedUser;
};

const deleteUser = async (userId: string) => {
  return prisma.user.delete({
    where: { id: userId },
  });
};

const googleCallback = catchAsync(async (req: Request, res: Response) => {
  let redirectTo = typeof req.query.state === "string" ? req.query.state : "";

  if (redirectTo.startsWith("/")) {
    redirectTo = redirectTo.slice(1);
  }

  const user = req.user as any;


  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const accessToken = jwtHelper.generateToken(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    config.jwt.accessTokenSecret as string,
    "10d"
  );

  const refreshToken = jwtHelper.generateToken(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    config.jwt.refreshTokenSecret as string,
    "90d"
  );

  res.cookie("accessToken", accessToken, {
    secure: true,
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60
  })
  res.cookie("refreshToken", refreshToken, {
    secure: true,
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 90
  })

  res.redirect(
    `${config.frontend_url}/${redirectTo}?token=${accessToken}`
  );
});


export const UserService = {
  createUser,
  getAllUsers,
  findUserById,
  getSingleUser,
  userUpdateProfile,
  deleteUser,
  googleCallback
};