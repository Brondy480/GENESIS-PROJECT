import mongoose from "mongoose";
import Escrow from "../models/Escrow.model.js";
import Deal from "../models/Deal.js";
import Project from "../models/Project.model.js";
import Wallet from "../models/wallet.js";
import Shareholder from "../models/Shareholder.model.js";
import Users from "../models/Users.model.js";
import { createNotification } from "../services/notification.service.js";
import { sendEscrowReleasedEmail } from "../services/emailService.js";

////////////////////////////////////////////////////////
// ADMIN VALIDATE AGREEMENT
////////////////////////////////////////////////////////

export const adminValidateAgreement = async (req, res) => {
  try {
    const { escrowId } = req.params;

    // Admin only
    if (req.user.userType !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const escrow = await Escrow.findById(escrowId);
    if (!escrow) return res.status(404).json({ message: "Escrow not found" });

    // Both parties must have signed
    if (!escrow.agreement.investorSigned || !escrow.agreement.creatorSigned) {
      return res.status(400).json({
        message: "Cannot validate — both parties must sign first",
        investorSigned: escrow.agreement.investorSigned,
        creatorSigned: escrow.agreement.creatorSigned,
      });
    }
 
    // Must be ready_for_release
    if (escrow.status !== "ready_for_release") {
      return res.status(400).json({
        message: `Escrow is not ready for validation. Current status: ${escrow.status}`,
      });
    }

    // Already validated
    if (escrow.agreement.adminValidated) {
      return res.status(400).json({ message: "Agreement already validated" });
    }

    escrow.agreement.adminValidated = true;
    escrow.agreement.adminValidatedAt = new Date();
    await escrow.save();

    return res.status(200).json({
      message: "Agreement validated successfully. You can now release the escrow.",
      escrowId: escrow._id,
      status: escrow.status,
      adminValidated: escrow.agreement.adminValidated,
    });

  } catch (error) {
    console.error("Admin validate error:", error.message);
    return res.status(500).json({
      message: "Validation failed",
      error: error.message,
    });
  }
};

////////////////////////////////////////////////////////
// ADMIN RELEASE ESCROW
////////////////////////////////////////////////////////

export const adminReleaseEscrow = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { escrowId } = req.params;

    // Admin only
    if (req.user.userType !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    // 1️⃣ Load escrow
    const escrow = await Escrow.findById(escrowId).session(session);
    if (!escrow) throw new Error("Escrow not found");

    // 2️⃣ Validations
    if (escrow.status !== "ready_for_release") {
      throw new Error(`Escrow not ready for release. Status: ${escrow.status}`);
    }

    if (!escrow.agreement.adminValidated) {
      throw new Error("Agreement must be validated before releasing escrow");
    }

    if (escrow.status === "released") {
      throw new Error("Escrow already released");
    }

    // 3️⃣ Load deal
    const deal = await Deal.findById(escrow.deal).session(session);
    if (!deal) throw new Error("Deal not found");

    // 4️⃣ Calculate platform fee
    const platformFeePercent = deal.platformFeePercent || 5;
    const platformFeeAmount = (escrow.amount * platformFeePercent) / 100;
    const creatorReceives = escrow.amount - platformFeeAmount;

    console.log(`💰 Escrow amount: $${escrow.amount}`);
    console.log(`💰 Platform fee (${platformFeePercent}%): $${platformFeeAmount}`);
    console.log(`💰 Creator receives: $${creatorReceives}`);

    // 5️⃣ Credit creator wallet
    const creatorWallet = await Wallet.findOne({
      user: escrow.creator,
    }).session(session);

    if (!creatorWallet) throw new Error("Creator wallet not found");

    creatorWallet.balance += creatorReceives;
    creatorWallet.transactions.push({
      type: "credit",
      amount: creatorReceives,
      description: `Investment escrow released for deal ${deal._id}`,
      relatedDeal: deal._id,
    });
    await creatorWallet.save({ session });

    // 6️⃣ Create Shareholder record
    await Shareholder.create(
      [
        {
          project: escrow.project,
          investor: escrow.investor,
          equityOwned: deal.equity,
          investmentAmount: deal.amount,
          deal: deal._id,
        },
      ],
      { session }
    );

    // 7️⃣ Add investor to project shareholders array
    await Project.findByIdAndUpdate(
      escrow.project,
      {
        $push: {
          shareholders: {
            investor: escrow.investor,
            equity: deal.equity,
            deal: deal._id,
          },
        },
        $inc: { totalFunded: deal.amount },
      },
      { session }
    );

    // 8️⃣ Update deal status
    deal.dealStatus = "active";
    deal.platformFeeAmount = platformFeeAmount;
    await deal.save({ session });

    // 9️⃣ Update escrow status
    escrow.status = "released";
    escrow.releasedAt = new Date();
    await escrow.save({ session });

    // 🔟 Commit
    await session.commitTransaction();
    session.endSession();

    console.log("✅ Escrow released successfully");

    // ✅ NOTIFICATIONS (outside transaction)
    try {
      const investor = await Users.findById(escrow.investor).select("name email");
      const creator = await Users.findById(escrow.creator).select("name email");
      const project = await Project.findById(escrow.project).select("title");

      // In-app — investor
      await createNotification({
        recipient: escrow.investor,
        type: "deal_completed",
        title: "Deal Completed — You Are Now a Shareholder",
        message: `Your investment of ${deal.amount.toLocaleString()} FCFA in ${project.title} is complete. You now own ${deal.equity}% equity.`,
        data: { dealId: deal._id, projectId: escrow.project },
      });

      // In-app — creator
      await createNotification({
        recipient: escrow.creator,
        type: "escrow_released",
        title: "Funds Released to Your Wallet",
        message: `${creatorReceives.toLocaleString()} FCFA has been credited to your wallet from the investment in ${project.title}.`,
        data: { dealId: deal._id, projectId: escrow.project },
      });

      // Emails
      await sendEscrowReleasedEmail({
        recipientEmail: creator.email,
        recipientName: creator.name,
        projectTitle: project.title,
        amount: creatorReceives,
        platformFee: platformFeeAmount,
        role: "creator",
      });

      await sendEscrowReleasedEmail({
        recipientEmail: investor.email,
        recipientName: investor.name,
        projectTitle: project.title,
        amount: deal.amount,
        equity: deal.equity,
        role: "investor",
      });

    } catch (notifError) {
      console.error("Notification error (non-blocking):", notifError.message);
    }

    return res.status(200).json({
      message: "Escrow released successfully",
      creatorReceives,
      platformFee: platformFeeAmount,
      dealStatus: "active",
      escrowStatus: "released",
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ Release escrow error:", error.message);
    return res.status(500).json({
      message: "Failed to release escrow",
      error: error.message,
    });
  }
};

////////////////////////////////////////////////////////
// ADMIN GET ALL ESCROWS
////////////////////////////////////////////////////////

export const adminGetAllEscrows = async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { status } = req.query;
    const filter = status ? { status } : {};

    const escrows = await Escrow.find(filter)
      .populate("project", "title coverImage")
      .populate("investor", "name email")
      .populate("creator", "name email")
      .populate("deal", "amount equity dealStatus platformFeePercent")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: escrows.length,
      escrows,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch escrows",
      error: error.message,
    });
  }
};