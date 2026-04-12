import express from "express";
import {
  getCreatorInvestmentRequests,
  creatorAcceptInvestment,
  creatorRejectInvestment,
} from "../controllers/creatorInvestmentController.js";
import { authMiddleware } from "../middlewares/Auth.middlewares.js";
import Deal from "../models/Deal.js";


const router = express.Router();

// only creators
router.use(authMiddleware );

router.get("/PendingInvestmentRequests", getCreatorInvestmentRequests);

router.patch("/accept/:requestId", creatorAcceptInvestment);

router.patch("/reject/:requestId", creatorRejectInvestment);

// Creator deals — all deals where this user is the creator
router.get("/my-deals", async (req, res) => {
  try {
    const deals = await Deal.find({ creator: req.user._id })
      .populate("project", "title coverImage category")
      .populate("investor", "name email profileImage")
      .sort({ createdAt: -1 });
    res.status(200).json({ deals });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch deals", error: error.message });
  }
});

export default router;
 