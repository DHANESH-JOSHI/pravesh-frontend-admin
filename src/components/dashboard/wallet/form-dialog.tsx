"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CreditCard, Eye } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Wallet, AddFunds, FormDialogProps, addFundsSchema, User } from "@/types";

interface WalletFormDialogProps extends Omit<FormDialogProps<AddFunds, Wallet>, 'initialData'> {
  wallet?: Wallet | null;
  viewOnly?: boolean;
}

export function WalletFormDialog({
  open,
  onOpenChange,
  onSubmit,
  wallet,
  isLoading,
  viewOnly = false,
}: WalletFormDialogProps) {
  const form = useForm<AddFunds>({
    resolver: zodResolver(addFundsSchema),
    defaultValues: {
      userId: (wallet?.user as User)?._id || "",
      amount: 0,
      description: "",
    },
  });

  if (viewOnly && wallet) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-full min-w-[600px] max-w-4xl mx-auto max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <CreditCard className="h-6 w-6" />
              Wallet Details
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Wallet Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">User ID</label>
                    <p className="font-mono text-sm">{wallet._id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Current Balance</label>
                    <p className="text-2xl font-bold text-green-600">₹{wallet.balance.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created</label>
                    <p className="text-sm">{wallet.createdAt}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                    <p className="text-sm">{wallet.updatedAt}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  {wallet.transactions && wallet.transactions.length > 0 ? (
                    <div className="space-y-3">
                      {wallet.transactions.map((transaction, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant={transaction.amount > 0 ? "default" : "destructive"}>
                                {transaction.amount > 0 ? "+" : ""}₹{Math.abs(transaction.amount).toFixed(2)}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {transaction.description || "Transaction"}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(transaction.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No transactions found</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full min-w-[500px] max-w-lg mx-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="h-6 w-6" />
            Add Funds to Wallet
          </DialogTitle>
        </DialogHeader>

        {wallet && (
          <Card className="mb-4">
            <CardContent className="pt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Current Balance:</span>
                <span className="text-lg font-bold text-green-600">₹{wallet.balance.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 w-full"
          >
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Amount *</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      step="0.01"
                      min="0"
                      placeholder="Enter amount to add..."
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter description (optional)..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Add Funds"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}