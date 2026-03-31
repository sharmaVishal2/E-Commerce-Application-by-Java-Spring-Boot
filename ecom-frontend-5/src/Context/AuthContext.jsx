import { createContext, useEffect, useState } from "react";
import axios from "../axios";

const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  authReady: false,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get("/auth/me");
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem("authToken");
      setUser(null);
    } finally {
      setAuthReady(true);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("authToken")) {
      fetchCurrentUser();
    } else {
      setAuthReady(true);
    }
  }, []);

  const login = async (username, password) => {
    const token = window.btoa(`${username}:${password}`);
    localStorage.setItem("authToken", token);
    try {
      const response = await axios.get("/auth/me");
      setUser(response.data);
      return { success: true };
    } catch (error) {
      localStorage.removeItem("authToken");
      setUser(null);
      return {
        success: false,
        message: error.response?.status === 401
          ? "Invalid username or password."
          : "Unable to sign in.",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setUser(null);
  };

  const register = async (username, password) => {
    try {
      await axios.post("/auth/register", { username, password });
      return await login(username, password);
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Unable to create account.",
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: Boolean(user),
        user,
        login,
        register,
        logout,
        authReady,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
