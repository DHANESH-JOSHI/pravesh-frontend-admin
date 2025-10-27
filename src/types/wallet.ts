import { z } from "zod";

/* -----------------------------
   ENUM: TransactionType
----------------------------- */
export const transactionTypeEnum = z.enum(["credit", "debit"]);
export type TransactionType = z.infer<typeof transactionTypeEnum>;

/* -----------------------------
   SCHEMA: WalletTransaction
----------------------------- */
export const walletTransactionSchema = z.object({
  amount: z.number().positive(),
  description: z.string().optional(),
  createdAt: z.string(),
});

export type WalletTransaction = z.infer<typeof walletTransactionSchema>;

/* -----------------------------
   SCHEMA: Wallet
----------------------------- */
export const walletSchema = z.object({
  _id: z.string(),
  user: z.string(),
  balance: z.number().nonnegative(),
  transactions: z.array(walletTransactionSchema).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Wallet = z.infer<typeof walletSchema>;

/* -----------------------------
   SCHEMA: AddFunds
----------------------------- */
export const addFundsSchema = z.object({
  userId: z.string(),
  amount: z.number().positive(),
  description: z.string().optional(),
});

export type AddFunds = z.infer<typeof addFundsSchema>;
