import Project from "../models/Project.model.js";
import InvestmentRequest from "../models/investment.model.js";
import crypto from "crypto"

export const sendInvestmentRequest = async (req, res) => {
  try {
    const user = req.user;
    const { projectId } = req.params;
    const { amount, equityRequested, message } = req.body;

    if (user.userType !== "investor") {
      return res.status(403).json({ message: "Only investors can invest" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!project.allowInvestment) {
      return res.status(403).json({ message: "Investment not allowed for this project" });
    }

    if (project.approvalStatus !== "approved") {
      return res.status(400).json({ message: "Project not approved" });
    }

    const existingRequest = await InvestmentRequest.findOne({
        investor: user._id,
        project: projectId,
        adminStatus: "pending",
      });
  
      if (existingRequest) {
        return res.status(400).json({
          message: "You already have a pending request for this project",
        });
      }

      const requestId = crypto.randomBytes(6).toString("hex");
  

      const request = await InvestmentRequest.create({
        requestId,
        investor: user._id,
        project: project._id,
        amount,
        equityRequested,
        message,
        currentTerms: {
          amount,
          equity: equityRequested,
        },
        negotiationHistory: [
          {
            proposedBy: user._id,
            role: "investor",
            amount,
            equity: equityRequested,
            message,
          },
        ],
      });
      

    
       

    res.status(201).json({
      message: "Investment request sent",
      request,
    });

  } catch (error) {
    console.error("Investment error:", error.message, error.stack);
    res.status(500).json({
      message: "Failed to send investment request",
      error: error.message,
    });
  }
};
