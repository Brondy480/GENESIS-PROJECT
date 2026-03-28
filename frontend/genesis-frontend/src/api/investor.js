import api from "./axios";

// ── PROFILE ────────────────────────────────────────────────────────────
export const getMyProfile  = ()         => api.get("/profile/me");
export const updateProfile = (formData) => api.put("/profile/Createprofile", formData, {
  headers: { "Content-Type": "multipart/form-data" },
});

// ── PUBLIC PROJECTS (browse) ───────────────────────────────────────────
export const getPublicProjects = ()    => api.get("/publicProject");
export const getPublicProject  = (id) => api.get(`/publicProject/${id}`);
export const saveProject       = (id) => api.post(`/publicProject/${id}/save`);
export const likeProject       = (id) => api.post(`/publicProject/${id}/like`);

// ── INVESTMENT REQUEST ─────────────────────────────────────────────────
// Your endpoint: POST /investment/projects/:id/invest
export const sendInvestmentRequest = (projectId, data) =>
  api.post(`/investment/projects/${projectId}/invest`, data);

// Get my requests — NOTE: your docs don't list this endpoint explicitly.
// Try this path first; if it 404s we'll use the creator one or build differently.
export const getMyRequests = () => api.get("/investments/my-requests");

// ── NEGOTIATION ────────────────────────────────────────────────────────
export const sendCounterOffer = (reqId, data) => api.post(`/negotiation/${reqId}/counter`, data);
export const getMessages      = (reqId)       => api.get(`/negotiation/${reqId}/messages`);
export const sendMessage      = (reqId, msg)  => api.post(`/negotiation/${reqId}/message`, { message: msg });

// ── DEALS ─────────────────────────────────────────────────────────────
export const getMyDeals  = ()   => api.get("/payment");
export const getDealById = (id) => api.get(`/payment/${id}`);
// Your endpoint: POST /payment/deal/:id/pay
export const payDeal     = (id) => api.post(`/payment/deal/${id}/pay`);

// ── AGREEMENTS ────────────────────────────────────────────────────────
export const getAgreementStatus = (escrowId) => api.get(`/agreements/${escrowId}/status`);
export const downloadAgreement  = (escrowId) => api.get(`/agreements/${escrowId}/download`);
export const viewAgreementUrl   = (escrowId) => `${import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1"}/agreements/${escrowId}/view-agreement`;
export const investorSign       = (escrowId, formData) => api.post(`/agreements/${escrowId}/investor-sign`, formData, {
  headers: { "Content-Type": "multipart/form-data" },
});

// ── WALLET ────────────────────────────────────────────────────────────
export const getMyWallet = () => api.get("/wallet/my");