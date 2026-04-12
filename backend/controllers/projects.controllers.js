import Project from "../models/Project.model.js";

//controller for user

export const createProject = async (req, res) => {
  try {
    const user = req.user;

    // 🔒 Permission checks
    if (user.userType !== "creator") {
      return res.status(403).json({ message: "Only creators can create projects" });
    }

    if (user.verificationStatus !== "verified") {
      return res.status(403).json({ message: "Account not verified" });
    }

    const {
      title,
      description,
      category,
      fundingGoal,
      valuation,
      equityAvailable,
      allowFunding,
      allowInvestment,
      tags,
      targetAmount,
      deadline,
      demoVideoUrl,
    } = req.body;

    // Validate required fields
    if (!targetAmount) {
      return res.status(400).json({ message: "targetAmount is required" });
    }

    if (!deadline) {
      return res.status(400).json({ message: "deadline is required" });
    }

    if (!req.files?.coverImage) {
      return res.status(400).json({ message: "Cover image is required" });
    }

    const project = await Project.create({
      title,
      description,
      category,
      tags,
      creator: user._id,
      coverImage: req.files.coverImage[0].path,
      fundingGoal,
      valuation,
      equityAvailable,
      allowFunding,
      allowInvestment,
      targetAmount,
      deadline,
      demoVideoUrl: demoVideoUrl || null,
      businessPlan: req.files?.businessPlan?.[0]?.path || null,
      status: "draft",
      approvalStatus: "pending",
    });
   
    res.status(201).json({
      message: "Project submitted for approval",
      project,
    });

  } catch (error) {
    res.status(500).json({
      message: "Project creation failed",
      error: error.message,
    });
  }
};


export const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
   
    // Only the creator can update
    if (project.creator.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized to update this project" });
    }

    // Cannot update if project is funded, sold or cancelled
    if (["funded", "sold", "cancelled"].includes(project.status)) {
      return res.status(400).json({
        message: `Cannot update a project with status: ${project.status}`,
      });
    }

    const allowedFields = [
      "title",
      "description",
      "category",
      "tags",
      "fundingGoal",
      "targetAmount",
      "deadline",
      "allowFunding",
      "allowInvestment",
      "valuation",
      "equityAvailable",
    ];

    // Only update fields that were actually sent
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      message: "Project updated successfully",
      project: updatedProject,
    });

  } catch (error) {
    console.error("Update project error:", error.message);
    return res.status(500).json({
      message: "Failed to update project",
      error: error.message,
    });
  }
};

export const resubmitProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.creator.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (project.approvalStatus !== "rejected") {
      return res.status(400).json({ message: "Only rejected projects can be resubmitted" });
    }

    project.approvalStatus = "pending";
    project.status = "draft";
    await project.save();

    return res.status(200).json({
      message: "Project resubmitted for approval",
      project,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Resubmission failed",
      error: error.message,
    });
  }
};

export const getAllProjects = async()=>{

}

export const getAProject = async()=>{

}


