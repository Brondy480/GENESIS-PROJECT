import Creator from "../models/ProjectCreator.model.js";
import Backer from "../models/Backer.model.js";
import Investor from "../models/Investor.model.js";
import Users from "../models/Users.model.js";

export const resubmitProfile = async (req, res) => {
  try {
    const user = req.user; // from auth middleware

    if (user.verificationStatus !== "rejected") {
      return res.status(400).json({
        message: "Only rejected users can resubmit their profile",
      });
    }

    let Model;
    switch (user.userType) {
      case "creator":
        Model = Creator;
        break;
      case "backer":
        Model = Backer;
        break;
      case "investor":
        Model = Investor;
        break;
      default:
        return res.status(400).json({ message: "Invalid user type" });
    }

    const updateData = { ...req.body };

    // 🔹 Handle files
    if (req.files?.profileImage) updateData.profileImage = req.files.profileImage[0].path;
    if (req.files?.idCard) updateData.idCardUrl = req.files.idCard[0].path;
    if (req.files?.proofOfAddress) updateData.proofOfAddressUrl = req.files.proofOfAddress[0].path;
    if (req.files?.proofOfFunds) updateData.proofOfFundsUrl = req.files.proofOfFunds[0].path;

    // Reset status to pending for re-review
    updateData.verificationStatus = "pending";
    updateData.verificationReason = null;
    updateData.profileCompleted = true;

    const updatedProfile = await Model.findByIdAndUpdate(user._id, updateData, { new: true });

    res.status(200).json({
      message: "Profile resubmitted successfully",
      profile: updatedProfile,
    });

  } catch (error) {
    console.error("Resubmission error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
