import express from "express";
import "./config/env.js";
import connectDB from "./database/db.js";
import { PORT } from "./config/env.js";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { Authrouter } from "./routes/Auth.route.js";
import errorMiddleware from "./middlewares/Errors.middlewares.js";
import redis from "./config/redis.js";
import Profilerouter from "./routes/profile.route.js";
import AdminRouter from "./routes/Admin.routes.js";
import ProjectRouter from "./routes/Project.routes.js";
import PublicProjectRouter from "./routes/publicProject.routes.js";
import fundingRoutes from "./routes/Funding.route.js";
import dns from "dns";
import investmentRoutes from "./routes/Investor.route.js";
import agreementSigning from "./routes/agreementSigning.route.js"


import creatorInvestmentRoutes from "./routes/creatorInvestment.routes.js";
import AdminInvestmentRequestRoutes from "./routes/AdminInvestmentRequest.route.js";
import project from "./models/Project.model.js";
import negotiationRoutes from "./routes/investmentNegotiation.route.js";
import { sendCounterOffer } from "./controllers/sendCounterOffer.controler.js";
import paymentRoutes from "./routes/paymentRoutes.js"
import { generateReceipt } from "./controllers/receiptGenerator.js";
import notificationRoutes from "./routes/notification.route.js";
import walletRoutes from "./routes/wallet.route.js";






dns.setDefaultResultOrder("ipv4first");










const app = express();





app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://localhost:8081",
    "https://genesis-project-seven.vercel.app",
  process.env.FRONTEND_URL,
  ],
  credentials: true,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(errorMiddleware)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/v1/Auth', Authrouter)
app.use('/api/v1/profile', Profilerouter)
app.use('/api/v1/admin', AdminRouter)
app.use('/api/v1/project', ProjectRouter)
app.use('/api/v1/publicProject', PublicProjectRouter)
app.use("/api/v1/projectsFunding", fundingRoutes);
app.use("/api/v1/investment", investmentRoutes);
app.use("/api/v1/AdminInvestmentRequest", AdminInvestmentRequestRoutes)
app.use("/api/v1/creator/investments", creatorInvestmentRoutes);
app.use("/api/v1/negotiation", negotiationRoutes);
app.use("/api/v1/payment/deal", paymentRoutes);
app.use("/api/v1/generateReceipt", generateReceipt)
app.use("/api/v1/agreements", agreementSigning);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/wallet", walletRoutes);









dotenv.config();

connectDB().then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.log(err);
});







app.get("/", (req, res) => {
  res.send("Hello World");
})


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})


app.use((err, req, res, next) => {
  console.error("🔥 ERROR STACK:", err.stack);
  res.status(500).json({
    message: "Internal Server Error",
    error: err.message,
  });
});


