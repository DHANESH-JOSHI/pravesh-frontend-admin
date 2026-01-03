"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  type User,
  type Register,
  registerSchema,
} from "@/types/user";
import { FormDialogProps } from "@/types";
import { useEffect } from "react";

export function UserFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: FormDialogProps<Register, User>) {
  const form = useForm<Register>({
    resolver: zodResolver(
      registerSchema,
    ),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      role: "user" as const,
    },
  });
  useEffect(() => {
    if (open) {
      form.reset({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "user" as const,
      })
    }

  }, [open, form])
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Create User
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 w-full"
          >
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormLabel>Role :</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "text-sm font-medium transition-colors",
                        field.value === "user" ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"
                      )}>
                        User
                      </span>
                      <Switch
                        checked={field.value === "staff"}
                        onCheckedChange={(checked) => {
                          field.onChange(checked ? "staff" : "user");
                        }}
                        className={cn(
                          "data-[state=checked]:bg-purple-600 data-[state=unchecked]:bg-blue-500",
                          "dark:data-[state=checked]:bg-purple-500 dark:data-[state=unchecked]:bg-blue-400"
                        )}
                      />
                      <span className={cn(
                        "text-sm font-medium transition-colors",
                        field.value === "staff" ? "text-purple-600 dark:text-purple-400" : "text-muted-foreground"
                      )}>
                        Staff
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter user name..."
                      {...field}
                      autoComplete="name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Phone *</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="Enter phone number..."
                      {...field}
                      autoComplete="tel"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter email..."
                      {...field}
                      autoComplete="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Password *</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter password..."
                      {...field}
                      autoComplete="new-password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* <FormField
              control={form.control}
              name="img"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter avatar url..."
                      {...field}
                    />
                  </FormControl>
                  {form.watch("img") && (
                    <Card className="relative border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                      <CardContent className="p-6">
                        <div className="relative">
                          <img
                            src={
                              form.watch("img") ||
                              "/placeholder.svg"
                            }
                            alt="Image"
                            width={100}
                            height={100}
                            className="w-full h-40 object-cover rounded"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() =>
                              form.setValue("img", "")
                            }
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" >
                {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
