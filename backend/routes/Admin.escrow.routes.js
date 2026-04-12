import {
    adminValidateAgreement,
    adminReleaseEscrow,
    adminGetAllEscrows,
  } from "../controllers/adminEscrow.controller.js";
  
  // Escrow management
  router.get("/escrows", authMiddleware, adminGetAllEscrows);
  router.patch("/escrows/:escrowId/validate", authMiddleware, adminValidateAgreement);
  router.patch("/escrows/:escrowId/release", authMiddleware, adminReleaseEscrow);
  ```
  
  ---
  
  ## Test Flow
  
  **1. Get all escrows (find your escrow ID):**
  ```
  GET http://localhost:8080/api/v1/admin/escrows
  Authorization: Bearer ADMIN_JWT
  ```
  
  **2. Validate agreement:**
  ```
  PATCH http://localhost:8080/api/v1/admin/escrows/ESCROW_ID/validate
  Authorization: Bearer ADMIN_JWT
  ```
  
  **3. Release escrow:**
  ```
  PATCH http://localhost:8080/api/v1/admin/escrows/ESCROW_ID/release
  Authorization: Bearer ADMIN_JWT
  ```
  
  ---
  
  ## Complete Flow After Release
  ```
  escrow.status = "released"
  deal.status = "active"
  creator wallet credited (9,500 FCFA after 5% fee)
  Shareholder record created
  project.shareholders updated
  project.totalFunded updated
  Emails sent to both parties
  In-app notifications created