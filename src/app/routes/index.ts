import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { OtpRoutes } from "../modules/otp/otp.route";
import { ProductRoutes } from "../modules/products/products.route";
import { SubscriptionRoutes } from "../modules/subscription/subscription.route";
<<<<<<< HEAD
import { PaymentRoutes } from "../modules/payment/payment.route";
=======
import { MetaRoutes } from "../modules/meta/meta.route";
>>>>>>> 8b535937e44b0df645356185d178655ea6587faa

const router = Router();

router.use("/users", UserRoutes);
router.use("/auth", AuthRoutes);
router.use("/otp", OtpRoutes);
router.use("/products", ProductRoutes);
router.use("/subscription", SubscriptionRoutes);
<<<<<<< HEAD
router.use("/payment", PaymentRoutes);
=======
router.use("/dashboard", MetaRoutes)
>>>>>>> 8b535937e44b0df645356185d178655ea6587faa



export default router;