import type Book from "@/Interfaces/book";
import type { UserSummary } from "@/Interfaces/user";

export enum ExchangeStatus {
  REQUESTED = "REQUESTED",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  RETURNED = "RETURNED",
}

export interface Exchange {
  id: number;
  status: ExchangeStatus;
  book?: Book;
  borrower?: UserSummary;
  exchangeDate?: string;
  createdAt?: string;
  updatedAt?: string;
}




