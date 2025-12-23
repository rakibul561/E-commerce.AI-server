import { Router } from "express";
import auth from "../../middlewares/auth";
import { MetaController } from "./meta.controller";
import { Role } from "@prisma/client";

const router = Router();

router.get(
  "/",
  auth(Role.ADMIN),
  MetaController.getAdminDashboardMeta
);

export const MetaRoutes = router;
