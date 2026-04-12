import { Buffer } from "buffer";
import express from "express";
import { verifiedOnly } from "../middlewares/verifiedOnly.js";
import { authMiddleware } from "../middlewares/Auth.middlewares.js";
import { createProject,updateProject ,getAllProjects,getAProject,resubmitProject} from "../controllers/projects.controllers.js";
import upload from "../middlewares/uploads.js";
import cloudinary from "../config/cloudinary.js";
import Project from "../models/Project.model.js";

const ProjectRouter = express.Router();

ProjectRouter.post(
    "/Createprojects",
    authMiddleware,
    upload.fields([
      { name: "coverImage", maxCount: 1 },
      { name: "businessPlan", maxCount: 1 },
    ]),
    verifiedOnly,
    createProject
  ); 

ProjectRouter.put('/updateProject/:id',updateProject)

ProjectRouter.get("/projects",getAllProjects)

ProjectRouter.get("/projects/:id",getAProject)

ProjectRouter.patch("/:projectId/resubmit", authMiddleware, resubmitProject);

// Proxy route — streams business plan PDF with Cloudinary private auth
ProjectRouter.get("/:projectId/business-plan", authMiddleware, async (req, res) => {
  let fileUrl;
  try {
    const project = await Project.findById(req.params.projectId).select("businessPlan");
    if (!project) return res.status(404).json({ message: "Project not found" });

    fileUrl = project.businessPlan;
    if (!fileUrl) return res.status(404).json({ message: "No business plan uploaded" });

    // Parse public_id from stored Cloudinary delivery URL
    // Format: https://res.cloudinary.com/<cloud>/<type>/upload/v<ver>/<public_id>.<ext>
    const urlObj       = new URL(fileUrl);
    const segments     = urlObj.pathname.split("/").filter(Boolean);
    const resourceType = segments[1] || "auto";
    const rawId        = segments.slice(4).join("/");
    const extMatch     = rawId.match(/\.([^./]+)$/);
    const format       = extMatch ? extMatch[1] : "pdf";
    const publicId     = rawId.replace(/\.[^./]+$/, "");

    const expiresAt    = Math.floor(Date.now() / 1000) + 300; // 5 min
    const downloadUrl  = cloudinary.utils.private_download_url(publicId, format, {
      resource_type: resourceType,
      type: "upload",
      expires_at: expiresAt,
      attachment: false,
    });

    const upstream = await fetch(downloadUrl);
    if (!upstream.ok) {
      const body = await upstream.text().catch(() => "");
      console.error("Cloudinary error:", upstream.status, body);
      return res.status(502).json({ message: "Failed to fetch document from storage" });
    }

    const contentType = upstream.headers.get("content-type") || "application/pdf";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `inline; filename="business-plan.pdf"`);
    const arrayBuffer = await upstream.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));

  } catch (error) {
    console.error("Business plan proxy error — URL:", fileUrl, "—", error.message);
    res.status(500).json({ message: "Failed to load business plan", detail: error.message });
  }
});


  export default ProjectRouter
  
  