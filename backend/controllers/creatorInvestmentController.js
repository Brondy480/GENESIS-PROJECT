
import Deal from "../models/Deal.js";

import Project from "../models/Project.model.js";

import InvestmentRequest from "../models/investment.model.js";

import mongoose from "mongoose";

//////////////////////////////////////////////////////
// GET CREATOR REQUESTS
//////////////////////////////////////////////////////

export const getCreatorInvestmentRequests = async (req, res) => {
  try {

    const projects = await Project.find({
      creator: req.user._id,
    });

    const projectIds = projects.map(p => p._id);

    const requests = await InvestmentRequest.find({
      project: { $in: projectIds },
      adminStatus: "approved",
      creatorStatus: "pending",
    })
      .populate("investor", "name email profileImage")
      .populate("project", "title coverImage");

    res.status(200).json({
      count: requests.length,
      requests,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch investment requests",
      error: error.message,
    });
  }
};

//////////////////////////////////////////////////////
// ACCEPT INVESTMENT
//////////////////////////////////////////////////////



export const creatorAcceptInvestment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { requestId } = req.params;

    const request = await InvestmentRequest
      .findById(requestId)
      .session(session);

    if (!request) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Investment request not found" });
    }

    if (request.creatorStatus !== "pending") {
      await session.abortTransaction();
      return res.status(400).json({ message: "Request already processed" });
    }

    const project = await Project
      .findById(request.project)
      .session(session);

    if (!project) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Project not found" });
    }

    // ✅ Ownership check
    if (project.creator.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      return res.status(403).json({ message: "Not authorized" });
    }

    const equityRequested = Number(request.currentTerms?.equity || request.equityRequested);

    if (isNaN(equityRequested) || equityRequested <= 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Invalid equity value" });
    }

    const realAvailable = project.equityAvailable - project.equityLocked;

    if (equityRequested > realAvailable) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Not enough equity available" });
    }

    ///////////////////////////////////////////////////////
    // 🔒 LOCK EQUITY (DO NOT DEDUCT)
    ///////////////////////////////////////////////////////

    project.equityLocked += equityRequested;

    if ((project.equityAvailable - project.equityLocked) === 0) {
      project.status = "fully_allocated";
    }

    await project.save({ session });

    ///////////////////////////////////////////////////////
    // 🔐 CLOSE NEGOTIATION
    ///////////////////////////////////////////////////////

    request.creatorStatus = "accepted";
    request.negotiationStatus = "closed";
    request.creatorRespondedAt = new Date();
    request.closedAt = new Date();

    await request.save({ session });

    ///////////////////////////////////////////////////////
    // 📜 CREATE DEAL
    ///////////////////////////////////////////////////////

    const deal = await Deal.create([{
      project: project._id,
      creator: project.creator,
      investor: request.investor,
      investmentRequest: request._id,
      amount: request.currentTerms?.amount || request.amount,
      equity: equityRequested,
      valuationAtInvestment: request.currentTerms?.valuation || null,
      dealStatus: "awaiting_payment",
      paymentStatus: "pending",
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Investment accepted. Awaiting payment.",
      deal: deal[0],
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({
      message: "Failed to accept investment",
      error: error.message,
    });
  }
};

//////////////////////////////////////////////////////
// REJECT INVESTMENT
//////////////////////////////////////////////////////

export const creatorRejectInvestment = async (req, res) => {
  try {

    const { requestId } = req.params;
    const { reason } = req.body;

    const request = await InvestmentRequest.findById(requestId)
      .populate("project");

    if (!request) {
      return res.status(404).json({
        message: "Investment request not found",
      });
    }

    // verify ownership
    if (request.project.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized for this project",
      });
    }

    request.creatorStatus = "rejected";
    request.rejectionReason = reason;

    await request.save();

    res.status(200).json({
      message: "Investment rejected",
      request,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to reject investment",
      error: error.message,
    });
  }
};