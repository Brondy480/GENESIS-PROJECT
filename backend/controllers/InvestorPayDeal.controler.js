import mongoose from "mongoose";
import Deal from "../models/Deal.js";
import Escrow from "../models/Escrow.model.js";
import Project from "../models/Project.model.js";
import { processPayment as paymentService } from "../services/paymentService.js";
import { sendAgreementSigningEmail, sendPaymentConfirmedEmail } from "../services/emailService.js";
import { createNotification } from "../services/notification.service.js";
import Users from "../models/Users.model.js";
import {
  generateAgreementPDF,
  uploadPDFToCloudinary,
} from "../services/agreementPDF.service.js";

export const investorPayDeal = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { dealId } = req.params;
    const userId = req.user._id;

    // 1️⃣ Load deal and populate project
    const deal = await Deal.findById(dealId)
      .populate("project")
      .session(session);

    if (!deal) throw new Error("Deal not found");

    // 2️⃣ Security checks
    if (deal.investor.toString() !== userId.toString())
      throw new Error("Unauthorized: Only the investor can pay this deal");

    if (deal.dealStatus !== "awaiting_payment")
      throw new Error("Deal not awaiting payment");

    const project = deal.project;
    if (!project) throw new Error("Project not found");

    if (!project.deadline || !project.targetAmount)
      throw new Error("Project missing required fields: deadline or targetAmount");

    // 3️⃣ Validate equity availability
    const availableEquity = project.equityAvailable - project.equityLocked;
    if (deal.equity > availableEquity) {
      throw new Error(
        `Cannot invest ${deal.equity}%. Only ${availableEquity}% equity is available.`
      );
    }

    // 4️⃣ Process payment (MVP or Stripe)
    const paymentResult = await paymentService(deal, req.user, session);
    if (!paymentResult.success) throw new Error("Payment failed");

    // 5️⃣ Update ALL project fields in ONE save
    // lock → deduct → update funding all at once
    await Project.findByIdAndUpdate(
      project._id,
      {
        $inc: {
          currentAmount: deal.amount,
          equityAvailable: -deal.equity,
          // equityLocked stays 0 (lock + unlock = net 0)
        },
      },
      { session, new: true, runValidators: true }
    );

    // 6️⃣ Create escrow
    const escrow = await Escrow.create(
      [
        {
          deal: deal._id,
          investor: deal.investor,
          creator: deal.creator,
          project: project._id,
          amount: deal.amount,
          status: "holding",
        },
      ],
      { session }
    );

    // 7️⃣ Update deal status
    deal.dealStatus = "payment_completed";
    deal.escrow.escrowId = escrow[0]._id;
    await deal.save({ session });

    // 8️⃣ Commit transaction
    await session.commitTransaction();
    session.endSession();

    const updatedDeal = await Deal.findById(deal._id).populate("project");

    // ✅ GENERATE AGREEMENT PDF (outside transaction — non blocking)
    try {
      const investor = await Users.findById(deal.investor).select("name email");
      const creator = await Users.findById(deal.creator).select("name email");

      const pdfBuffer = await generateAgreementPDF({
        dealId: deal._id.toString(),
        projectTitle: project.title,
        creatorName: creator.name,
        investorName: investor.name,
        amount: deal.amount,
        equity: deal.equity,
        valuation: project.valuation || null,
        date: new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      });

      const pdfUrl = await uploadPDFToCloudinary(
        pdfBuffer,
        `agreement_${deal._id}_${Date.now()}`
      );

      // save URL in escrow
      await Escrow.findByIdAndUpdate(escrow[0]._id, {
        "agreement.documentUrl": pdfUrl,
      });

      console.log("✅ Agreement PDF generated:", pdfUrl);

    } catch (pdfError) {
      console.error("PDF generation error (non-blocking):", pdfError.message);
    }

    // ✅ SEND NOTIFICATIONS (outside transaction — non blocking)
    try {
      const investor = await Users.findById(deal.investor).select("name email");
      const creator = await Users.findById(deal.creator).select("name email");
      const projectTitle = project.title;

      // 📧 Email to investor
      await sendAgreementSigningEmail({
        recipientEmail: investor.email,
        recipientName: investor.name,
        role: "investor",
        projectTitle,
        dealAmount: deal.amount,
        escrowId: escrow[0]._id,
      });

      // 📧 Email to creator
      await sendPaymentConfirmedEmail({
        recipientEmail: creator.email,
        recipientName: creator.name,
        projectTitle,
        dealAmount: deal.amount,
        investorName: investor.name,
      });

      await sendAgreementSigningEmail({
        recipientEmail: creator.email,
        recipientName: creator.name,
        role: "creator",
        projectTitle,
        dealAmount: deal.amount,
        escrowId: escrow[0]._id,
      });

      // 🔔 In-app notification for investor
      await createNotification({
        recipient: deal.investor,
        type: "agreement_signing_required",
        title: "Sign Your Investment Agreement",
        message: `Your payment of ${deal.amount.toLocaleString()} FCFA for ${projectTitle} is confirmed. Please sign the investment agreement to complete the deal.`,
        data: {
          escrowId: escrow[0]._id,
          dealId: deal._id,
          projectId: project._id,
        },
      });

      // 🔔 In-app notification for creator
      await createNotification({
        recipient: deal.creator,
        type: "agreement_signing_required",
        title: "Investment Payment Received — Sign Agreement",
        message: `${investor.name} has paid ${deal.amount.toLocaleString()} FCFA for ${projectTitle}. Sign the agreement to unlock the funds.`,
        data: {
          escrowId: escrow[0]._id,
          dealId: deal._id,
          projectId: project._id,
        },
      });

    } catch (notifError) {
      console.error("Notification error (non-blocking):", notifError.message);
    }

    return res.status(200).json({
      message: "Payment processed successfully",
      deal:updatedDeal,
      escrow: escrow[0],
      transactionId: paymentResult.transactionId || null,
      paymentReference: paymentResult.reference,
      clientSecret: paymentResult.clientSecret || null,
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("❌ Payment error:", error.message);

    return res.status(500).json({
      message: "Payment processing failed",
      error: error.message,
    });
  }
};


export const getInvestorDeals = async (req, res) => {
  try {
    const userId = req.user._id;

    const { status } = req.query; // optional filter

    const filter = { investor: userId };
    if (status) filter.dealStatus = status;

    const deals = await Deal.find(filter)
      .populate("project", "title coverImage valuation equityAvailable status")
      .populate("creator", "name email profileImage")
      .populate("investmentRequest", "amount equityRequested negotiationStatus")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: deals.length,
      deals,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch deals",
      error: error.message,
    });
  }
};

export const getInvestorDealById = async (req, res) => {
  try {
    const { dealId } = req.params;
    const userId = req.user._id;

    const deal = await Deal.findById(dealId)
      .populate("project", "title coverImage valuation equityAvailable status category")
      .populate("creator", "name email profileImage")
      .populate("investmentRequest", "amount equityRequested negotiationStatus currentTerms");

    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    // Only the investor can view their deal
    if (deal.investor.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // If deal has escrow, attach it
    let escrow = null;
    if (deal.escrow) {
      escrow = await Escrow.findById(deal.escrow).select(
        "status amount agreement createdAt releasedAt"
      );
    }

    return res.status(200).json({
      deal,
      escrow,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch deal",
      error: error.message,
    });
  }
};