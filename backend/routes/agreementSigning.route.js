import { Buffer } from "buffer";
import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import {
  investorSignAgreement,
  creatorSignAgreement,
  getAgreementStatus,
  downloadAgreement,
} from "../controllers/SignAgreement.controller.js";
import { authMiddleware } from "../middlewares/Auth.middlewares.js";
import { generateAgreementPDF } from "../services/agreementPDF.service.js";
import Escrow from "../models/Escrow.model.js";
import Deal from "../models/Deal.js";
import Users from "../models/Users.model.js";
import Project from "../models/Project.model.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => {
    return {
      folder: "genesis-agreements",
      allowed_formats: ["pdf", "jpg", "png"],
      resource_type: "auto",
    };
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    console.log("📎 Uploaded file:", file.originalname, file.mimetype);
    cb(null, true);
  },
});

const router = express.Router();

// GET all escrows for the currently logged-in investor or creator
router.get("/my-escrows", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const userType = req.user.userType;

    const filter = userType === "creator"
      ? { creator: userId }
      : { investor: userId };

    const escrows = await Escrow.find(filter)
      .populate("project", "title coverImage")
      .populate("deal", "dealStatus amount equity")
      .populate("investor", "name")
      .populate("creator", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({ escrows });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch escrows", error: error.message });
  }
});

// GET agreement status
router.get("/:escrowId/status", authMiddleware, getAgreementStatus);

// Download agreement (returns URLs)
router.get("/:escrowId/download", authMiddleware, downloadAgreement);

// View/stream generated agreement PDF directly from server
router.get("/:escrowId/view-agreement", authMiddleware, async (req, res) => {
  try {
    const escrow = await Escrow.findById(req.params.escrowId);
    if (!escrow) return res.status(404).json({ message: "Escrow not found" });

    const userId = req.user._id.toString();
    const isInvestor = escrow.investor.toString() === userId;
    const isCreator = escrow.creator.toString() === userId;
    const isAdmin = req.user.userType === "admin";

    if (!isInvestor && !isCreator && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const deal = await Deal.findById(escrow.deal);
    const investor = await Users.findById(escrow.investor).select("name");
    const creator = await Users.findById(escrow.creator).select("name");
    const project = await Project.findById(escrow.project).select("title valuation");

    const pdfBuffer = await generateAgreementPDF({
      dealId: deal._id.toString(),
      projectTitle: project.title,
      creatorName: creator.name,
      investorName: investor.name,
      amount: deal.amount,
      equity: deal.equity,
      valuation: project.valuation || null,
      date: new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="agreement_${deal._id}.pdf"`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error("View agreement error:", error.message);
    res.status(500).json({ message: "Failed to generate agreement", error: error.message });
  }
});

// Proxy signed document — admin only
// Uses Cloudinary's private_download_url (api.cloudinary.com) which authenticates
// via api_key + timestamp signature, bypassing CDN ACL restrictions entirely.
router.get("/:escrowId/signed-doc/:party", authMiddleware, async (req, res) => {
  let fileUrl;
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const escrow = await Escrow.findById(req.params.escrowId);
    if (!escrow) return res.status(404).json({ message: "Escrow not found" });

    const { party } = req.params;
    if (party === "creator")  fileUrl = escrow.agreement.creatorSignedUrl;
    if (party === "investor") fileUrl = escrow.agreement.investorSignedUrl;

    if (!fileUrl) {
      return res.status(404).json({ message: "Signed document not yet uploaded" });
    }

    // Parse public_id and format from the stored Cloudinary delivery URL.
    // URL format: https://res.cloudinary.com/<cloud>/<type>/upload/v<ver>/<public_id>.<ext>
    const urlObj       = new URL(fileUrl);
    const segments     = urlObj.pathname.split("/").filter(Boolean);
    // segments: [ cloudName, resourceType, "upload", "v1775538045", ...publicIdParts ]
    const resourceType = segments[1] || "image";
    const rawId        = segments.slice(4).join("/"); // e.g. "genesis-agreements/abc.pdf"
    const extMatch     = rawId.match(/\.([^./]+)$/);
    const format       = extMatch ? extMatch[1] : "pdf";
    const publicId     = rawId.replace(/\.[^./]+$/, ""); // strip extension

    console.log("Signed doc request — public_id:", publicId, "format:", format, "resource_type:", resourceType);

    // private_download_url generates a time-limited authenticated URL via the Cloudinary API endpoint
    const expiresAt = Math.floor(Date.now() / 1000) + 300; // valid 5 min
    const downloadUrl = cloudinary.utils.private_download_url(publicId, format, {
      resource_type: resourceType,
      type: "upload",
      expires_at: expiresAt,
      attachment: false,
    });

    console.log("Private download URL:", downloadUrl);

    const upstream = await fetch(downloadUrl);
    if (!upstream.ok) {
      const body = await upstream.text().catch(() => "");
      console.error("Cloudinary API error:", upstream.status, body);
      return res.status(502).json({
        message: "Failed to fetch document from storage",
        detail: `Storage returned ${upstream.status}`,
      });
    }

    const contentType = upstream.headers.get("content-type") || "application/pdf";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `inline; filename="agreement-${party}.pdf"`);
    const arrayBuffer = await upstream.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));

  } catch (error) {
    console.error("=== SIGNED DOC PROXY ERROR ===");
    console.error("URL attempted:", fileUrl);
    console.error("Error:", error.message, error.cause);
    console.error("==============================");
    res.status(502).json({ message: "Failed to fetch document", detail: error.message });
  }
});

// Investor signs
router.post("/:escrowId/investor-sign", authMiddleware, upload.any(), investorSignAgreement);

// Creator signs
router.post("/:escrowId/creator-sign", authMiddleware, (req, res, next) => {
  console.log("📎 Content-Type:", req.headers["content-type"]);
  next();
}, upload.any(), creatorSignAgreement);

export default router;
