import Project from "../models/Project.model.js";
import Funding from "../models/Funding.model.js";
import Backer from "../models/Backer.model.js";

export const fundProject = async (req, res) => {
  try {
    const user = req.user;
    const { projectId } = req.params;
    const { amount, paymentMethod } = req.body;

    // 🔐 Only backers
    if (user.userType !== "backer") {
      return res.status(403).json({ message: "Only backers can fund projects" });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!project.allowFunding) {
      return res.status(403).json({ message: "Funding is disabled for this project" });
    }

    if (project.status !== "active") {
      return res.status(400).json({ message: "Project is not active" });
    }

    // 🧾 Create funding record
    const funding = await Funding.create({
      project: project._id,
      backer: user._id,
      amount,
      paymentMethod,
      status: "completed",
    });

    // 📊 Update project totals
    project.totalFunded += amount;
    project.funders.push({
      backer: user._id,
      amount,
    });

    // 🎯 Only set funded if:
    // - fundingGoal is set (> 0)
    // - goal is reached
    // - project does NOT allow investment (pure crowdfunding)
    if (
      project.fundingGoal > 0 &&
      project.totalFunded >= project.fundingGoal &&
      !project.allowInvestment
    ) {
      project.status = "funded";
    }

    // For hybrid projects (allowFunding + allowInvestment) — always stay active
    // status only changes through admin or when deal is completed

    await project.save();

    // 📦 Update backer profile
    await Backer.findByIdAndUpdate(user._id, {
      $inc: {
        totalContributed: amount,
        backedProjectsCount: 1,
      },
      $push: {
        backedProjects: {
          projectId: project._id,
          amountContributed: amount,
        },
      },
    });

    res.status(201).json({
      message: "Project funded successfully",
      funding,
      totalFunded: project.totalFunded,
    });

  } catch (error) {
    res.status(500).json({
      message: "Funding failed",
      error: error.message,
    });
  }
};