import express from "express";
import { authMiddleware } from "../middlewares/Auth.middlewares.js";


import { fundProject } from "../controllers/Funding.controller.js";
import Funding from "../models/Funding.model.js";


const router = express.Router();

// Get backer's fundings
router.get("/my-fundings", authMiddleware, async (req, res) => {
  try {
    const fundings = await Funding.find({ backer: req.user._id })
      .populate("project", "title coverImage category")
      .sort({ createdAt: -1 });
    res.status(200).json({ fundings });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch fundings", error: error.message });
  }
});

router.post(
  "/projects/:projectId/fund",
  authMiddleware,
  fundProject
);

export default router;  
