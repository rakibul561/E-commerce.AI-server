import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import session from "express-session";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import router from "./app/routes";

import config from "./app/config";
import morgan from 'morgan';
import passport from "../src/app/config/passport"
import { paymentController } from "./app/modules/payment/payemnt.controller";



const app: Application = express();

// Webhook must be before other middleware
app.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    paymentController.handleStripeWebhook
);


app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(morgan('combined'))


app.use(
    session({
        secret: config.google.clientSecret as string,
        resave: false,
        saveUninitialized: false,
    })
);

app.use(passport.initialize());
app.use(passport.session());


app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        statusCode: 200,
        message: "Welcome to E commerce.AI-server",
        authenticated: req.isAuthenticated(),
    });
});

app.set("trust proxy", 1);

app.use("/api/v1", router);

app.use(notFound);
app.use(globalErrorHandler);

export default app;