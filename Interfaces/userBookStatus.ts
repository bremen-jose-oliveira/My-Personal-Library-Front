import type Book from "@/Interfaces/book";
import type { UserSummary } from "@/Interfaces/user";

export enum BookStatus {
  NOT_READ = "NOT_READ",
  READING = "READING",
  READ = "READ",
}

export interface UserBookStatus {
  id: number;
  status: BookStatus;
  visibility?: string;
  book?: Book;
  user?: UserSummary;
  createdAt?: string;
  updatedAt?: string;
}




