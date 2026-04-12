import api from "./axios";

// ── USER VERIFICATION ──
export const getPendingUsers    = ()     => api.get("/admin/verification");
export const getUserById        = (id)   => api.get(`/admin/verification/${id}`);
export const approveUser        = (id)   => api.patch(`/admin/verification/approuve/${id}`);
export const rejectUser         = (id)   => api.patch(`/admin/verification/reject/${id}`);
export const suspendUser        = (id)   => api.put(`/admin/users/suspend/${id}`);
export const unsuspendUser      = (id)   => api.put(`/admin/users/unsuspend/${id}`);

// ── PROJECTS ──
export const getPendingProjects = ()     => api.get("/admin/Projects/GetPendingProject");
export const approveProject     = (id)   => api.patch(`/admin/Projects/approuve/${id}`);
export const rejectProject      = (id)   => api.patch(`/admin/Projects/reject/${id}`);
export const suspendProject     = (id)   => api.patch(`/admin/Projects/suspend/${id}`);
export const deleteProject      = (id)   => api.delete(`/admin/Projects/${id}`);
export const getAllProjects      = ()     => api.get("/publicProject");

// ── INVESTMENT REQUESTS ──
export const getInvestmentRequests  = ()   => api.get("/AdminInvestmentRequest/investment-requests");
export const approveInvestment      = (id) => api.put(`/AdminInvestmentRequest/investments/${id}/approuve`);
export const rejectInvestment       = (id) => api.put(`/AdminInvestmentRequest/investments/${id}/reject`);

// ── ESCROWS ──
export const getAllEscrows       = ()     => api.get("/admin/escrows");
export const validateEscrow     = (id)   => api.patch(`/admin/escrows/${id}/validate`);
export const releaseEscrow      = (id)   => api.patch(`/admin/escrows/${id}/release`);