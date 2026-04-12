import Transaction from "../models/Transactions.model.js";
import Project from "../models/Project.model.js";
import crypto from "crypto";

export const simulatePayment = async (req, res) => {
  try {
const { projectId } = req.params;
const { amount } = req.body;
    const investorId = req.user.id; // from auth middleware

    // 1️⃣ Check project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    await Project.save({ validateBeforeSave: false })

    // 2️⃣ Generate fake transaction reference
    const reference = "MVP-" + crypto.randomBytes(6).toString("hex");

    // 3️⃣ Create pending transaction
    const transaction = await Transaction.create({
      investor: investorId,
      project: projectId,
      amount,
      transactionReference: reference,
    });

    // 4️⃣ Simulate delay (2 seconds)
    setTimeout(async () => {
      transaction.status = "success";
      await transaction.save();

      // 5️⃣ Update project funding
      project.currentAmount += amount;
      await project.save();
    }, 2000);

    res.status(200).json({
      message: "Payment processing...",
      transactionReference: reference,
    });
  } catch (error) {
    res.status(500).json({
      message: "Payment simulation failed",
      error: error.message,
    });
  }
};