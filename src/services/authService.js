import axios from "axios";
import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_SERVER_BASE_URL + "/api/users";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  signup: async (userData) => {
    try {
      const response = await api.post("/signup", userData);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup Failed");
      throw error;
    }
  },

  verifyOTP: async (verificationData) => {
    try {
      const response = await api.post("/verify-otp", verificationData);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "OTP Verification Failed");
      throw error;
    }
  },

  login: async (loginData) => {
    try {
      const response = await api.post("/login", loginData);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Login Failed");
      throw error;
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post("/forgot-password", { email });
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Password Reset Failed");
      throw error;
    }
  },

  resetPassword: async (resetData) => {
    try {
      const response = await api.post("/reset-password", resetData);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Password Reset Failed");
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  getCurrentUserId: () => {
    const user = localStorage.getItem("user");
    try {
      const parsedUser = user ? JSON.parse(user) : null;
      return parsedUser?.id; // This matches the structure you showed
    } catch (error) {
      console.error("Error parsing user:", error);
      return null;
    }
  },

  // New method to fetch net profit summary
  getNetProfitSummary: async (userId) => {
    try {
      console.log("Fetching net profit for userId:", userId);
      const response = await api.get(`/net-profit-summary/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Full error details:", error.response);
      toast.error(
        error.response?.data?.message || "Failed to fetch net profit summary"
      );
      throw error;
    }
  },

  // Helper method to get current user ID from localStorage
  getCurrentUserId: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user).id : null;
  },

  addColumnEntry: async (columnData) => {
    try {
      const userId = authService.getCurrentUserId();
      const response = await api.post(`/column-entry`, {
        userId,
        ...columnData,
      });
      return response.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to add column entry"
      );
      throw error;
    }
  },

  getColumnEntries: async (columnName, params = {}) => {
    try {
      const userId = authService.getCurrentUserId();
      const response = await api.get(
        `/column-entries/${userId}/${columnName}`,
        {
          params,
        }
      );
      return response.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to retrieve column entries"
      );
      throw error;
    }
  },

  getAllUserColumns: async (params = {}) => {
    try {
      const userId = authService.getCurrentUserId();
      const response = await api.get(`/all-columns/${userId}`, {
        params,
      });
      return response.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to retrieve user columns"
      );
      throw error;
    }
  },

  // Add Weekly Profit Entry
  addWeeklyProfitEntry: async (entryData) => {
    try {
      const userId = authService.getCurrentUserId();
      const response = await api.post("/profit-entry", {
        userId,
        ...entryData,
      });
      toast.success("Profit entry added successfully");
      return response.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to add profit entry"
      );
      throw error;
    }
  },

  // Get Weekly Profit Entries
  getWeeklyProfitEntries: async (params = {}) => {
    try {
      const userId = authService.getCurrentUserId();
      const response = await api.get(`/getprofit-entries/${userId}`, {
        params,
      });
      return response.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to retrieve profit entries"
      );
      throw error;
    }
  },
};
