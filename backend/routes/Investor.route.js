import express from "express";
import { authMiddleware } from "../middlewares/Auth.middlewares.js";
import { getInvestorPortfolio } from "../controllers/investorPortfolio.controller.js";
import { sendInvestmentRequest } from "../controllers/Investment.controller.js";
import InvestmentRequest from "../models/investment.model.js";


const router = express.Router();

// Get investor's own investment requests
router.get("/my-requests", authMiddleware, async (req, res) => {
  try {
    const requests = await InvestmentRequest.find({ investor: req.user._id })
      .populate("project", "title coverImage category targetAmount valuation")
      .sort({ createdAt: -1 });
    res.status(200).json({ requests });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch requests", error: error.message });
  }
});

router.get("/portfolio", authMiddleware, getInvestorPortfolio);

router.post(
  "/projects/:projectId/invest",
  authMiddleware,
  sendInvestmentRequest
);

export default router;
