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
      const response = await axios.get("/auth/me", { skipAuth: true });
      if (response.data?.authenticated) {
        setUser(response.data);
      } else {
        setUser(null);
      }
    } catch (error) {
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
    try {
      const response = await axios.post("/auth/login", { username, password }, { skipAuth: true });
      localStorage.setItem("authToken", response.data.token);
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

  const completeOAuthLogin = async (token) => {
    localStorage.setItem("authToken", token);
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: Boolean(user),
        user,
        login,
        register,
        socialLogin,
        completeOAuthLogin,
        logout,
        authReady,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
