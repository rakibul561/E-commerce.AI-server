import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { OtpRoutes } from "../modules/otp/otp.route";
import { ProductRoutes } from "../modules/products/products.route";
import { SubscriptionRoutes } from "../modules/subscription/subscription.route";
import { PaymentRoutes } from "../modules/payment/payment.route";

const router = Router();

router.use("/users", UserRoutes);
router.use("/auth", AuthRoutes);
router.use("/otp", OtpRoutes);
router.use("/products", ProductRoutes);
router.use("/subscription", SubscriptionRoutes);
router.use("/payment", PaymentRoutes);



export default router;