import express from "express";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";
import { paymentController } from "./payemnt.controller";

const router = express.Router();


router.get(
    "/",
    auth(Role.ADMIN),
    paymentController.getAllPayment
);

router.get(
    "/my-payment",
    auth(Role.USER, Role.ADMIN),
    paymentController.getPaymentByUser
);


export const PaymentRoutes = router;