import api from "./axios";


export const getCreatorDashboard = async () => {
  try {
    const response = await api.get("/creator/dashboard"); // matches your backend route
    return response.data;
  } catch (err) {
    console.error("Error fetching dashboard:", err);
    throw err;
  }
};

// ── PROFILE ────────────────────────────────────────────────────────────
export const getMyProfile = () => api.get("/profile/me");
export const updateProfile = (formData) => api.put("/profile/Createprofile", formData, {
  headers: { "Content-Type": "multipart/form-data" },
});

// ── PROJECTS ───────────────────────────────────────────────────────────
export const createProject = (formData) => api.post("/project/Createprojects", formData, {
  headers: { "Content-Type": "multipart/form-data" },
});
// Note: no "get my projects" endpoint in your docs — using public list filtered by creator
export const getPublicProjects = () => api.get("/publicProject");

// ── INVESTMENT REQUESTS (creator side) ────────────────────────────────
export const getMyRequests = () => api.get("/creator/investments/PendingInvestmentRequests");
export const acceptRequest = (id) => api.patch(`/creator/investments/accept/${id}`);
export const rejectInvestment = (id) => api.patch(`/creator/investments/reject/${id}`);

// ── NEGOTIATION ────────────────────────────────────────────────────────
export const sendCounterOffer = (reqId, data) => api.post(`/negotiation/${reqId}/counter`, data);
export const getMessages = (reqId) => api.get(`/negotiation/${reqId}/messages`);
export const sendMessage = (reqId, msg) => api.post(`/negotiation/${reqId}/message`, { message: msg });

// ── DEALS ──────────────────────────────────────────────────────────────
export const getMyDeals = () => api.get("/creator/investments/my-deals");

// ── AGREEMENTS ────────────────────────────────────────────────────────
export const getAgreementStatus = (escrowId) => api.get(`/agreements/${escrowId}/status`);
export const downloadAgreement = (escrowId) => api.get(`/agreements/${escrowId}/download`);
export const viewAgreement = (escrowId) => `/agreements/${escrowId}/view-agreement`; // returns URL for iframe
export const creatorSign = (escrowId, formData) => api.post(`/agreements/${escrowId}/creator-sign`, formData, {
  headers: { "Content-Type": "multipart/form-data" },
});

// notification 
export const getNotifications = () => api.get("/notifications/");
export const markAllNotificationsRead = () => api.patch("/notifications/read-all");

// ── WALLET ────────────────────────────────────────────────────────────
export const getMyWallet = () => api.get("/wallet/my");