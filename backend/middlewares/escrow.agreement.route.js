import { Router } from "express";
import { authMiddleware } from "./Auth.middlewares.js";
import { adminOnly } from "./Admin.middlewares.js";
import { uploadAgreement } from "../controllers/escrow.controller.js";
import { releaseEscrow } from "../controllers/realeaseEscrow.controller.js";
import upload from "./uploads.js";

const router = Router();

router.post(
    "/escrow/:escrowId/upload",
    authMiddleware,
    upload.single("agreement"),
    uploadAgreement
  );
  
  router.post(
    "/escrow/:escrowId/release",
    authMiddleware,
    adminOnly,
    releaseEscrow
  );
        