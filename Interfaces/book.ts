import { ReactNode } from "react";

export default  interface Book {
    owner: ReactNode;
    exchangeStatus: ReactNode;
    exchanges: ReactNode;
    reviews: ReactNode;
    reviewCount: ReactNode;
    createdAt: ReactNode;
    updatedAt: ReactNode;
    readingStatus: ReactNode;
    status: any;
    id: number;
    cover: string | null;
    title: string;
    author: string;
    year: number;
    publisher: string;
    rating: number;
    isbn: string;
  }

  