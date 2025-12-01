
import Book from "@/Interfaces/book";
import { fetchCoverImage } from "@/utils/fetchBookData";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useState, useEffect, useContext } from "react";
import { useUserContext } from "@/utils/Context/UserContext";
import { BookStatus } from "@/Interfaces/userBookStatus";

interface BookContextProps {
  books: Book[];
  selectedBook?: Book | null;
  loadingDetails: boolean;
  fetchBookById: (id: number) => Promise<void>;
  fetchCurrentUserBooks: () => Promise<void>;
  fetchAllBooks: () => Promise<Book[]>;
  addBook: (book: Omit<Book, "id">) => Promise<void>;
  updateBook: (id: number, book: Partial<Omit<Book, "id" | "owner" | "ownerUsername">>) => Promise<void>;
  deleteBook: (id: number) => Promise<void>;
  updateReadingStatus: (bookId: number, status: BookStatus) => Promise<void>;
  getBookStatus: (bookId: number) => Promise<BookStatus | null>;
}

const BookContext = createContext<BookContextProps | undefined>(undefined);

const getAuthToken = async () => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("Token is missing or expired");
  return token;
};

const enrichBookWithCover = async (book: Book) => {
  if (book.cover) return book;
  const coverUrl = await fetchCoverImage(book.title, book.author);
  return { ...book, cover: coverUrl };
};

export const BookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, refreshCurrentUser } = useUserContext();
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchBookById = async (id: number) => {
    if (!id) return;
    setLoadingDetails(true);
    try {
      const token = await getAuthToken();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/books/details/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch book: ${response.statusText}`);
      }

      const book: Book = await response.json();
      const hydrated = await enrichBookWithCover(book);
      setSelectedBook(hydrated);
    } catch (error) {
      console.error("Error fetching book by ID:", error);
      setSelectedBook(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const fetchCurrentUserBooks = async () => {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/books/my/with-status`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch books: ${response.statusText}`);
      }

      const data: Book[] = await response.json();
      const booksWithCovers = await Promise.all(data.map(enrichBookWithCover));
      setBooks(booksWithCovers);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  const addBook = async (book: Omit<Book, "id">) => {
    try {
      const token = await getAuthToken();
      const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/books`;
      
      console.log("Adding book to:", apiUrl);
      console.log("Book data:", JSON.stringify(book, null, 2));
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(book),
      });

      if (!response.ok) {
        let errorMessage = "Failed to add book";
        try {
          const errorText = await response.text();
          if (errorText) {
            try {
              const errorJson = JSON.parse(errorText);
              errorMessage = errorJson.message || errorJson.error || errorMessage;
            } catch {
              errorMessage = errorText || errorMessage;
            }
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
        }
        
        if (response.status === 401) {
          errorMessage = "Authentication failed. Please login again.";
        } else if (response.status === 400) {
          errorMessage = errorMessage || "Invalid book data. Please check all fields.";
        }
        
        throw new Error(errorMessage);
      }

      await fetchCurrentUserBooks();
    } catch (error: any) {
      console.error("Error adding book:", error);
      
      // Provide more specific error messages
      if (error.message === "Token is missing or expired") {
        throw new Error("Your session has expired. Please login again.");
      } else if (error.message?.includes("Failed to fetch") || error.message?.includes("NetworkError")) {
        throw new Error("Network error. Please check your connection and ensure the backend is running.");
      } else if (error.message) {
        throw error;
      } else {
        throw new Error("Failed to add book. Please try again.");
      }
    }
  };

  const updateBook = async (id: number, book: Partial<Omit<Book, "id" | "owner" | "ownerUsername">>) => {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/books/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(book),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to update book");
      }

      await fetchBookById(id);
      await fetchCurrentUserBooks();
    } catch (error) {
      console.error("Error updating book:", error);
      throw error;
    }
  };

  const deleteBook = async (id: number) => {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/books/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to delete book");
      }

      setBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));
      if (selectedBook?.id === id) {
        setSelectedBook(null);
      }
    } catch (error) {
      console.error("Error deleting book:", error);
      throw error;
    }
  };

  const fetchAllBooks = async (): Promise<Book[]> => {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/books`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch books: ${response.statusText}`);
      }

      const data: Book[] = await response.json();
      const booksWithCovers = await Promise.all(data.map(enrichBookWithCover));
      return booksWithCovers;
    } catch (error) {
      console.error("Error fetching all books:", error);
      throw error;
    }
  };

  const getBookStatus = async (bookId: number): Promise<BookStatus | null> => {
    let user = currentUser;
    if (!user) {
      user = await refreshCurrentUser();
    }
    if (!user) {
      return null;
    }

    try {
      const token = await getAuthToken();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/user-book-status/${user.id}/${bookId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.status as BookStatus;
    } catch (error) {
      console.error("Error fetching book status:", error);
      return null;
    }
  };

  const updateReadingStatus = async (bookId: number, status: BookStatus) => {
    let user = currentUser;
    if (!user) {
      user = await refreshCurrentUser();
    }
    if (!user) {
      throw new Error("User must be logged in to update reading status");
    }

    if (!bookId || isNaN(bookId)) {
      throw new Error("Invalid book ID");
    }

    try {
      const token = await getAuthToken();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/user-book-status/${user.id}/${bookId}?status=${status}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        let errorMessage = "Failed to update reading status";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          const errorText = await response.text();
          if (errorText) {
            try {
              const errorJson = JSON.parse(errorText);
              errorMessage = errorJson.message || errorJson.error || errorMessage;
            } catch {
              errorMessage = errorText || errorMessage;
            }
          }
        }
        
        if (response.status === 404) {
          errorMessage = "Book not found. Please refresh the page and try again.";
        } else if (response.status === 400) {
          errorMessage = errorMessage || "Invalid request. Please check the book ID and try again.";
        }
        
        throw new Error(errorMessage);
      }

      await fetchBookById(bookId);
      await fetchCurrentUserBooks();
    } catch (error: any) {
      console.error("Unable to update reading status:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchCurrentUserBooks();
  }, []);

  return (
    <BookContext.Provider
      value={{
        books,
        selectedBook,
        loadingDetails,
        fetchBookById,
        fetchCurrentUserBooks,
        fetchAllBooks,
        addBook,
        updateBook,
        deleteBook,
        updateReadingStatus,
        getBookStatus,
      }}
    >
      {children}
    </BookContext.Provider>
  );
};

export const useBookContext = () => {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error("useBookContext must be used within a BookProvider");
  }
  return context;
};
