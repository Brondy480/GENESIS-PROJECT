import Router from "express";
import { getPublicProjects, getPublicProjectById, getPublicProjectComments, PostPublicProjectComments, toggleSaveProject, toggleLikeProject } from "../controllers/project.public.controller.js";
import { authMiddleware } from "../middlewares/Auth.middlewares.js";
import { editComment, deleteComment, addReply, editReply, deleteReply } from "../controllers/project.public.controller.js";
import Users from "../models/Users.model.js";






const PublicProjectRouter = Router()

// Get user's saved projects
PublicProjectRouter.get('/saved', authMiddleware, async (req, res) => {
    try {
        const user = await Users.findById(req.user._id).populate({
            path: "savedProjects",
            match: { approvalStatus: "approved" },
            select: "title description category coverImage fundingGoal totalFunded valuation",
        });
        res.status(200).json({ saved: user.savedProjects.filter(p => p !== null) });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch saved projects", error: error.message });
    }
});

PublicProjectRouter.get('/', getPublicProjects)

PublicProjectRouter.get('/:projectId', getPublicProjectById)

PublicProjectRouter.post('/:projectId/comments', authMiddleware, PostPublicProjectComments)

PublicProjectRouter.get('/:projectId/comments', getPublicProjectComments)


PublicProjectRouter.post('/:projectId/like', authMiddleware, toggleLikeProject)

PublicProjectRouter.post('/:projectId/save', authMiddleware, toggleSaveProject)

PublicProjectRouter.post('/:projectId/comments/:commentId', authMiddleware, editComment)

PublicProjectRouter.delete('/:projectId/comments/:commentId', authMiddleware, deleteComment)

PublicProjectRouter.post('/:projectId/comments/:commentId/replies', authMiddleware, addReply)

PublicProjectRouter.put('/:projectId/comments/:commentId/replies/:replyId', authMiddleware, editReply)

PublicProjectRouter.delete('/:projectId/comments/:commentId/replies/:replyId', authMiddleware, deleteReply)









export default PublicProjectRouter;