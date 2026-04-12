import api from "./axios";

export const getMyFundings    = ()         => api.get("/projectsFunding/my-fundings");
export const fundProject      = (id, data) => api.post(`/projectsFunding/projects/${id}/fund`, data);
export const getPublicProjects = ()        => api.get("/publicProject");
export const getSavedProjects = ()         => api.get("/publicProject/saved");
export const unsaveProject    = (id)       => api.post(`/publicProject/${id}/save`);
export const getMyWallet      = ()         => api.get("/wallet/my");
export const getMyProfile     = ()         => api.get("/profile/me");
export const updateProfile    = (data)     => api.put("/profile/Createprofile", data, { headers: { "Content-Type": "multipart/form-data" } });
