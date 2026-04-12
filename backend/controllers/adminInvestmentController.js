import InvestmentRequest from "../models/investment.model.js";


export const getPendingInvestmentRequests = async (req, res) => {
    try {
  
      const requests = await InvestmentRequest.find({
        adminStatus: "pending",
      })
        .populate("investor", "name email profileImage")
        .populate("project", "title coverImage creator")
        .sort({ createdAt: -1 });
  
      res.status(200).json({
        count: requests.length,
        requests,
      });
  
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch pending investment requests",
        error: error.message,
      });
    }
  };



export const adminApproveInvestment = async (req, res) => {
    const { requestId } = req.params;
  
    const request = await InvestmentRequest.findByIdAndUpdate(
      requestId,
      { adminStatus: "approved" },
      { new: true }
    );
  
    res.status(200).json({
      message: "Investment request approved and sent to creator",
      request,
    });
  };



  export const adminRejectInvestment = async (req, res) => {
    const { requestId } = req.params;
    const { reason } = req.body;
  
    const request = await InvestmentRequest.findByIdAndUpdate(
      requestId,
      {
        adminStatus: "rejected",
        rejectionReason: reason,
      },
      { new: true }
    );
  
    res.status(200).json({
      message: "Investment request rejected",
      request,
    });
  };
  
  