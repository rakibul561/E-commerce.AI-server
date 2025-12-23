import express, { NextFunction, Request, Response } from "express";
import { UserController } from "./user.controller";
import { fileUpload } from "../../utils/fileUpload";
import { userValidation } from "./user.validation";
import auth from "../../middlewares/auth";
import { Role as UserRole } from "@prisma/client";
import passport from "passport";
import { UserService } from "./user.service";

const router = express.Router();

router.get(
    "/auth/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
        prompt: "select_account"
    })
);

router.get(
    "/auth/google/callback",
    passport.authenticate("google", { session: false }),
    UserService.googleCallback
);

// Existing routes
router.post("/register",
    fileUpload.upload.single("file"),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = userValidation.createUserValidationSchema.parse(JSON.parse(req.body.data))
        return UserController.createUser(req, res, next)
    }
);

router.patch(
  "/profile",
  auth(UserRole.USER, UserRole.ADMIN),
  fileUpload.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = userValidation.updateUserValidationSchema.parse(
      JSON.parse(req.body.data)
    );
    return UserController.userUpdateProfile(req, res, next);
  }
);


// Get current user (protected)
router.get("/me", auth(UserRole.USER, UserRole.ADMIN), UserController.getSingleUser);

// FIND USER BY ID (protected)
router.get("/:id", auth(UserRole.ADMIN), UserController.getFindUserById);

// GET ALL USERS (protected)
router.get("/", auth(UserRole.ADMIN), UserController.getAllUsers);

// DELETE USER BY ID (protected)
router.delete("/:id", auth(UserRole.ADMIN), UserController.deleteUser);








export const UserRoutes = router;