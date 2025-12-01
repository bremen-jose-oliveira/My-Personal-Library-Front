import type { Exchange } from "@/Interfaces/exchange";
import type { Review } from "@/Interfaces/review";

export default interface Book {
  id: number;
  isbn: string;
  title: string;
  author: string;
  year: number;
  publisher: string;
  cover?: string | null;
  owner?: string;
  ownerUsername?: string;
  readingStatus?: string;
  exchangeStatus?: string;
  reviewCount?: number;
  reviews?: Review[];
  exchanges?: Exchange[];
  createdAt?: string;
  updatedAt?: string;
}