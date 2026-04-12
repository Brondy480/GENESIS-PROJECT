import InvestmentRequest from "../models/investment.model.js";


export const sendCounterOffer = async (req, res) => {
    try {
      const { requestId } = req.params;
      const { amount, equity, message } = req.body;
     

     
  
      const request = await InvestmentRequest.findById(requestId)
        .populate("project");

       
  
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }
  
      const isInvestor =
        request.investor.toString() === req.user._id.toString();
  
      const isCreator =
        request.project.creator.toString() === req.user._id.toString();
  
      if (!isInvestor && !isCreator) {
        return res.status(403).json({ message: "Not authorized" });
      }
  
      if (request.adminStatus !== "approved") {
        return res.status(400).json({ message: "Negotiation not allowed yet" });
      }
  
      // update current terms
      request.currentTerms = {
        amount,
        equity,
      };
  
      // push history
      request.negotiationHistory.push({
        proposedBy: req.user._id,
        role: isInvestor ? "investor" : "creator",
        amount,
        equity,
        message,
      });
  
      await request.save();
  
      res.status(200).json({
        message: "Counter offer sent",
        currentTerms: request.currentTerms,
      });
  
    } catch (error) {
      res.status(500).json({
        message: "Failed to send counter offer",
        error: error.message,
      });
    }
  };
  