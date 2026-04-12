import express from "express";
import { authMiddleware } from "../middlewares/Auth.middlewares.js";
import Wallet from "../models/wallet.js";

const router = express.Router();

// Get current user's wallet
router.get("/my", authMiddleware, async (req, res) => {
    try {
        let wallet = await Wallet.findOne({ user: req.user._id });

        if (!wallet) {
            // Create wallet if doesn't exist
            wallet = await Wallet.create({ user: req.user._id });
        }

        res.status(200).json({ wallet });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch wallet", error: error.message });
    }
});

export default router;
