import express from "express";
import { simulatePayment } from "../controllers/paymentController.js";
import { investorPayDeal,getInvestorDealById,getInvestorDeals } from "../controllers/InvestorPayDeal.controler.js";
import { authMiddleware } from "../middlewares/Auth.middlewares.js";


const router = express.Router();

router.post("/:dealId/pay",authMiddleware, investorPayDeal);
router.get("/", authMiddleware, getInvestorDeals);
router.get("/:dealId", authMiddleware, getInvestorDealById);

export default router;