import express from "express";
import { getMyDeals, payForDeal } from "../controllers/dealController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/my-deals", protect, getMyDeals);

router.post("/pay/:dealId", protect, payForDeal)

export default router;