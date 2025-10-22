import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast"; 

// Axios setup
axios.defaults.baseURL = "http://localhost:8000";
axios.defaults.withCredentials = true;

// Attach CSRF token from cookie to every request
axios.interceptors.request.use((config) => {
  const token = Cookies.get("XSRF-TOKEN");
  if (token) {
    config.headers["X-XSRF-TOKEN"] = decodeURIComponent(token);
  }
  return config;
});

// ⚡ Global response interceptor
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      try {
        // Remove the client-side cookie copy
        Cookies.remove("XSRF-TOKEN");

        // ✅ Graceful message for user
        toast.error("Your session has expired. Please log in again.");

        // Optional: make sure backend session is cleaned up
        await axios.post("/api/logout").catch(() => { });

        // Redirect to login (only if not already there)
        const currentPath = window.location.pathname;
        if (currentPath !== "/") {
          setTimeout(() => {
            window.location.href = "/";
          }, 1500); // small delay so toast can be seen
        }
      } catch (e) {
        console.error("Session cleanup error:", e);
      }
    }

    return Promise.reject(error);
  }
);

export default axios;