import mongoose from "mongoose";
import Escrow from "../models/Escrow.model.js";
import Deal from "../models/Deal.js";
import cloudinary from "../config/cloudinary.js";

////////////////////////////////////////////////////////
// INVESTOR SIGNS AGREEMENT
////////////////////////////////////////////////////////

export const investorSignAgreement = async (req, res) => {
  try {
    const { escrowId } = req.params;
    const userId = req.user._id;

    const escrow = await Escrow.findById(escrowId).populate("deal");

    if (!escrow) {
      return res.status(404).json({ message: "Escrow not found" });
    }

    // ✅ Only the investor can sign this
    if (escrow.investor.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // ✅ Escrow must still be holding
    if (escrow.status !== "holding") {
      return res.status(400).json({ message: "Escrow is not in a signable state" });
    }

    // ✅ Must not already be signed
    if (escrow.agreement.investorSigned) {
      return res.status(400).json({ message: "You already signed this agreement" });
    }

    // ✅ File must be uploaded
    const uploadedFile = req.files && req.files.length > 0 ? req.files[0] : req.file;
    if (!uploadedFile) {
      return res.status(400).json({ message: "Signed agreement document is required" });
    }
    
    console.log("📎 File received:", uploadedFile.originalname, uploadedFile.path);
    escrow.agreement.investorSignedUrl = uploadedFile.path;
    escrow.agreement.investorSigned = true;
    escrow.agreement.investorSignedAt = new Date();

    // ✅ If both parties have now signed, move to ready_for_release
    if (escrow.agreement.investorSigned && escrow.agreement.creatorSigned) {
      escrow.status = "ready_for_release";

      // Update deal status too
      await Deal.findByIdAndUpdate(escrow.deal._id, {
        dealStatus: "awaiting_signatures",
      });   
    }

    await escrow.save();

    return res.status(200).json({
      message: "Agreement signed successfully by investor",
      escrow,
    });

  } catch (error) {
    console.error("Investor sign error:", error);
    return res.status(500).json({
      message: "Failed to sign agreement",
      error: error.message,
    });
  }
};

////////////////////////////////////////////////////////
// CREATOR SIGNS AGREEMENT
////////////////////////////////////////////////////////

export const creatorSignAgreement = async (req, res) => {
  try {
    const { escrowId } = req.params;
    const userId = req.user._id;

    const escrow = await Escrow.findById(escrowId).populate("deal");

    if (!escrow) {
      return res.status(404).json({ message: "Escrow not found" });
    }

    // ✅ Only the creator can sign this
    if (escrow.creator.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // ✅ Escrow must still be holding
    if (escrow.status !== "holding") {
      return res.status(400).json({ message: "Escrow is not in a signable state" });
    }

    // ✅ Must not already be signed
    if (escrow.agreement.creatorSigned) {
      return res.status(400).json({ message: "You already signed this agreement" });
    }

    // ✅ File must be uploaded
    const uploadedFile = req.files && req.files.length > 0 ? req.files[0] : req.file;
    if (!uploadedFile) {
      return res.status(400).json({ message: "Signed agreement document is required" });
    }
    
    console.log("📎 File received:", uploadedFile.originalname, uploadedFile.path);
    escrow.agreement.creatorSignedUrl = uploadedFile.path;
    escrow.agreement.creatorSigned = true;
    escrow.agreement.creatorSignedAt = new Date();

    // ✅ If both parties have now signed, move to ready_for_release
    if (escrow.agreement.investorSigned && escrow.agreement.creatorSigned) {
      escrow.status = "ready_for_release";

      // Update deal status too
      await Deal.findByIdAndUpdate(escrow.deal._id, {
        dealStatus: "awaiting_signatures",
      });
    }

    await escrow.save();

    return res.status(200).json({
      message: "Agreement signed successfully by creator",
      escrow,
    });

  } catch (error) {
    console.error("Creator sign error:", error);
    return res.status(500).json({
      message: "Failed to sign agreement",
      error: error.message,
    });
  }
};

////////////////////////////////////////////////////////
// GET ESCROW AGREEMENT STATUS
////////////////////////////////////////////////////////

export const getAgreementStatus = async (req, res) => {
  try {
    const { escrowId } = req.params;
    const userId = req.user._id.toString();

    const escrow = await Escrow.findById(escrowId)
      .populate("deal", "dealStatus amount equity")
      .populate("investor", "name email profileImage")
      .populate("creator", "name email profileImage")
      .populate("project", "title coverImage");

    if (!escrow) {
      return res.status(404).json({ message: "Escrow not found" });
    }

    // ✅ Only investor or creator can view
    const isInvestor = escrow.investor._id.toString() === userId;
    const isCreator = escrow.creator._id.toString() === userId;
    const isAdmin = req.user.userType === "admin";

    if (!isInvestor && !isCreator && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to view this escrow" });
    }

    return res.status(200).json({
      escrowId: escrow._id,
      status: escrow.status,
      amount: escrow.amount,
      deal: escrow.deal,
      project: escrow.project,
      agreement: {
        investorSigned: escrow.agreement.investorSigned,
        investorSignedAt: escrow.agreement.investorSignedAt || null,
        investorSignedUrl: isAdmin ? escrow.agreement.investorSignedUrl : undefined,

        creatorSigned: escrow.agreement.creatorSigned,
        creatorSignedAt: escrow.agreement.creatorSignedAt || null,
        creatorSignedUrl: isAdmin ? escrow.agreement.creatorSignedUrl : undefined,

        adminValidated: escrow.agreement.adminValidated,
        bothSigned: escrow.agreement.investorSigned && escrow.agreement.creatorSigned,
      },
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch agreement status",
      error: error.message,
    });
  }
};

export const downloadAgreement = async (req, res) => {
  try {
    const { escrowId } = req.params;
    const userId = req.user._id.toString();

    const escrow = await Escrow.findById(escrowId);

    if (!escrow) {
      return res.status(404).json({ message: "Escrow not found" });
    }

    const isInvestor = escrow.investor.toString() === userId;
    const isCreator = escrow.creator.toString() === userId;

    if (!isInvestor && !isCreator) {
      return res.status(403).json({ message: "Not authorized" });
    }

    return res.status(200).json({
      message: "Agreement document ready",
      // Direct stream URL — works without Cloudinary access issues
      documentUrl: `${process.env.BASE_URL}/api/v1/agreements/${escrowId}/view-agreement`,
      cloudinaryUrl: escrow.agreement.documentUrl || null, // keep as backup
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to get agreement document",
      error: error.message,
    });
  }
};