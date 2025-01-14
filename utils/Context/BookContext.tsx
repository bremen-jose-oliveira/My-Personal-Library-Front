// context/BookContext.tsx
import { fetchCoverImage } from '@/utils/fetchBookData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';

interface Book {
  id: number;
  cover: string | null;
  title: string;
  author: string;
  year: number;
  publisher: string;
  rating: number;
}

interface BookContextProps {
  books: Book[];
  fetchCurrentUserBooks: () => void;
  addBook: (book: Omit<Book, 'id'>) => Promise<void>;
  deleteBook: (id: number) => Promise<void>;
}

const BookContext = createContext<BookContextProps | undefined>(undefined);

export const BookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>([]);

  const fetchCurrentUserBooks = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Token is missing or expired');
      }
  
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/books/my`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch books: ${response.statusText}`);
      }
  
      const data: Book[] = await response.json();
      const booksWithCovers = await Promise.all(
        data.map(async (book) => {
          if (!book.cover) {
            const coverUrl = await fetchCoverImage(book.title, book.author);
            return { ...book, cover: coverUrl };
          }
          return book;
        })
      );
  
      setBooks(booksWithCovers);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };
  

  const fetchBooks = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/books`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',  
          'Authorization': `Bearer ${token}`,  
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }
      const data: Book[] = await response.json();

      const booksWithCovers = await Promise.all(
        data.map(async (book) => {
          if (!book.cover) {
            const coverUrl = await fetchCoverImage(book.title, book.author);
            return { ...book, cover: coverUrl };
          }
          return book;
        })
      );

      setBooks(booksWithCovers);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const addBook = async (book: Omit<Book, 'id'>) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}`,   
        },
        body: JSON.stringify(book),
      });
      if (response.ok) {
        fetchCurrentUserBooks();
      } else {
        console.error('Failed to add book');
      }
    } catch (error) {
      console.error('Error adding book:', error);
    }
  };

  const deleteBook = async (id: number) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/books/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}`,   
        },
      });
      if (response.ok) {
        setBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));
      } else {
        console.error('Failed to delete book');
      }
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  useEffect(() => {
    fetchCurrentUserBooks();
  }, []);

  return (
    <BookContext.Provider value={{ books ,fetchCurrentUserBooks, addBook, deleteBook }}>
      {children}
    </BookContext.Provider>
  );
};

export const useBookContext = () => {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error('useBookContext must be used within a BookProvider');
  }
  return context;
};
