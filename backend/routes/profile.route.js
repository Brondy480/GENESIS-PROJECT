import express from "express";
import upload from "../middlewares/uploads.js";
import { createOrUpdateProfile } from "../controllers/profile.controller.js";
import { authMiddleware } from "../middlewares/Auth.middlewares.js";
import { resubmitProfile } from "../controllers/resubmit.controller.js";
import Creator from "../models/ProjectCreator.model.js";
import Backer from "../models/Backer.model.js";
import Investor from "../models/Investor.model.js";

const Profilerouter = express.Router();

// Get current user profile
Profilerouter.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    let profile;

    switch (user.userType) {
      case "creator":
        profile = await Creator.findById(user._id).select("-passwordHash");
        break;
      case "backer":
        profile = await Backer.findById(user._id).select("-passwordHash");
        break;
      case "investor":
        profile = await Investor.findById(user._id).select("-passwordHash");
        break;
      case "admin":
        profile = { name: user.name, email: user.email, userType: user.userType };
        break;
      default:
        return res.status(400).json({ message: "Invalid user type" });
    }

    res.status(200).json({ profile });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile", error: error.message });
  }
});

Profilerouter.put(
  "/Createprofile",
  authMiddleware,
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "idCard", maxCount: 1 },
    { name: "proofOfAddress", maxCount: 1 },
    { name: "proofOfFunds", maxCount: 1 }, // <-- m issing field
  ])
  ,
  createOrUpdateProfile
);

Profilerouter.put(
  "/resubmit",
  authMiddleware,
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "idCard", maxCount: 1 },
    { name: "proofOfAddress", maxCount: 1 },
    { name: "proofOfFunds", maxCount: 1 }, // only for investors
  ]),
  resubmitProfile
);

export default Profilerouter;
