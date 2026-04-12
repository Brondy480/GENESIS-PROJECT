import Deal from "../models/Deal.js";
import Wallet from "../models/wallet.js";
import Shareholder from "../models/Shareholder.model.js";
import Project from "../models/Project.model.js";
import Escrow from "../models/Escrow.model.js";

export const getMyDeals = async (req, res) => {
  try {
    const deals = await Deal.find({
      investor: req.user._id,
    })
      .populate("project", "title coverImage category")
      .populate("creator", "name profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: deals.length,
      deals,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch your deals",
      error: error.message,
    });
  }
};
 
 

export const payForDeal = async (req, res) => {
  try {
    const { dealId } = req.params;

    const deal = await Deal.findById(dealId)
      .populate("investor", "email name")
      .populate("project", "title");

    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    if (deal.investor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (deal.paymentStatus === "paid") {
      return res.status(400).json({ message: "Deal already paid" });
    }

    const txRef = `deal_${deal._id}_${Date.now()}`;

    deal.txRef = txRef; // store reference
    await deal.save();

    const paymentPayload = {
      tx_ref: txRef,
      amount: deal.amount,
      currency: "XAF",
      redirect_url: `${process.env.BASE_URL}/api/v1/deals/verify/${deal._id}`,

      customer: {
        email: deal.investor.email,
        name: deal.investor.name,
      },

      customizations: {
        title: deal.project.title,
        description: "Startup investment",
      },
    };

    res.status(200).json({
      message: "Proceed to payment",
      paymentPayload,
    });

  } catch (error) {
    res.status(500).json({
      message: "Payment initiation failed",
      error: error.message,
    });
  }
};













export const verifyDealPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { dealId } = req.params;

    const deal = await Deal.findById(dealId).session(session);

    if (!deal) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Deal not found" });
    }

    if (deal.paymentStatus === "paid") {
      await session.abortTransaction();
      return res.status(400).json({ message: "Already processed" });
    }

    const project = await Project.findById(deal.project).session(session);

    //////////////////////////////////////////////////////
    // 🔥 FINAL EQUITY DEDUCTION
    //////////////////////////////////////////////////////

    project.equityAvailable -= deal.equity;
    project.equityLocked -= deal.equity;

    if (project.equityAvailable === 0) {
      project.status = "sold";
    }

    await project.save({ session });

    //////////////////////////////////////////////////////
    // MARK DEAL PAID
    //////////////////////////////////////////////////////

    deal.paymentStatus = "paid";
    deal.dealStatus = "in_escrow";

    await deal.save({ session });

    //////////////////////////////////////////////////////
    // CREATE ESCROW
    //////////////////////////////////////////////////////

    await Escrow.create([{
      deal: deal._id,
      investor: deal.investor,
      creator: deal.creator,
      amount: deal.amount,
      status: "holding",
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Payment verified. Equity finalized and funds in escrow.",
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({
      message: "Payment verification failed",
      error: error.message,
    });
  }
};
