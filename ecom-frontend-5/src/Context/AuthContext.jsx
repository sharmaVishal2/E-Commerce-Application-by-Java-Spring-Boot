import { createContext, useEffect, useState } from "react";
import axios, { AUTH_BASE_URL } from "../axios";

const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  login: async () => {},
  register: async () => {},
  socialLogin: () => {},
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
    fetchCurrentUser();
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
    axios.post(`${AUTH_BASE_URL}/logout`, null, { skipAuth: true }).catch(() => {});
    localStorage.removeItem("authToken");
    setUser(null);
  };

  const register = async (username, password) => {
    try {
      await axios.post("/auth/register", { username, password }, { skipAuth: true });
      return await login(username, password);
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Unable to create account.",
      };
    }
  };

  const socialLogin = (provider) => {
    window.location.assign(`${AUTH_BASE_URL}/oauth2/authorization/${provider}`);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: Boolean(user),
        user,
        login,
        register,
        socialLogin,
        logout,
        authReady,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
