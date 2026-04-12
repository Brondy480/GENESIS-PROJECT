import express from "express";
import adminOnly from "../middlewares/admin.middleware.js";
import { getPendingVerifications, getUserForVerification, approveUser, rejectUser } from "../controllers/verification.controller.js";
import { authMiddleware } from "../middlewares/Auth.middlewares.js";
import { suspendUser,unsuspendUser } from "../controllers/verification.controller.js";
import { getPendingProjects,approveProject,rejectProject,suspendProject,deleteProject} from "../controllers/admin.projects.controller.js";
import {
  adminValidateAgreement,
  adminReleaseEscrow,
  adminGetAllEscrows,
} from "../controllers/adminEscrow.controler.js"



const AdminRouter = express.Router();

//admin users controle routes 


AdminRouter.get("/verification",authMiddleware,adminOnly,getPendingVerifications)

AdminRouter.get("/verification/:userId",authMiddleware,adminOnly,getUserForVerification)

AdminRouter.patch("/verification/approuve/:userId",authMiddleware,adminOnly,approveUser)

AdminRouter.patch("/verification/reject/:userId",authMiddleware,adminOnly,rejectUser)

AdminRouter.put(
    "/users/suspend/:userId",
    authMiddleware,
    adminOnly,
    suspendUser
  );
  
  AdminRouter.put(
    "/users/unsuspend/:userId",
    authMiddleware,
    adminOnly,  
    unsuspendUser
  );
  
  //admin project controle routes 

  AdminRouter.get("/Projects/GetPendingProject",authMiddleware,
    adminOnly,getPendingProjects)
  AdminRouter.patch("/Projects/approuve/:projectId",authMiddleware,
    adminOnly,approveProject)
  AdminRouter.patch("/Projects/reject/:projectId",authMiddleware,
    adminOnly,rejectProject)
  AdminRouter.patch("/Projects/suspend/:projectId",authMiddleware,
    adminOnly,suspendProject)
  AdminRouter.delete("/Projects/:projectId",authMiddleware,
    adminOnly,deleteProject)

  
    // Escrow management
    AdminRouter.get("/escrows", authMiddleware, adminGetAllEscrows);
    AdminRouter.patch("/escrows/:escrowId/validate", authMiddleware, adminValidateAgreement);
    AdminRouter.patch("/escrows/:escrowId/release", authMiddleware, adminReleaseEscrow);
 
   
 


export default AdminRouter;

