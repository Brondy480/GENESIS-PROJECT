import express from "express";
import { authMiddleware } from "../middlewares/Auth.middlewares.js";
import { sendNegotiationMessage,getNegotiationMessages } from "../controllers/investmentNegotiation.controller.js";
import { sendCounterOffer } from "../controllers/sendCounterOffer.controler.js";


const router = express.Router();

// 🔹 send a message (chat-style)
router.post("/:requestId/message", authMiddleware, sendNegotiationMessage);

// 🔹 send a counter offer (special negotiation)
router.post("/:requestId/counter", authMiddleware, sendCounterOffer);

// 🔹 get negotiation messages
router.get("/:requestId/messages", authMiddleware, getNegotiationMessages);

export default router;
