import React, { createContext, useContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Review, ReviewRequest } from "@/Interfaces/review";

interface ReviewContextValue {
  reviews: Review[];
  myReviews: Review[];
  loading: boolean;
  fetchReviewsForBook: (bookId: number) => Promise<void>;
  fetchMyReviews: () => Promise<void>;
  createReview: (payload: ReviewRequest) => Promise<void>;
  updateReview: (reviewId: number, payload: Omit<ReviewRequest, "bookId">) => Promise<void>;
  deleteReview: (reviewId: number) => Promise<void>;
  getReviewById: (reviewId: number) => Promise<Review | null>;
  clearReviews: () => void;
}

const ReviewContext = createContext<ReviewContextValue | undefined>(undefined);

export const ReviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  const getToken = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) throw new Error("Authentication token missing");
    return token;
  };

  const fetchReviewsForBook = async (bookId: number) => {
    if (!bookId) return;
    setLoading(true);
    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/reviews/book/${bookId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }

      const data: Review[] = await response.json();
      setReviews(data);
    } catch (error) {
      console.error("Unable to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const createReview = async (payload: ReviewRequest) => {
    try {
      const token = await getToken();
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create review");
      }
      await fetchReviewsForBook(payload.bookId);
    } catch (error) {
      console.error("Create review failed:", error);
      throw error;
    }
  };

  const updateReview = async (reviewId: number, payload: Omit<ReviewRequest, "bookId">) => {
    try {
      const token = await getToken();
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/reviews/${reviewId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to update review");
      }
      // bookId unknown here; rely on caller to refetch
    } catch (error) {
      console.error("Update review failed:", error);
      throw error;
    }
  };

  const deleteReview = async (reviewId: number) => {
    try {
      const token = await getToken();
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to delete review");
      }
      setReviews((prev) => prev.filter((review) => review.id !== reviewId));
    } catch (error) {
      console.error("Delete review failed:", error);
      throw error;
    }
  };

  const fetchMyReviews = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/reviews/my`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch my reviews");
      }

      const data: Review[] = await response.json();
      setMyReviews(data);
    } catch (error) {
      console.error("Unable to fetch my reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const getReviewById = async (reviewId: number): Promise<Review | null> => {
    try {
      const token = await getToken();
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/reviews/${reviewId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch review");
      }

      const data: Review = await response.json();
      return data;
    } catch (error) {
      console.error("Unable to fetch review:", error);
      return null;
    }
  };

  const clearReviews = () => setReviews([]);

  return (
    <ReviewContext.Provider
      value={{
        reviews,
        myReviews,
        loading,
        fetchReviewsForBook,
        fetchMyReviews,
        createReview,
        updateReview,
        deleteReview,
        getReviewById,
        clearReviews,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
};

export const useReviewContext = () => {
  const context = useContext(ReviewContext);
  if (!context) {
    throw new Error("useReviewContext must be used within a ReviewProvider");
  }
  return context;
};




