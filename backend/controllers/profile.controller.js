import Creator from "../models/ProjectCreator.model.js";
import Backer from "../models/Backer.model.js";
import Investor from "../models/Investor.model.js";
import cloudinary from "../config/cloudinary.js";

/**
 * 🔹 Extract Cloudinary public_id from a full URL
 * Cloudinary deletes files using public_id, not the URL
 */
const extractPublicId = (url) => {
  if (!url) return null;

  const parts = url.split("/");
  const fileName = parts.pop().split(".")[0];
  const folderPath = parts.slice(parts.indexOf("upload") + 1).join("/");

  return `${folderPath}/${fileName}`;
};

export const createOrUpdateProfile = async (req, res) => {
  try {
    const user = req.user; // injected by auth middleware
    const userType = user.userType;

    // 🔹 Select correct discriminator model
    let Model;
    switch (userType) {
      case "creator":
        Model = Creator;
        break;
      case "backer":
        Model = Backer;
        break;
      case "investor":
        Model = Investor;
        break;
        case 'admin': 
        res.status(403).json({message: "Admin profiles cannot be updated"});
        break;
      default:
        return res.status(400).json({ message: "Invalid user type." });
    }

    // 🔹 Fetch existing profile (needed to delete old Cloudinary files)
    const existingProfile = await Model.findById(user._id);

    if (!existingProfile) {
      return res.status(404).json({ message: "User profile not found." });
    }

    const updateData = { ...req.body };

    /* ======================================================
       🔹 PROFILE IMAGE (ALL USERS)
    ====================================================== */
    if (req.files?.profileImage) {
      if (existingProfile.profileImage) {
        const publicId = extractPublicId(existingProfile.profileImage);
        await cloudinary.uploader.destroy(publicId);
      }
      updateData.profileImage = req.files.profileImage[0].path;
    }

    /* ======================================================
       🔹 ID CARD (CREATOR, BACKER, INVESTOR)
    ====================================================== */
    if (req.files?.idCard) {
      if (existingProfile.idCardUrl) {
        const publicId = extractPublicId(existingProfile.idCardUrl);
        await cloudinary.uploader.destroy(publicId);
      }
      updateData.idCardUrl = req.files.idCard[0].path;
    }

    /* ======================================================
       🔹 PROOF OF ADDRESS (CREATOR, INVESTOR)
    ====================================================== */
    if (req.files?.proofOfAddress) {
      if (existingProfile.proofOfAddressUrl) {
        const publicId = extractPublicId(existingProfile.proofOfAddressUrl);
        await cloudinary.uploader.destroy(publicId);
      }
      updateData.proofOfAddressUrl = req.files.proofOfAddress[0].path;
    }

    /* ======================================================
       🔹 PROOF OF FUNDS (INVESTOR ONLY)
    ====================================================== */
    if (userType === "investor" && req.files?.proofOfFunds) {
      if (existingProfile.proofOfFundsUrl) {
        const publicId = extractPublicId(existingProfile.proofOfFundsUrl);
        await cloudinary.uploader.destroy(publicId);
      }
      updateData.proofOfFundsUrl = req.files.proofOfFunds[0].path;
    }

    // 🔹 Mark profile as completed
    updateData.profileCompleted = true;

    // 🔹 Update document securely
    const updatedProfile = await Model
      .findByIdAndUpdate(user._id, updateData, {
        new: true,
        runValidators: true, // enforce schema validation
      })
      .select("-passwordHash"); // never expose password

    return res.status(200).json({
      message: "Profile updated successfully",
      profile: updatedProfile,
    });

  } catch (error) {
    console.error("Profile update error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
