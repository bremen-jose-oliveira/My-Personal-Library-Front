import React, { createContext, useContext, useEffect, useState } from "react";
import { decode as base64Decode } from "base-64";
import { getToken, removeToken } from "@/utils/Context/storageUtils";
import { FetchUserByEmail } from "@/utils/Users";
import type { UserSummary } from "@/Interfaces/user";

interface UserContextValue {
  currentUser: UserSummary | null;
  loading: boolean;
  refreshCurrentUser: () => Promise<UserSummary | null>;
  logoutUserLocally: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

const parseEmailFromToken = (token: string | null): string | null => {
  if (!token) return null;
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const decoded = base64Decode(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const parsed = JSON.parse(decoded);
    return typeof parsed.sub === "string" ? parsed.sub : null;
  } catch (error) {
    console.error("Failed to parse JWT:", error);
    return null;
  }
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshCurrentUser = async (): Promise<UserSummary | null> => {
    try {
      const token = await getToken();
      const email = parseEmailFromToken(token);
      if (!email) {
        setCurrentUser(null);
        return null;
      }
      const user = await FetchUserByEmail(email);
      setCurrentUser(user);
      return user ?? null;
    } catch (error) {
      console.error("Unable to refresh current user:", error);
      setCurrentUser(null);
      return null;
    }
  };

  const logoutUserLocally = async () => {
    await removeToken();
    setCurrentUser(null);
  };

  useEffect(() => {
    refreshCurrentUser().finally(() => setLoading(false));
  }, []);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        loading,
        refreshCurrentUser,
        logoutUserLocally,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};

