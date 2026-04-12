import mongoose from "mongoose";
import Wallet from "../models/Wallet.model.js";
import Shareholder from "../models/Shareholder.model.js";
import Deal from "../models/Deal.model.js";
import Project from "../models/Project.model.js";
import Escrow from "../models/Escrow.model.js";

export const releaseEscrow = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { escrowId } = req.params;

    //////////////////////////////////////////////////
    // 🔒 0️⃣ ADMIN RESTRICTION
    //////////////////////////////////////////////////
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only admin can release escrow",
      });
    }

    //////////////////////////////////////////////////
    // 1️⃣ FIND ESCROW + POPULATE DEAL
    //////////////////////////////////////////////////
    const escrow = await Escrow.findById(escrowId)
      .populate("Deal")
      .session(session);

    if (!escrow) {
      throw new Error("Escrow not found");
    }

    if (escrow.status !== "holding") {
      throw new Error("Escrow already released or cancelled");
    }

    //////////////////////////////////////////////////
    // 2️⃣ CHECK BOTH SIGNATURES
    //////////////////////////////////////////////////
    if (
      !escrow.agreement.investorSigned ||
      !escrow.agreement.creatorSigned
    ) {
      throw new Error("Both parties must sign agreement first");
    }

    //////////////////////////////////////////////////
    // 3️⃣ PLATFORM FEE CALCULATION
    //////////////////////////////////////////////////
    const platformFeePercent = 5;
    const platformFee = (escrow.amount * platformFeePercent) / 100;
    const creatorAmount = escrow.amount - platformFee;

    //////////////////////////////////////////////////
    // 4️⃣ CREDIT CREATOR WALLET
    //////////////////////////////////////////////////
    await Wallet.findOneAndUpdate(
      { user: escrow.creator },
      {
        $inc: { balance: creatorAmount },
        $push: {
          transactions: {
            type: "credit",
            amount: creatorAmount,
            description: "Investment released from escrow",
            date: new Date(),
          },
        },
      },
      { upsert: true, session }
    );

    //////////////////////////////////////////////////
    // 5️⃣ CREATE SHAREHOLDER RECORD
    //////////////////////////////////////////////////
    await Shareholder.create(
      [
        {
          project: escrow.Deal.project,
          investor: escrow.investor,
          equityOwned: escrow.Deal.equity,
          investmentAmount: escrow.amount,
        },
      ],
      { session }
    );

    //////////////////////////////////////////////////
    // 6️⃣ UPDATE DEAL STATUS
    //////////////////////////////////////////////////
    await Deal.findByIdAndUpdate(
      escrow.Deal._id,
      {
        dealStatus: "active",
        paymentStatus: "released",
      },
      { session }
    );

    //////////////////////////////////////////////////
    // 7️⃣ UPDATE ESCROW STATUS
    //////////////////////////////////////////////////
    escrow.status = "released";
    escrow.releasedAt = new Date();
    await escrow.save({ session });

    //////////////////////////////////////////////////
    // 8️⃣ UPDATE PROJECT TOTAL FUNDED
    //////////////////////////////////////////////////
    await Project.findByIdAndUpdate(
      escrow.Deal.project,
      {
        $inc: { totalFunded: escrow.amount },
      },
      { session }
    );

    //////////////////////////////////////////////////
    // ✅ COMMIT TRANSACTION
    //////////////////////////////////////////////////
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Escrow released successfully",
      escrow,
    });

  } catch (error) {
    //////////////////////////////////////////////////
    // ❌ ROLLBACK IF ANYTHING FAILS
    //////////////////////////////////////////////////
    await session.abortTransaction();
    session.endSession();

    return res.status(500).json({
      message: "Escrow release failed",
      error: error.message,
    });
  }
};
