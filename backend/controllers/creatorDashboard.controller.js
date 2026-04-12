import Project from "../models/Project.model.js";
import Deal from "../models/Deal.js";
import InvestmentRequest from "../models/investment.model.js";
import Wallet from "../models/wallet.js";

export const getCreatorDashboard = async (req, res) => {
  try {

    //////////////////////////////////////////////////////
    // GET ALL CREATOR PROJECTS (not just approved)
    //////////////////////////////////////////////////////

    const projects = await Project.find({
      creator: req.user._id,
    }).sort({ createdAt: -1 });

    const projectIds = projects.map(p => p._id);

    //////////////////////////////////////////////////////
    // DEAL METRICS
    //////////////////////////////////////////////////////

    const deals = await Deal.find({
      project: { $in: projectIds },
      paymentStatus: "paid",
    }).populate("investor", "name");

    let totalRaised = 0;
    let activeDeals = 0;

    deals.forEach(deal => {
      totalRaised += deal.amount;
      if (deal.dealStatus === "active") {
        activeDeals++;
      }
    });

    //////////////////////////////////////////////////////
    // PENDING REQUESTS (Admin approved, awaiting creator)
    //////////////////////////////////////////////////////

    const pendingRequests = await InvestmentRequest.find({
      project: { $in: projectIds },
      adminStatus: "approved",
      creatorStatus: "pending",
    }).populate("investor", "name");

    //////////////////////////////////////////////////////
    // WALLET BALANCE
    //////////////////////////////////////////////////////

    const wallet = await Wallet.findOne({ user: req.user._id });
    const walletBalance = wallet?.balance || 0;

    //////////////////////////////////////////////////////
    // RECENT PROJECTS (limit to 5)
    //////////////////////////////////////////////////////

    const recentProjects = projects.slice(0, 5).map(p => ({
      _id: p._id,
      title: p.title,
      approvalStatus: p.approvalStatus,
      totalFunded: p.totalFunded || 0,
      targetAmount: p.targetAmount || p.fundingGoal || 0,
    }));

    //////////////////////////////////////////////////////
    // RECENT REQUESTS (limit to 5)
    //////////////////////////////////////////////////////

    const recentRequests = pendingRequests.slice(0, 5).map(r => ({
      _id: r._id,
      investor: { name: r.investor?.name || "Unknown Investor" },
      amount: r.amount,
      equityRequested: r.equityRequested,
    }));

    //////////////////////////////////////////////////////
    // RESPONSE - matches frontend expectations
    //////////////////////////////////////////////////////

    res.status(200).json({
      totalFundsRaised: totalRaised,
      totalProjects: projects.length,
      activeDeals: activeDeals,
      pendingRequests: pendingRequests.length,
      walletBalance: walletBalance,
      recentProjects: recentProjects,
      recentRequests: recentRequests,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch creator dashboard",
      error: error.message,
    });
  }
};
