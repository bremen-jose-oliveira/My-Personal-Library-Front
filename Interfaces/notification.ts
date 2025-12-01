export enum NotificationType {
  FRIEND_REQUEST = "FRIEND_REQUEST",
  FRIEND_REQUEST_ACCEPTED = "FRIEND_REQUEST_ACCEPTED",
  EXCHANGE_REQUEST = "EXCHANGE_REQUEST",
  EXCHANGE_ACCEPTED = "EXCHANGE_ACCEPTED",
  EXCHANGE_REJECTED = "EXCHANGE_REJECTED",
  EXCHANGE_RETURNED = "EXCHANGE_RETURNED",
  REVIEW_ADDED = "REVIEW_ADDED",
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt?: string;
  relatedId?: number; // ID of related entity (friend request ID, exchange ID, review ID, etc.)
  relatedEmail?: string; // Email of related user
  relatedBookId?: number; // Book ID if related to a book
}

