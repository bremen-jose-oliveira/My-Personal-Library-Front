import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Exchange } from "@/Interfaces/exchange";
import { ExchangeStatus } from "@/Interfaces/exchange";
import { useUserContext } from "@/utils/Context/UserContext";

interface ExchangeContextValue {
  exchanges: Exchange[];
  loading: boolean;
  requestExchange: (bookId: number) => Promise<void>;
  updateExchangeStatus: (exchangeId: number, status: ExchangeStatus) => Promise<void>;
  refreshExchanges: () => Promise<void>;
}

const ExchangeContext = createContext<ExchangeContextValue | undefined>(undefined);

export const ExchangeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading: userLoading } = useUserContext();
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(false);

  const getTokenOrThrow = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) throw new Error("Authentication token missing");
    return token;
  };

  const refreshExchanges = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const token = await getTokenOrThrow();
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/exchanges/my`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Unable to retrieve exchanges");
      }

      const data: Exchange[] = await response.json();
      setExchanges(data);
    } catch (error) {
      console.error("Failed to fetch exchanges:", error);
    } finally {
      setLoading(false);
    }
  };

  const requestExchange = async (bookId: number) => {
    if (!currentUser) {
      throw new Error("User must be logged in to request an exchange");
    }

    try {
      const token = await getTokenOrThrow();
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/exchanges/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          borrowerId: currentUser.id,
          bookId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to request exchange");
      }

      await refreshExchanges();
    } catch (error) {
      console.error("Exchange request failed:", error);
      throw error;
    }
  };

  const updateExchangeStatus = async (exchangeId: number, status: ExchangeStatus) => {
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

      await refreshExchanges();
    } catch (error) {
      console.error("Failed to update exchange status:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (!userLoading) {
      refreshExchanges();
    }
  }, [userLoading, currentUser?.id]);

  return (
    <ExchangeContext.Provider
      value={{
        exchanges,
        loading,
        requestExchange,
        updateExchangeStatus,
        refreshExchanges,
      }}
    >
      {children}
    </ExchangeContext.Provider>
  );
};

export const useExchangeContext = () => {
  const context = useContext(ExchangeContext);
  if (!context) {
    throw new Error("useExchangeContext must be used within an ExchangeProvider");
  }
  return context;
};

