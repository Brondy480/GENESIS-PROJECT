import express from "express";
import { authMiddleware } from "../middlewares/Auth.middlewares.js";
import { getCreatorDashboard } from "../controllers/creatorDashboard.controller.js";

const router = express.Router();

router.get("/dashboard", authMiddleware,getCreatorDashboard );

export default router;
