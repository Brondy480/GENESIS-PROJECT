import Project from "../models/Project.model.js";


export const getPendingProjects = async (req, res) => {
  try {
    const projects = await Project.find({ approvalStatus: "pending" })
      .populate("creator", "name email");

    res.status(200).json({
      count: projects.length,
      projects,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch pending projects",
      error: error.message,
    });
  }
};

export const approveProject = async (req, res) => {
    try {
      const { projectId } = req.params;
      const admin = req.user;
  
      const project = await Project.findById(projectId);
  
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
  
      if (project.approvalStatus !== "pending") {
        return res.status(400).json({
          message: "Project is not pending approval",
        });
      }
  
      project.approvalStatus = "approved";
      project.status = "active";
      project.rejectionReason = undefined;
      project.approvedBy = admin._id;
      project.approvedAt = new Date();
  
      await project.save();
  
      res.status(200).json({
        message: "Project approved successfully",
        project,
      });
    } catch (error) {
      res.status(500).json({
        message: "Project approval failed",
        error: error.message,
      });
    }
  };

  
  export const rejectProject = async (req, res) => {
    try {
      const { projectId } = req.params;
      const { reason } = req.body;
  
      if (!reason) {
        return res.status(400).json({ message: "Rejection reason required" });
      }
  
      const project = await Project.findById(projectId);
  
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
  
      project.approvalStatus = "rejected";
      project.status = "inactive";
      project.rejectionReason = reason;
  
      await project.save();
  
      res.status(200).json({
        message: "Project rejected",
        reason,
        project,
      });
    } catch (error) {
      res.status(500).json({
        message: "Project rejection failed",
        error: error.message,
      });
    }
  };

  
  export const suspendProject = async (req, res) => {
    try {
      const { projectId } = req.params;
      const { reason } = req.body;
  
      const project = await Project.findById(projectId);
  
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
  
      project.status = "cancelled";
      project.rejectionReason = reason || "Suspended by admin";
  
      await project.save();
  
      res.status(200).json({
        message: "Project suspended",
        project,
      });
    } catch (error) {
      res.status(500).json({
        message: "Project suspension failed",
        error: error.message,
      });
    }
  };
  

export const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findByIdAndDelete(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete project", error: error.message });
  }
};

  //investment requests

