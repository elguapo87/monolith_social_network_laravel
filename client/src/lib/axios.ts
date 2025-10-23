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
      // Check if user was previously logged in
      const wasLoggedIn = !!Cookies.get("laravel_session");

      if (wasLoggedIn) {
        toast.error("Your session has expired. Please log in again.");
      }

      // Always clean up
      Cookies.remove("XSRF-TOKEN");

      // Optional: call logout only if logged in
      if (wasLoggedIn) {
        await axios.post("/api/logout").catch(() => {});
      }

      // Redirect to login if not already there
      const currentPath = window.location.pathname;
      if (currentPath !== "/") {
        setTimeout(() => {
          window.location.href = "/";
        }, wasLoggedIn ? 1500 : 0);
      }
    }

    return Promise.reject(error);
  }
);

export default axios;