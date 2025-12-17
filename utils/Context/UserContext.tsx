import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { decode as base64Decode } from "base-64";
import { getToken, removeToken } from "@/utils/Context/storageUtils";
import { FetchUserByEmail } from "@/utils/Users";
import type { UserSummary } from "@/Interfaces/user";
import { AuthContext } from "./AuthContext";

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

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<UserSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useContext(AuthContext);

  const refreshCurrentUser =
    useCallback(async (): Promise<UserSummary | null> => {
      try {
        const token = await getToken();
        if (!token) {
          console.log("⚠️ No token found when refreshing user");
          setCurrentUser(null);
          setLoading(false);
          return null;
        }

        const email = parseEmailFromToken(token);
        if (!email) {
          console.log("⚠️ Could not parse email from token");
          setCurrentUser(null);
          setLoading(false);
          return null;
        }

        console.log("🔍 Fetching user by email:", email);
        const user = await FetchUserByEmail(email);
        if (user) {
          console.log("✅ User fetched successfully:", user.email);
          setCurrentUser(user);
        } else {
          console.warn("⚠️ User not found for email:", email);
          setCurrentUser(null);
        }
        setLoading(false);
        return user ?? null;
      } catch (error: any) {
        console.error("❌ Unable to refresh current user:", {
          error: error.message || error,
          stack: error.stack,
        });
        setCurrentUser(null);
        setLoading(false);
        return null;
      }
    }, []);

  const logoutUserLocally = async () => {
    await removeToken();
    setCurrentUser(null);
  };

  // Fetch user on mount
  useEffect(() => {
    refreshCurrentUser();
  }, []);

  // Refresh user when login state changes to true
  // Use a ref to track previous state and prevent unnecessary updates
  const prevIsLoggedInRef = React.useRef<boolean | undefined>(undefined);
  useEffect(() => {
    // Initialize ref on first render
    if (prevIsLoggedInRef.current === undefined) {
      prevIsLoggedInRef.current = isLoggedIn;
      // On first render, if logged in, fetch user
      if (isLoggedIn) {
        console.log(
          "🔄 UserContext: Initial render, user is logged in, refreshing user..."
        );
        refreshCurrentUser();
      }
      return;
    }

    // Only act on state changes, not every render
    if (prevIsLoggedInRef.current === isLoggedIn) {
      return; // No change, skip
    }

    if (isLoggedIn && prevIsLoggedInRef.current === false) {
      // Transitioning from logged out to logged in
      console.log("🔄 Login state changed to true, refreshing user...");
      refreshCurrentUser();
    } else if (!isLoggedIn && prevIsLoggedInRef.current === true) {
      // Transitioning from logged in to logged out
      console.log("🔄 Login state changed to false, clearing user...");
      // Clear user when logged out - use functional update to prevent loops
      setCurrentUser((prev) => {
        if (prev !== null) {
          return null;
        }
        return prev;
      });
      setLoading((prev) => {
        if (prev !== false) {
          return false;
        }
        return prev;
      });
    }

    // Update ref after processing
    prevIsLoggedInRef.current = isLoggedIn;
  }, [isLoggedIn, refreshCurrentUser]);

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
