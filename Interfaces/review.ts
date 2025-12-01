import type { UserSummary } from "@/Interfaces/user";

export interface Review {
  id: number;
  rating: number;
  comment: string;
  bookId?: number;
  createdAt?: string;
  updatedAt?: string;
  user?: UserSummary;
}

export interface ReviewRequest {
  bookId: number;
  rating: number;
  comment: string;
}




