import Book from "@/Interfaces/book";
import { fetchCoverImage } from "@/utils/fetchBookData";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useState, useEffect, useContext } from "react";
import { useUserContext } from "@/utils/Context/UserContext";
import { AuthContext } from "@/utils/Context/AuthContext";
import { BookStatus } from "@/Interfaces/userBookStatus";

interface BookContextProps {
  books: Book[];
  selectedBook?: Book | null;
  loadingDetails: boolean;
  fetchBookById: (id: number) => Promise<void>;
  fetchCurrentUserBooks: () => Promise<void>;
  fetchAllBooks: () => Promise<Book[]>;
  addBook: (book: Omit<Book, "id">) => Promise<void>;
  updateBook: (
    id: number,
    book: Partial<Omit<Book, "id" | "owner" | "ownerUsername">>
  ) => Promise<void>;
  deleteBook: (id: number) => Promise<void>;
  updateReadingStatus: (bookId: number, status: BookStatus) => Promise<void>;
  getBookStatus: (bookId: number) => Promise<BookStatus | null>;
}

const BookContext = createContext<BookContextProps | undefined>(undefined);

const getAuthToken = async () => {
  const token = await AsyncStorage.getItem("token");
  return token; // Return null if no token instead of throwing
};

const enrichBookWithCover = async (book: Book) => {
  // If cover exists and is not empty, use it (with HTTPS conversion)
  // Don't reject valid URLs - if it's saved in the DB, it should work!
  if (book.cover && book.cover.trim() !== "" && book.cover !== "null") {
    // Ensure HTTPS for existing covers
    const httpsUrl = book.cover.startsWith("http://")
      ? book.cover.replace("http://", "https://")
      : book.cover;
    console.log(
      `✅ Using existing cover from DB for "${book.title}":`,
      httpsUrl
    );
    return { ...book, cover: httpsUrl };
  }
  // Only fetch cover if truly missing - don't replace valid URLs!
  console.log(`🔄 No cover in DB for "${book.title}", fetching...`);
  try {
    const coverUrl = await fetchCoverImage(book.title, book.author);
    // Ensure we always have a cover - fetchCoverImage should never return null, but double-check
    return {
      ...book,
      cover:
        coverUrl || "https://cdn-icons-png.flaticon.com/512/7340/7340665.png",
    };
  } catch (error) {
    console.error(`Error fetching cover for ${book.title}:`, error);
    // Always return a fallback cover even on error
    return {
      ...book,
      cover: "https://cdn-icons-png.flaticon.com/512/7340/7340665.png",
    };
  }
};

export const BookProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currentUser, refreshCurrentUser } = useUserContext();
  const { isLoggedIn } = useContext(AuthContext);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchBookById = async (id: number) => {
    if (!id) return;
    setLoadingDetails(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        setLoadingDetails(false);
        return; // Silently return if no token
      }
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
      if (!token) return; // Silently return if no token
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/books/my/with-status`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
      if (!token) {
        throw new Error("You must be logged in to add books");
      }
      const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/books`;

      console.log("Adding book to:", apiUrl);
      console.log("Book data:", JSON.stringify(book, null, 2));
      console.log("💾 Saving book with cover URL:", book.cover);

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
        let errorJson: any = null;
        try {
          const errorText = await response.text();
          if (errorText) {
            try {
              errorJson = JSON.parse(errorText);
              errorMessage =
                errorJson.message || errorJson.error || errorMessage;
            } catch {
              errorMessage = errorText || errorMessage;
            }
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
        }

        // Handle duplicate book case (409 Conflict or 400 with duplicate message)
        if (
          response.status === 409 ||
          (response.status === 400 &&
            (errorMessage.toLowerCase().includes("already exists") ||
              errorMessage.toLowerCase().includes("duplicate") ||
              errorMessage.toLowerCase().includes("already added")))
        ) {
          console.log(
            "📚 Book already exists, checking if we need to update missing information..."
          );

          // Try to find the existing book by ISBN to update missing fields
          if (book.isbn && book.isbn !== "N/A") {
            try {
              // Fetch all books to find the one with matching ISBN
              const allBooks = await fetchAllBooks();
              const existingBook = allBooks.find(
                (b) =>
                  b.isbn === book.isbn || b.isbn === book.isbn.replace(/-/g, "")
              );

              if (existingBook) {
                // Build update object with fields that are missing or incomplete in existing book
                const updates: Partial<Book> = {};
                let needsUpdate = false;

                // Check and update cover if missing or is fallback
                const hasNoCover =
                  !existingBook.cover ||
                  existingBook.cover.trim() === "" ||
                  existingBook.cover === "null" ||
                  existingBook.cover.includes("flaticon") ||
                  existingBook.cover.includes("placeholder");

                if (hasNoCover && book.cover && book.cover.trim() !== "") {
                  updates.cover = book.cover;
                  needsUpdate = true;
                  console.log("📸 Will update cover");
                }

                // Check and update author if missing or incomplete
                if (
                  book.author &&
                  book.author.trim() !== "" &&
                  (!existingBook.author ||
                    existingBook.author.trim() === "" ||
                    existingBook.author === "Unknown Author")
                ) {
                  updates.author = book.author;
                  needsUpdate = true;
                  console.log("👤 Will update author");
                }

                // Check and update title if missing or incomplete
                if (
                  book.title &&
                  book.title.trim() !== "" &&
                  (!existingBook.title || existingBook.title.trim() === "")
                ) {
                  updates.title = book.title;
                  needsUpdate = true;
                  console.log("📖 Will update title");
                }

                // Check and update publisher if missing
                if (
                  book.publisher &&
                  book.publisher.trim() !== "" &&
                  (!existingBook.publisher ||
                    existingBook.publisher.trim() === "")
                ) {
                  updates.publisher = book.publisher;
                  needsUpdate = true;
                  console.log("🏢 Will update publisher");
                }

                // Check and update year if missing
                if (
                  book.year &&
                  book.year.toString().trim() !== "" &&
                  (!existingBook.year ||
                    existingBook.year.toString().trim() === "")
                ) {
                  updates.year = book.year;
                  needsUpdate = true;
                  console.log("📅 Will update year");
                }

                if (needsUpdate) {
                  console.log(
                    `🔄 Updating existing book (ID: ${existingBook.id}) with missing information:`,
                    updates
                  );
                  await updateBook(existingBook.id, updates);
                  await fetchCurrentUserBooks();
                  return; // Successfully updated, exit early
                } else {
                  console.log(
                    "✅ Book already exists with complete information, no update needed"
                  );
                  await fetchCurrentUserBooks();
                  return; // Book exists, just refresh the list
                }
              }
            } catch (updateError) {
              console.error("Error updating existing book:", updateError);
              // Fall through to show the duplicate error
            }
          }

          // If we couldn't update, show the duplicate message
          throw new Error(
            errorMessage || "This book already exists in the library."
          );
        }

        if (response.status === 401) {
          errorMessage = "Authentication failed. Please login again.";
        } else if (response.status === 400) {
          errorMessage =
            errorMessage || "Invalid book data. Please check all fields.";
        }

        throw new Error(errorMessage);
      }

      await fetchCurrentUserBooks();
    } catch (error: any) {
      console.error("Error adding book:", error);

      // Provide more specific error messages
      if (
        error.message?.includes("Failed to fetch") ||
        error.message?.includes("NetworkError")
      ) {
        throw new Error(
          "Network error. Please check your connection and ensure the backend is running."
        );
      } else if (error.message) {
        throw error;
      } else {
        throw new Error("Failed to add book. Please try again.");
      }
    }
  };

  const updateBook = async (
    id: number,
    book: Partial<Omit<Book, "id" | "owner" | "ownerUsername">>
  ) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("You must be logged in to update books");
      }
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/books/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(book),
        }
      );

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
      if (!token) {
        throw new Error("You must be logged in to delete books");
      }
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/books/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
      if (!token) return []; // Return empty array if no token
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/books`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
      if (!token) return null; // Return null if no token
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
      if (!token) {
        throw new Error("You must be logged in to update reading status");
      }
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
              errorMessage =
                errorJson.message || errorJson.error || errorMessage;
            } catch {
              errorMessage = errorText || errorMessage;
            }
          }
        }

        if (response.status === 404) {
          errorMessage =
            "Book not found. Please refresh the page and try again.";
        } else if (response.status === 400) {
          errorMessage =
            errorMessage ||
            "Invalid request. Please check the book ID and try again.";
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

  // Fetch books when user logs in, clear when user logs out
  // Use a ref to track previous state and prevent unnecessary updates
  const prevIsLoggedInRef = React.useRef<boolean | undefined>(undefined);
  useEffect(() => {
    // Only act on state changes, not every render
    // Initialize ref on first render
    if (prevIsLoggedInRef.current === undefined) {
      prevIsLoggedInRef.current = isLoggedIn;
      // On first render, if logged in, fetch books
      if (isLoggedIn) {
        console.log(
          "🔄 BookContext: Initial render, user is logged in, fetching books..."
        );
        fetchCurrentUserBooks();
      }
      return;
    }

    if (prevIsLoggedInRef.current === isLoggedIn) {
      return; // No change, skip
    }

    if (isLoggedIn && prevIsLoggedInRef.current === false) {
      // Transitioning from logged out to logged in
      console.log("🔄 BookContext: User is logged in, fetching books...");
      fetchCurrentUserBooks();
    } else if (!isLoggedIn && prevIsLoggedInRef.current === true) {
      // Transitioning from logged in to logged out
      console.log("🔄 BookContext: User is not logged in, clearing books...");
      // Use functional updates to prevent unnecessary re-renders
      setBooks((prev) => {
        if (prev.length > 0) {
          return [];
        }
        return prev;
      });
      setSelectedBook((prev) => {
        if (prev !== null) {
          return null;
        }
        return prev;
      });
    }

    // Update ref after processing
    prevIsLoggedInRef.current = isLoggedIn;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]); // Intentionally omit fetchCurrentUserBooks to prevent loops

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
