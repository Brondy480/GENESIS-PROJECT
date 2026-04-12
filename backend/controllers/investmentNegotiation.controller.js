import InvestmentRequest from "../models/investment.model.js";

export const sendNegotiationMessage = async (req, res) => {
    try {
      const { requestId } = req.params;
      const { message, proposedAmount, proposedEquity } = req.body;
  
      const request = await InvestmentRequest.findById(requestId)
        .populate("project");
  
      if (!request) {
        return res.status(404).json({
          message: "Investment request not found",
        });
      }
  
      //////////////////////////////////////////////////
      // SECURITY
      //////////////////////////////////////////////////

      if (request.creatorStatus !== "pending") {
        return res.status(403).json({
            message: "Not authorized",
          });
     }
  
      if (!request.project?.creator) {
        return res.status(403).json({ message: "Project creator not found" });
      }

      console.log("Creator check:", {
        projectCreator: request.project?.creator?.toString(),
        userId: req.user._id?.toString(),
        match: request.project?.creator?.toString() === req.user._id?.toString()
      });

      const isInvestor =
        request.investor.toString() === req.user._id.toString();

      const isCreator =
        request.project.creator.toString() === req.user._id.toString();

      if (!isInvestor && !isCreator) {
        return res.status(403).json({
          message: "Not authorized",
        });
      }
  
      //////////////////////////////////////////////////
      // ONLY AFTER ADMIN APPROVAL
      //////////////////////////////////////////////////
  
      if (request.adminStatus !== "approved") {
        return res.status(400).json({
          message: "Negotiation not allowed yet",
        });
      }
  
      //////////////////////////////////////////////////
      // ADD NEGOTIATION ENTRY
      //////////////////////////////////////////////////
  
      request.negotiationHistory.push({
        proposedBy: req.user._id,
        role: isInvestor ? "investor" : "creator",
        amount: proposedAmount,
        equity: proposedEquity,
        message,
      });
  
      await request.save();
  
      res.status(200).json({
        message: "Negotiation update sent",
        negotiationHistory: request.negotiationHistory,
      });
  
    } catch (error) {
      res.status(500).json({
        message: "Failed to send negotiation message",
        error: error.message,
      });
    }
  };
  

  export const getNegotiationMessages = async (req, res) => {
    try {
      let { requestId } = req.params;
      requestId = requestId.trim();
  
      const request = await InvestmentRequest.findById(requestId)
        .populate({
          path: "negotiationHistory.proposedBy",
          select: "name profileImage",
        })
        .populate("project", "creator title");
  
      if (!request) {
        return res.status(404).json({
          message: "Investment request not found",
        });
      }
  
      //////////////////////////////////////////////////
      // 🔒 SECURITY CHECK
      //////////////////////////////////////////////////
  
      const isInvestor =
        request.investor.toString() === req.user._id.toString();
  
      const isCreator =
        request.project.creator.toString() === req.user._id.toString();
  
      if (!isInvestor && !isCreator) {
        return res.status(403).json({
          message: "Not authorized to view this negotiation",
        });
      }
  
      //////////////////////////////////////////////////
      // 🚫 Only visible if admin approved
      //////////////////////////////////////////////////
  
      if (request.adminStatus !== "approved") {
        return res.status(400).json({
          message: "Negotiation not available yet",
        });
      }
  
      //////////////////////////////////////////////////
      // 🚫 Lock negotiation if creator already accepted/rejected
      //////////////////////////////////////////////////
  
      if (request.creatorStatus !== "pending") {
        return res.status(400).json({
          message: "Negotiation already closed",
        });
      }
  
      //////////////////////////////////////////////////
      // 📤 Return structured response
      //////////////////////////////////////////////////
  
      const history = request.negotiationHistory.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
  
      res.status(200).json({
        requestId: request._id,
        project: {
          id: request.project._id,
          title: request.project.title,
        },
        currentTerms: request.currentTerms,
        negotiationOpen: true,
        totalRounds: history.length,
        negotiationHistory: history,
      });
  
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch negotiation messages",
        error: error.message,
      });
    }
  };
  