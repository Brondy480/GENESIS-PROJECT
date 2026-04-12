
import Users from "../models/Users.model.js";
import Creator from "../models/ProjectCreator.model.js";
import Investor from "../models/Investor.model.js";
import Backer from "../models/Backer.model.js";

export const getPendingVerifications = async (req, res) => {
  const users = await Users.find({ verificationStatus: "pending" })
    .select("-passwordHash");

  res.status(200).json(users);
};



export const getUserForVerification = async (req, res) => {
    const { userId } = req.params;

    const user =
      (await Creator.findById(userId).select("-passwordHash")) ||
      (await Investor.findById(userId).select("-passwordHash")) ||
      (await Backer.findById(userId).select("-passwordHash"));

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      ...user.toObject(),
      idCard: user.idCardUrl || null,
      proofOfAddress: user.proofOfAddressUrl || null,
    });
  };


  export const approveUser = async (req, res) => {
    const { userId } = req.params;
  
    const user = await Users.findByIdAndUpdate(
      userId,
      { verificationStatus: "verified" },
      { new: true }
    );
  
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
  
    res.status(200).json({
      message: "User verified successfully",
      user,
    });
  };
  

 

export const rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    // 1️⃣ Validate input
    if (!reason || reason.trim() === "") {
      return res.status(400).json({
        message: "Rejection reason is required",
      });
    }

    // 2️⃣ Find user first
    const user = await Users.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3️⃣ Prevent rejecting admins
    if (user.userType === "admin") {
      return res.status(403).json({
        message: "Admin accounts cannot be rejected",
      });
    }

    // 4️⃣ Update verification status
    user.verificationStatus = "rejected";
    user.verificationReason = reason;

    await user.save();

    // 5️⃣ Respond
    return res.status(200).json({
      message: "User rejected successfully",
      userId: user._id,
      verificationStatus: user.verificationStatus,
      verificationReason: user.verificationReason,
    });

  } catch (error) {
    console.error("Reject user error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


export const suspendUser = async (req, res) => {
  const { userId } = req.params;
  const { reason } = req.body;

  if (!reason) {
    return res.status(400).json({ message: "Suspension reason is required" });
  }

  const user = await Users.findByIdAndUpdate(
    userId,
    {
      verificationStatus: "suspended",
      suspensionReason: reason,
      suspendedAt: new Date(),
    },
    { new: true }
  );

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({
    message: "User suspended successfully",
    userId: user._id,
    status: user.verificationStatus,
    reason: user.suspensionReason,
  });
};


export const unsuspendUser = async (req, res) => {
  const { userId } = req.params;

  const user = await Users.findByIdAndUpdate(
    userId,
    {
      verificationStatus: "verified",
      suspensionReason: null,
      suspendedAt: null,
    },
    { new: true }
  );

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({
    message: "User unsuspended successfully",
    userId: user._id,
    status: user.verificationStatus,
  });
};


  
  