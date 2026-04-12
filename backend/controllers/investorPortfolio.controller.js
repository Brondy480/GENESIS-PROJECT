import Deal from "../models/Deal.js";

export const getInvestorPortfolio = async (req, res) => {
  try {

    //////////////////////////////////////////////////
    // GET ALL DEALS FOR INVESTOR
    //////////////////////////////////////////////////

    const deals = await Deal.find({
      investor: req.user._id,
      paymentStatus: "paid", // ONLY real investments
    }).populate("project", "title coverImage valuation");

    //////////////////////////////////////////////////
    // CALCULATIONS
    //////////////////////////////////////////////////

    let totalInvested = 0;
    let totalEquity = 0;
    let activeInvestments = 0;

    deals.forEach(deal => {
      totalInvested += deal.amount;
      totalEquity += deal.equity;

      if (deal.dealStatus === "active") {
        activeInvestments++;
      }
    });

    //////////////////////////////////////////////////
    // FORMAT RESPONSE
    //////////////////////////////////////////////////

    res.status(200).json({

      summary: {
        totalInvested,
        totalEquityOwned: totalEquity,
        activeInvestments,
        totalProjects: deals.length,
      },

      investments: deals.map(deal => ({
        projectId: deal.project._id,
        title: deal.project.title,
        coverImage: deal.project.coverImage,
        amountInvested: deal.amount,
        equityOwned: deal.equity,
        dealStatus: deal.dealStatus,
      })),
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch portfolio",
      error: error.message,
    });
  }
};
