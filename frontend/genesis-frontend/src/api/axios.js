import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  try {
    let token = null;
    
    // Try zustand persist format first (genesis_auth)
    const stored = localStorage.getItem("genesis_auth");
    if (stored) {
      const parsed = JSON.parse(stored);
      token = parsed?.state?.token;
    }
    
    // Fallback to raw token (genesis_token)
    if (!token) {
      token = localStorage.getItem("genesis_token");
    }
    
    // Also check if token is stored directly in state
    if (!token) {
      try {
        const directAuth = localStorage.getItem("genesis_auth");
        if (directAuth) {
          const parsed = JSON.parse(directAuth);
          token = parsed.token || parsed.state?.token;
        }
      } catch {
        // ignore parse errors
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // ignore parse errors
  }
  return config;
});

// Smart 401 handler — only force logout when no token exists
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const url = err.config?.url || "";

    if (status === 401) {
      const isAuthEndpoint =
        url.includes("/Auth/login") || url.includes("/Auth/registration");

      if (isAuthEndpoint) {
        // Bad credentials — clear state and redirect
        localStorage.removeItem("genesis_auth");
        localStorage.removeItem("genesis_token");
        window.location.href = "/login";
        return Promise.reject(err);
      }

      // For all other endpoints, only logout if there is genuinely no token
      // (i.e. the user is truly unauthenticated, not just hitting a 401 on a
      //  polling endpoint like /notifications)
      try {
        const stored = localStorage.getItem("genesis_auth");
        const parsed = stored ? JSON.parse(stored) : null;
        const token = parsed?.state?.token;
        if (!token) {
          localStorage.removeItem("genesis_auth");
          localStorage.removeItem("genesis_token");
          window.location.href = "/login";
        }
        // Token exists → permission/scope issue, not an auth failure — don't logout
      } catch {
        // ignore parse errors
      }
    }

    return Promise.reject(err);
  }
);

export default api;