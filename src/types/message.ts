import { PaginatedData } from ".";

export type Message = {
  _id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: "open" | "resolved";
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export interface MessagesQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: "open" | "resolved";
}

export interface PaginatedMessages extends PaginatedData {
  messages: Message[];
}

