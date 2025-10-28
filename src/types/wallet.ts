import { z } from "zod";
import { User } from "./user";
import { PaginatedData } from ".";

export const transactionTypeEnum = z.enum(["credit", "debit"]);
export type TransactionType = z.infer<typeof transactionTypeEnum>;

type WalletTransaction = {
  amount: number;
  description: string;
  createdAt: Date;
};

export type Wallet = {
  _id: string;
  user: string | Partial<User>;
  balance: number;
  transactions: WalletTransaction[];
  createdAt: string;
  updatedAt: string;
};

export const addFundsSchema = z.object({
  userId: z.string(),
  amount: z.number().positive(),
  description: z.string().optional(),
});

export type AddFunds = z.infer<typeof addFundsSchema>;

export type WalletQueryOptions = {
  user?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedWallets extends PaginatedData {
  wallets: Wallet[];
}
