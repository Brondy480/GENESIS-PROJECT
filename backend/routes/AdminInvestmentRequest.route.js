import express from "express";
import { authMiddleware } from "../middlewares/Auth.middlewares.js";
import  adminOnly  from "../middlewares/admin.middleware.js";

import { getPendingInvestmentRequests,adminApproveInvestment,adminRejectInvestment } from "../controllers/adminInvestmentController.js";




const router = express.Router();

router.get(
  "/investment-requests",
  authMiddleware,
  adminOnly,
  getPendingInvestmentRequests
);



router.put(
  "/investments/:requestId/approuve",
  authMiddleware,
  adminOnly,
  adminApproveInvestment
);

router.put(
  "/investments/:requestId/reject",
  authMiddleware,
  adminOnly,
  adminRejectInvestment
);



export default router;
