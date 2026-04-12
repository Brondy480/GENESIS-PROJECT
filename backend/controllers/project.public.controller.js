import Project from "../models/Project.model.js";
import Users from "../models/Users.model.js";

export const getPublicProjects = async (req, res) => {
  try {
    const {
      category,
      allowFunding,
      allowInvestment,
      minGoal,
      maxGoal,
      search,
    } = req.query;

    const query = {
      approvalStatus: "approved",
      status: "active",
    };

    if (category) query.category = category;
    if (allowFunding !== undefined) query.allowFunding = allowFunding === "true";
    if (allowInvestment !== undefined)
      query.allowInvestment = allowInvestment === "true";

    if (minGoal || maxGoal) {
      query.fundingGoal = {};
      if (minGoal) query.fundingGoal.$gte = Number(minGoal);
      if (maxGoal) query.fundingGoal.$lte = Number(maxGoal);
    }

    if (search) {
      query.$text = { $search: search };
    }

    const rawProjects = await Project.find(query)
      .select(
        "title description category coverImage targetAmount currentAmount funders deadline valuation equityAvailable allowFunding allowInvestment creator createdAt likes likesCount demoVideoUrl businessPlan comments"
      )
      .populate("creator", "name profileImage")
      .lean();

    const projects = rawProjects.map(p => ({
      ...p,
      commentsCount: p.comments?.length || 0,
      comments: undefined,
    }));

    res.status(200).json({
      count: projects.length,
      projects,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch projects",
      error: error.message,
    });
  }
};



export const getPublicProjectById = async (req, res) => {
    try {
      const { projectId } = req.params;
  
      const project = await Project.findOne({
        _id: projectId,
        approvalStatus: "approved",
        status: "active",
      })
        .populate("creator", "name profileImage")
        .populate("comments.user", "name profileImage");
  
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
  
      res.status(200).json({ project });
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch project",
        error: error.message,
      });
    }
  };




export const PostPublicProjectComments = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { content } = req.body;
    const user = req.user;

    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Comment content is required" });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // 🔒 Only approved projects
    if (project.approvalStatus !== "approved") {
      return res.status(403).json({ message: "Project not approved yet" });
    }

    // 🔒 Prevent admin comments (optional)
    if (user.userType === "admin") {
      return res.status(403).json({ message: "Admins cannot comment" });
    }

    const comment = {
      user: user._id,
      userType: user.userType,
      content,
    };

    project.comments.push(comment);
    await project.save();

    res.status(201).json({
      message: "Comment added successfully",
      comment,
    });

  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


export const getPublicProjectComments = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId)
      .select("comments")
      .populate("comments.user", "name userType profileImage")
      .populate("comments.replies.user", "name userType profileImage");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({
      comments: project.comments,
    });

  } catch (error) {
    console.error("Fetch comments error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


export const toggleLikeProject = async (req, res) => {
  try {
    const userId = req.user._id;
    const userType = req.user.userType;
    const { projectId } = req.params;

    if (userType === "admin") {
      return res.status(403).json({ message: "Admins cannot like projects" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const alreadyLiked = project.likes.find(
      (like) => like.user.toString() === userId.toString()
    );

    if (alreadyLiked) {
      // 🔴 Unlike
      project.likes = project.likes.filter(
        (like) => like.user.toString() !== userId.toString()
      );
      project.likesCount -= 1;
    } else {
      // ❤️ Like
      project.likes.push({ user: userId, userType });
      project.likesCount += 1;
    }

    await project.save();

    res.status(200).json({
      message: alreadyLiked ? "Project unliked" : "Project liked",
      likesCount: project.likesCount,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to toggle like",
      error: error.message,
    });
  }
};

export const toggleSaveProject = async (req, res) => {
  try {
    const userId = req.user._id;
    const userType = req.user.userType;
    const { projectId } = req.params;

    if (userType === "admin") {
      return res.status(403).json({ message: "Admins cannot save projects" });
    }

    const projectExists = await Project.exists({ _id: projectId });
    if (!projectExists) {
      return res.status(404).json({ message: "Project not found" });
    }

    const user = await Users.findById(userId);

    const alreadySaved = user.savedProjects.includes(projectId);

    if (alreadySaved) {
      user.savedProjects = user.savedProjects.filter(
        (id) => id.toString() !== projectId
      );
    } else {
      user.savedProjects.push(projectId);
    }

    await user.save();

    res.status(200).json({
      message: alreadySaved ? "Project removed from saved" : "Project saved",
      savedProjects: user.savedProjects,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to toggle save",
      error: error.message,
    });
  }
};

export const editComment = async (req, res) => {
  try {
    const { projectId, commentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const comment = project.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only edit your comment" });
    }

    comment.content = content;
    await project.save();

    res.status(200).json({
      message: "Comment updated",
      comment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update comment",
      error: error.message,
    });
  }
};


export const deleteComment = async (req, res) => {
  try {
    const { projectId, commentId } = req.params;
    const user = req.user;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const comment = project.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (
      comment.user.toString() !== user._id.toString() &&
      user.userType !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this comment" });
    }

    comment.deleteOne();
    await project.save();

    res.status(200).json({
      message: "Comment deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete comment",
      error: error.message,
    });
  }
};


//reply to comment

export const addReply = async (req, res) => {
  try {
    const { projectId, commentId } = req.params;
    const { content } = req.body;
    const user = req.user;

    if (user.userType === "admin") {
      return res.status(403).json({ message: "Admins cannot reply" });
    }

    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Reply content is required" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const comment = project.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    comment.replies.push({
      user: user._id,
      userType: user.userType,
      content,
    });

    await project.save();

    res.status(201).json({
      message: "Reply added successfully",
      replies: comment.replies,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add reply",
      error: error.message,
    });
  }
};


export const editReply = async (req, res) => {
  try {
    const { projectId, commentId, replyId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const comment = project.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found" });

    if (reply.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only edit your reply" });
    }

    reply.content = content;
    await project.save();

    res.status(200).json({
      message: "Reply updated",
      reply,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update reply",
      error: error.message,
    });
  }
};


export const deleteReply = async (req, res) => {
  try {
    const { projectId, commentId, replyId } = req.params;
    const user = req.user;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const comment = project.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found" });

    if (
      reply.user.toString() !== user._id.toString() &&
      user.userType !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    reply.deleteOne();
    await project.save();

    res.status(200).json({ message: "Reply deleted" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete reply",
      error: error.message,
    });
  }
};




  