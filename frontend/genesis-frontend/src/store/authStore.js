import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../api/axios";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // LOGIN
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post("/Auth/login", { email, password });
          const { token, user } = res.data;
          localStorage.setItem("genesis_token", token);
          set({ user, token, isAuthenticated: true, isLoading: false });
          return { success: true, user };
        } catch (err) {
          const msg = err.response?.data?.message || "Login failed";
          set({ error: msg, isLoading: false });
          return { success: false, error: msg };
        }
      },

      // REGISTER
      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post("/Auth/registration", data);
          const { token, user } = res.data;
          localStorage.setItem("genesis_token", token);
          set({ user, token, isAuthenticated: true, isLoading: false });
          return { success: true, user };
        } catch (err) {
          const msg = err.response?.data?.message || "Registration failed";
          set({ error: msg, isLoading: false });
          return { success: false, error: msg };
        }
      },

      // LOGOUT
      logout: () => {
        localStorage.removeItem("genesis_token");
        set({ user: null, token: null, isAuthenticated: false });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "genesis_auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
