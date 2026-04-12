import mongoose from "mongoose";
import Deal from "../models/Deal.model.js";
import Escrow from "../models/Escrow.model.js";
import Project from "../models/Project.model.js";

export const confirmPaymentAndCreateEscrow = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { dealId } = req.params;
    const { paymentReference } = req.body;

    const user = req.user;

    // 🔎 Load deal inside transaction
    const deal = await Deal.findById(dealId).session(session);

    if (!deal) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Deal not found" });
    }

    // ✅ Only investor can confirm payment
    if (deal.investor.toString() !== user._id.toString()) {
      await session.abortTransaction();
      return res.status(403).json({ message: "Not authorized" });
    }

    // ✅ Prevent duplicate confirmation
    if (deal.dealStatus !== "awaiting_payment") {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Payment already confirmed or deal invalid",
      });
    }

    // 🔐 Lock project to prevent race conditions
    const project = await Project.findById(deal.project).session(session);

    if (!project || project.status === "closed" || project.isLocked) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Project is closed or unavailable",
      });
    }

    // =====================================================
    // 💰 MARK DEAL AS FUNDS SECURED
    // =====================================================

    deal.dealStatus = "funds_secured";
    deal.paymentReference = paymentReference;
    deal.paidAt = new Date();

    await deal.save({ session });

    // =====================================================
    // 🏦 CREATE ESCROW RECORD
    // =====================================================

    const escrow = await Escrow.create([{
      deal: deal._id,
      investor: deal.investor,
      creator: deal.creator,
      amount: deal.amount,
      status: "holding",
      agreementStatus: "pending_generation",
    }], { session });

    // =====================================================
    // 🔁 Move deal to agreement phase
    // =====================================================

    deal.dealStatus = "funds_secured";
    await deal.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Payment confirmed. Escrow created successfully.",
      escrow: escrow[0],
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    return res.status(500).json({
      message: "Payment confirmation failed",
      error: error.message,
    });
  }
};