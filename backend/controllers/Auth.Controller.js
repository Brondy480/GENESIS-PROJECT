import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Users from "../models/Users.model.js";
import Creator from "../models/ProjectCreator.model.js";
import Backer from "../models/Backer.model.js";
import Investor from "../models/Investor.model.js";
import Admin from "../models/Admin.model.js";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";
import Wallet from "../models/wallet.js";

export const registration = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, email, password, userType } = req.body;

    if (!name || !email || !password || !userType) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    const existingUser = await Users.findOne({
      $or: [{ email }, { name }],
    }).session(session);

    if (existingUser) {
      return res.status(400).json({
        message: "Registration failed. Email or username already in use.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    let Model;
    switch (userType) {
      case "backer":
        Model = Backer;
        break;
      case "investor":
        Model = Investor;
        break;
      case "creator":
        Model = Creator;
        break;
      case "admin":
        Model = Admin;
        break;
      default:
        return res.status(400).json({ message: "User type invalid" });
    }

    const newUser = new Model({ name, email, passwordHash });
    await newUser.save({ session });

    // ✅ Create wallet INSIDE transaction
    await Wallet.create(
      [{ user: newUser._id, balance: 0, escrowBalance: 0, transactions: [] }],
      { session }
    );

    // ✅ Commit AFTER wallet is created
    await session.commitTransaction();
    session.endSession();

    const token = jwt.sign(
      { id: newUser._id, role: newUser.userType },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        userType: newUser.userType,
        verificationStatus: newUser.verificationStatus,
      },
      token,
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};





export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existingUser = await Users.findOne({ email });

    if (!existingUser)
      return res.status(400).json({ message: "Email or password incorrect" });

    const passwordValid = await bcrypt.compare(password, existingUser.passwordHash);
    if (!passwordValid)
      return res.status(400).json({ message: "Email or password incorrect" });

    // Allow rejected users to login
    const canLogin =
      existingUser.verificationStatus !== "suspended" ||
      existingUser.verificationStatus === "rejected";

    if (!canLogin)
      return res.status(403).json({
        message: "You are suspended and cannot access the platform",
      });

    const token = jwt.sign(
      { id: existingUser._id, role: existingUser.userType },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        userType: existingUser.userType,
        verificationStatus: existingUser.verificationStatus,
        verificationReason: existingUser.verificationReason || null,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};


export const logout = (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: "Logged out successfully" 
  });
};

