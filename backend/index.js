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
// Prometheus metrics endpoint
import { register, collectDefaultMetrics, Counter, Histogram } from 'prom-client';

// Collect default Node.js metrics (memory, CPU, etc.)
collectDefaultMetrics({ register });

// Custom metric: count total HTTP requests
const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

// Custom metric: track request duration
const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

// Middleware to record metrics for every request
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestsTotal.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode,
    });
    httpRequestDuration.observe(
      { method: req.method, route: req.route?.path || req.path, status_code: res.statusCode },
      duration
    );
  });
  next();
});

// Expose metrics endpoint for Prometheus to scrape
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});






dns.setDefaultResultOrder("ipv4first");










const app = express();





const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "https://genesis-project-seven.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (Postman, mobile apps)
    if (!origin) return callback(null, true);
    
    // Allow any vercel.app subdomain for this project
    if (origin.includes("genesis-project") && origin.includes("vercel.app")) {
      return callback(null, true);
    }
    
    // Allow specific origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
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


