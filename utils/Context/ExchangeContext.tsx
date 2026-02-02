import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Exchange } from "@/Interfaces/exchange";
import { ExchangeStatus } from "@/Interfaces/exchange";
import { useUserContext } from "@/utils/Context/UserContext";

interface ExchangeContextValue {
  borrowedBooks: Exchange[];
  lendingBooks: Exchange[];
  loading: boolean;
  requestExchange: (bookId: number) => Promise<void>;
  updateExchangeStatus: (
    exchangeId: number,
    status: ExchangeStatus
  ) => Promise<void>;
  refreshBorrowed: () => Promise<void>;
  refreshLending: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const ExchangeContext = createContext<ExchangeContextValue | undefined>(
  undefined
);

export const ExchangeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currentUser, loading: userLoading } = useUserContext();
  const [borrowedBooks, setBorrowedBooks] = useState<Exchange[]>([]);
  const [lendingBooks, setLendingBooks] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(false);

  const getTokenOrThrow = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) throw new Error("Authentication token missing");
    return token;
  };

  const refreshBorrowed = useCallback(async () => {
    if (!currentUser) {
      console.log("ExchangeContext: No currentUser, skipping refreshBorrowed");
      setBorrowedBooks([]);
      setLoading(false);
      return;
    }
    console.log(
      "ExchangeContext: Starting refreshBorrowed for user:",
      currentUser.id
    );
    setLoading(true);
    try {
      const token = await getTokenOrThrow();
      const url = `${process.env.EXPO_PUBLIC_API_URL}/api/exchanges/borrowed`;
      console.log("ExchangeContext: Fetching from:", url);

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(
        "ExchangeContext: Response status:",
        response.status,
        response.statusText
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("ExchangeContext: API error:", errorText);
        throw new Error(errorText || "Unable to retrieve borrowed books");
      }

      const data: Exchange[] = await response.json();
      console.log(
        "ExchangeContext: Received",
        data?.length || 0,
        "borrowed books"
      );
      setBorrowedBooks(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("ExchangeContext: Failed to fetch borrowed books:", error);
      setBorrowedBooks([]);
      throw error; // Re-throw so UI can handle it
    } finally {
      setLoading(false);
      console.log("ExchangeContext: refreshBorrowed finished");
    }
  }, [currentUser]);

  const refreshLending = useCallback(async () => {
    if (!currentUser) {
      setLendingBooks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const token = await getTokenOrThrow();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/exchanges/lending`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Unable to retrieve lending books");
      }

      const data: Exchange[] = await response.json();
      setLendingBooks(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Failed to fetch lending books:", error);
      setLendingBooks([]);
      throw error; // Re-throw so UI can handle it
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const refreshAll = useCallback(async () => {
    if (!currentUser) {
      console.log("ExchangeContext: refreshAll called but no currentUser");
      return;
    }
    console.log("ExchangeContext: Starting refreshAll");
    setLoading(true);
    try {
      const token = await getTokenOrThrow();
      const [borrowedResponse, lendingResponse] = await Promise.all([
        fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/exchanges/borrowed`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/exchanges/lending`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (borrowedResponse.ok) {
        const borrowedData: Exchange[] = await borrowedResponse.json();
        console.log("ExchangeContext: Set borrowedBooks:", borrowedData.length);
        setBorrowedBooks(Array.isArray(borrowedData) ? borrowedData : []);
      } else {
        console.error(
          "ExchangeContext: borrowedResponse not ok:",
          borrowedResponse.status
        );
      }

      if (lendingResponse.ok) {
        const lendingData: Exchange[] = await lendingResponse.json();
        console.log("ExchangeContext: Set lendingBooks:", lendingData.length);
        setLendingBooks(Array.isArray(lendingData) ? lendingData : []);
      } else {
        console.error(
          "ExchangeContext: lendingResponse not ok:",
          lendingResponse.status
        );
      }
    } catch (error) {
      console.error("ExchangeContext: Failed to fetch exchanges:", error);
    } finally {
      setLoading(false);
      console.log("ExchangeContext: refreshAll finished");
    }
  }, [currentUser]);

  const requestExchange = async (bookId: number) => {
    if (!currentUser) {
      throw new Error("User must be logged in to request an exchange");
    }

    try {
      const token = await getTokenOrThrow();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/exchanges/request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            borrowerId: currentUser.id,
            bookId,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to request exchange");
      }

      await refreshAll();
    } catch (error) {
      console.error("Exchange request failed:", error);
      throw error;
    }
  };

  const updateExchangeStatus = async (
    exchangeId: number,
    status: ExchangeStatus
  ) => {
    try {
      const token = await getTokenOrThrow();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/exchanges/${exchangeId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to update exchange status");
      }

      await refreshAll();
    } catch (error) {
      console.error("Failed to update exchange status:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (userLoading) {
      // Still loading user, don't do anything yet
      return;
    }

    if (!currentUser) {
      console.log("ExchangeContext: No user, clearing exchanges");
      setBorrowedBooks([]);
      setLendingBooks([]);
      setLoading(false);
      return;
    }

    // User is loaded, refresh exchanges
    console.log("ExchangeContext: User loaded, refreshing all exchanges...");
    refreshAll().catch((error) => {
      console.error("ExchangeContext: Error in refreshAll:", error);
    });
  }, [userLoading, currentUser?.id, refreshAll]); // Include refreshAll in dependencies

  return (
    <ExchangeContext.Provider
      value={{
        borrowedBooks,
        lendingBooks,
        loading,
        requestExchange,
        updateExchangeStatus,
        refreshBorrowed,
        refreshLending,
        refreshAll,
      }}
    >
      {children}
    </ExchangeContext.Provider>
  );
};

export const useExchangeContext = () => {
  const context = useContext(ExchangeContext);
  if (!context) {
    throw new Error(
      "useExchangeContext must be used within an ExchangeProvider"
    );
  }
  return context;
};
