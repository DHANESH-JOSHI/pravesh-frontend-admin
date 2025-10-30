"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Package, DollarSign, MapPin, Clock, UserIcon, Edit } from "lucide-react";
import { Link, useTransitionRouter } from "next-view-transitions"
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { orderService } from "@/services/order.service";
import { Product, Address, User, Brand, Category, OrderStatus, AdminUpdateOrder, ApiResponse, Order } from "@/types";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { OrderFormDialog } from "@/components/dashboard/order/form-dialog";
import { useState } from "react";
import Loader from "@/components/ui/loader";


export default function OrderDetailPage() {
  const router = useTransitionRouter()
  const params = useParams();
  const orderId = params.id as string;
  const queryClient = useQueryClient();
  const [open, setOpen] = useState<boolean>(false);
  const { data, isLoading, error } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => await orderService.getById(orderId),
    enabled: !!orderId,
  });


  const order = data?.data;

  const { mutate: updateStatus } = useMutation({
    mutationFn: (status: OrderStatus) => orderService.updateOrderStatus(orderId, status),
    onSuccess: (_, status) => {
      queryClient.cancelQueries({ queryKey: ["order", orderId] });
      queryClient.setQueryData(["order", orderId], (oldData: ApiResponse<Order>) => {
        return {
          ...oldData,
          data: {
            ...oldData.data,
            status,
          },
        };
      })
      toast.success("Order status updated successfully");
    },
    onError: () => {
      toast.error("Failed to update order status");
    }
  })

  const updatemutation = useMutation({
    mutationFn: async (values: AdminUpdateOrder) => {
      if (!order) return;
      const data = await orderService.updateOrder(order._id, values);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Order updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setOpen(false);
    },
    onError: () => {
      toast.error("Failed to update order. Please try again.");
    },
  });

  if (isLoading) {
    return <Loader />;
  }

  if (error || !order) {
    return (
      <div className="flex flex-1 flex-col gap-6 sm:max-w-6xl mx-auto w-full p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Order not found</h1>
          <p className="text-muted-foreground">The order you're looking for doesn't exist.</p>
          <Link href="/orders">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const shippingAddress = order.shippingAddress as Partial<Address>;
  const totalItems = order.items.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = order.items.reduce((acc, item) => {
    return acc + (item.price || 0) * item.quantity;
  }, 0);
  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing": return "bg-yellow-100 text-yellow-800";
      case "shipped": return "bg-blue-100 text-blue-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "awaiting_confirmation": return "bg-orange-100 text-orange-800";
      case "awaiting_payment": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 sm:max-w-6xl mx-auto w-full p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()} >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold">{order._id}</h1>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User</CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(order.user as User).name}</div>
            <p className="text-xs text-muted-foreground">{(order.user as User).email || "N/A"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">{order.items.length} unique products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(order.user as User).wallet?.balance?.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">balance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Select
              value={order.status}
              onValueChange={(v) => updateStatus(v as OrderStatus)}
            >
              <SelectTrigger className="w-full">
                <SelectValue className={getStatusColor(order.status)} placeholder={`${order.status}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="processing"><Badge className={getStatusColor("processing")}>Processing</Badge></SelectItem>
                <SelectItem value="shipped"><Badge className={getStatusColor("shipped")}>Shipped</Badge></SelectItem>
                <SelectItem value="delivered"><Badge className={getStatusColor("delivered")}>Delivered</Badge></SelectItem>
                <SelectItem value="cancelled"><Badge className={getStatusColor("cancelled")}>Cancelled</Badge></SelectItem>
                <SelectItem value="awaiting_confirmation"><Badge className={getStatusColor("awaiting_confirmation")}>Awaiting Confirmation</Badge></SelectItem>
                <SelectItem value="awaiting_payment"><Badge className={getStatusColor("awaiting_payment")}>Awaiting Payment</Badge></SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thumbnail</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Original</TableHead>
                <TableHead className="text-right">Final</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Line Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="p-6 text-center">
                    No items in order
                  </TableCell>
                </TableRow>
              ) : (
                order.items.map((item, idx) => {
                  const product = item.product as Partial<Product>;
                  const brand = product.brand as Partial<Brand>;
                  const category = product.category as Partial<Category>;
                  const lineTotal = (item.price ?? 0) * item.quantity;
                  return (
                    <TableRow key={idx}>
                      <TableCell>
                        {product.thumbnail ? (
                          <Image src={product.thumbnail} alt={product.name || "thumb"} width={40} height={40} className="rounded-md object-cover" />
                        ) : (
                          <div className="w-14 h-14 rounded-md flex items-center justify-center">
                            <Package className="h-6 w-6" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Link className="hover:underline" href={`/products/${product._id}`}>{product.name || "N/A"}</Link>
                      </TableCell>
                      <TableCell>
                        <Link className="hover:underline" href={`/brands/${brand._id}`}>{brand.name || "N/A"}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link className="hover:underline" href={`/categories/${category._id}`}>{category.title || "N/A"}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">₹{(product.originalPrice ?? 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">₹{(product.finalPrice ?? 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{lineTotal.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          <Separator className="my-4" />
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-lg font-bold">₹{totalAmount.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {
        order.isCustomOrder && (
          <Card>
            <CardHeader>
              <CardTitle>Custom Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              {order.image && (
                <div className="mb-4">
                  <img src={order.image} alt="Custom order image" className="max-w-full h-auto rounded-md" />
                </div>
              )}
              {order.feedback && (
                <div>
                  <label className="text-sm font-medium">Feedback</label>
                  <p className="text-sm text-muted-foreground">{order.feedback}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )
      }
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Order ID</label>
                <p className="font-mono text-sm">{order._id}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Created At</label>
                <p className="text-sm">{order.createdAt}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Updated At</label>
                <p className="text-sm">{order.updatedAt}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Custom Order</label>
                <p className="text-sm">{order.isCustomOrder ? "Yes" : "No"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-2">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {shippingAddress.line1}{shippingAddress.line2 ? `, ${shippingAddress.line2}` : ""}, {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
                </p>
                <p className="text-sm text-muted-foreground">{shippingAddress.country}</p>
                <p className="text-sm text-muted-foreground">{shippingAddress.phone}</p>
                <p className="font-medium">{shippingAddress.fullname || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <OrderFormDialog
        isLoading={updatemutation.isPending}
        open={!!open}
        onOpenChange={setOpen}
        onSubmit={(data) => updatemutation.mutate(data)}
        initialData={order}
      />
    </div >
  );
}