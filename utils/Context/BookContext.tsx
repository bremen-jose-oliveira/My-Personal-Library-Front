
import Book from '@/Interfaces/book';
import { fetchCoverImage } from '@/utils/fetchBookData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from 'expo-router';
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Platform } from 'react-native';



interface BookContextProps {
  books: Book[];
  bookData: Book[];
  fetchCurrentUserBooksById: (id: number) => Promise<void>;
  fetchCurrentUserBooks: () => void;
  addBook: (book: Omit<Book, 'id'>) => Promise<void>;
  deleteBook: (id: number) => Promise<void>;
}

const BookContext = createContext<BookContextProps | undefined>(undefined);

export const BookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [bookData, setBookData] = useState<Book[]>([]);



  const fetchCurrentUserBooksById = async (id: number) => {
    try {
      console.log('Fetching book with ID:', id);
  
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Token is missing or expired');
      }
  
      const url = `${process.env.EXPO_PUBLIC_API_URL}/api/books/details/${id}`;
      console.log('Fetching from URL:', url);
  
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch book: ${response.status} ${response.statusText}`);
      }
  
      const book = await response.json();
      console.log('Book received:', book);
  
      if (!book || typeof book !== 'object' || !book.id) {
        console.warn('Invalid book data received.');
        setBookData([]); // clear state if bad response
        return;
      }
  
      const cover = book.cover ? book.cover : await fetchCoverImage(book.title, book.author);
      const bookWithCover = { ...book, cover };
  
      setBookData([bookWithCover]); // wrap in array for FlatList
    } catch (error) {
      console.error('Error fetching book by ID:', error);
    }
  };
  
  
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
  



  const addBook = async (book: Omit<Book, 'id'>) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Token is missing or expired');
      }
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
    if (!token) {
      throw new Error('Token is missing or expired');
    }

    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/books/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const responseText = await response.text();
    console.log(`Response status: ${response.status}`);
    console.log(`Response text: ${responseText}`);

    if (response.ok) {
  
      setBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));
    } else {
      console.error(`Failed to delete book: ${responseText}`);
    }
  } catch (error) {
    console.error('Error deleting book:', error);
  }
};

if (Platform.OS === 'web') {
  useEffect(() => {
    fetchCurrentUserBooks();
  }, []);
}

  return (
    <BookContext.Provider value={{ bookData ,books , fetchCurrentUserBooksById,fetchCurrentUserBooks, addBook, deleteBook }}>
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
