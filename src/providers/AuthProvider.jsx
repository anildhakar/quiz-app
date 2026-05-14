import React, { createContext, useContext, useState, useEffect } from "react";
import { cacheOps } from "../services/db";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  
  useEffect(() => {
    const initAuth = async () => {
  
      const adminSession = await cacheOps.getAdminSession();
      if (adminSession?.isLoggedIn) {
        setIsAdmin(true);
      }

      
      const storedUserId = localStorage.getItem("quizapp_user");

      if (storedUserId) {
        const userData = await cacheOps.getUser(storedUserId);
        if (userData) {
          setUser(userData);
        }
      }

      setIsInitialized(true);
    };

    initAuth();
  }, []);

  
  const loginAdmin = async (password) => {
    const success = await authService.loginAdmin(password);
    if (success) setIsAdmin(true);
    return success;
  };

  const logoutAdmin = async () => {
    await authService.logoutAdmin();
    setIsAdmin(false);
  };

  
  const loginUser = async (username, password) => {
    const userData = await authService.loginUser(username, password);

    if (userData) {
      setUser(userData);
      return true;
    }

    return false;
  };

  const registerUser = async (username, password, displayName) => {
    const userData = await authService.registerUser(
      username,
      password,
      displayName
    );

    if (userData) {
      setUser(userData);
      return true;
    }

    return false;
  };

  const logoutUser = () => {
    authService.logoutUser();
    setUser(null);
  };

  
  
  const updateUserDisplayName = async (name) => {
    const updated = await authService.updateUserDisplayName(user, name);

    if (updated) {
      setUser(updated);
    }
  };

  
  return (
    <AuthContext.Provider
      value={{
        isAdmin,
        user,
        isInitialized,
        loginAdmin,
        logoutAdmin,
        loginUser,
        registerUser,
        logoutUser,
        updateUserDisplayName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used inside AuthProvider");
  }

  return context;
};