"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Package, MapPin, Clock, UserIcon, Edit, IndianRupee, FileText } from "lucide-react";
import { Link, useTransitionRouter } from "next-view-transitions"
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { invalidateOrderQueries } from "@/lib/invalidate-queries";
import { orderLogService } from "@/services/order-log.service";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { LogItem } from "@/components/dashboard/logs/log-item";
import { formatDistanceToNow } from "date-fns";


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

  const { data: logsData } = useQuery({
    queryKey: ["order-logs", orderId],
    queryFn: async () => await orderLogService.getOrderLogs(orderId),
    enabled: !!orderId,
    refetchInterval: () => {
      if (typeof window !== "undefined" && document.visibilityState === "visible") {
        return 5000;
      }
      return false;
    },
  });


  const order = data?.data;

  const { mutate: updateStatus } = useMutation({
    mutationFn: (status: OrderStatus) => orderService.updateOrderStatus(orderId, status),
    onSuccess: ({ message }, newStatus) => {
      queryClient.cancelQueries({ queryKey: ["order", orderId] });
      queryClient.setQueryData(["order", orderId], (oldData: ApiResponse<Order>) => {
        return {
          ...oldData,
          data: {
            ...oldData.data,
            status: newStatus,
          },
        };
      });
      
      const userId = typeof order?.user === 'string' ? order.user : order?.user?._id;
      const oldStatus = order?.status;
      
      const productIds: string[] = [];
      const categoryIds: string[] = [];
      const brandIds: string[] = [];
      
      if (newStatus === 'delivered' && order?.items) {
        order.items.forEach((item) => {
          const product = item.product as Partial<Product> | null | undefined;
          if (!product) return;
          if (product._id) productIds.push(product._id);
          if (product.category) {
            const categoryId = typeof product.category === 'string' ? product.category : product.category._id;
            if (categoryId) categoryIds.push(categoryId);
          }
          if (product.brand) {
            const brandId = typeof product.brand === 'string' ? product.brand : product.brand._id;
            if (brandId) brandIds.push(brandId);
          }
        });
      }
      
      const walletTouched = 
        (oldStatus === 'received' && newStatus === 'confirmed') ||
        (oldStatus === 'approved' && newStatus === 'confirmed') ||
        (oldStatus === 'cancelled' && newStatus === 'refunded');
      
      const productsTouched = newStatus === 'delivered';
      
      invalidateOrderQueries(queryClient, { 
        orderId, 
        userId,
        touchesProducts: productsTouched,
        touchesWallet: walletTouched,
        productIds: productIds.length > 0 ? productIds : undefined,
        categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
        brandIds: brandIds.length > 0 ? brandIds : undefined,
      });
      toast.success(message ?? "Order status updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response.data.message ?? "Failed to update order status");
    }
  })

  const updatemutation = useMutation({
    mutationFn: async (values: AdminUpdateOrder) => {
      const data = await orderService.updateOrder(order?._id!, values);
      return data;
    },
    onSuccess: ({ message }) => {
      toast.success(message ?? "Order updated.");
      invalidateOrderQueries(queryClient, { 
        orderId, 
        userId: typeof order?.user === 'string' ? order.user : order?.user?._id,
        touchesProducts: false,
        touchesWallet: false,
      });
      setOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response.data.message ?? "Failed to update order.");
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

  const shippingAddress = (order.shippingAddress as Partial<Address>) || {};
  const totalItems = order.items.reduce((acc, item) => acc + item.quantity, 0);

  const STATUS_COLORS: Record<string, string> = {
    received: "bg-orange-100 text-orange-800",
    approved: "bg-purple-100 text-purple-800",
    confirmed: "bg-yellow-100 text-yellow-800",
    shipped: "bg-blue-100 text-blue-800",
    out_for_delivery: "bg-indigo-100 text-indigo-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    refunded: "bg-pink-100 text-pink-800",
  };

  const getStatusColor = (status: string) =>
    STATUS_COLORS[status.toLowerCase()] ?? "bg-gray-100 text-gray-800";

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
        <Button size="sm" onClick={() => setOpen(true)} disabled={order.status !== 'received'}>
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
            <div className="text-2xl font-bold">{(order.user as User)?.name || "Unknown User"}</div>
            <p className="text-xs text-muted-foreground">{(order.user as User)?.email || "N/A"}</p>
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
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{((order.user as User)?.wallet?.balance ?? 0).toFixed(2)}</div>
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
                <SelectItem value="received"><Badge className={getStatusColor("received")}>Received</Badge></SelectItem>
                <SelectItem value="approved"><Badge className={getStatusColor("approved")}>Approved</Badge></SelectItem>
                <SelectItem value="confirmed"><Badge className={getStatusColor("confirmed")}>Confirmed</Badge></SelectItem>
                <SelectItem value="cancelled"><Badge className={getStatusColor("cancelled")}>Cancelled</Badge></SelectItem>
                <SelectItem value="shipped"><Badge className={getStatusColor("shipped")}>Shipped</Badge></SelectItem>
                <SelectItem value="out_for_delivery"><Badge className={getStatusColor("out_for_delivery")}>Out for Delivery</Badge></SelectItem>
                <SelectItem value="delivered"><Badge className={getStatusColor("delivered")}>Delivered</Badge></SelectItem>
                <SelectItem value="refunded"><Badge className={getStatusColor("refunded")}>Refunded</Badge></SelectItem>
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
                <TableHead>Variant</TableHead>
                {/*<TableHead className="text-right">Final</TableHead>*/}
                <TableHead className="text-right">Unit</TableHead>
                <TableHead className="text-right">Qty</TableHead>
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
                  const product = item.product as Partial<Product> | null | undefined;
                  if (!product) {
                    return (
                      <TableRow key={idx}>
                        <TableCell>
                          <div className="w-14 h-14 rounded flex items-center justify-center">
                            <Package className="h-6 w-6" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground italic">Product deleted</span>
                        </TableCell>
                        <TableCell>N/A</TableCell>
                        <TableCell>N/A</TableCell>
                        <TableCell>N/A</TableCell>
                        <TableCell className="text-right">
                          {item.unit || 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                      </TableRow>
                    );
                  }
                  const brand = product.brand as Partial<Brand> | undefined;
                  const category = product.category as Partial<Category> | undefined;
                  const variantSelections = item.variantSelections || {};
                  const hasVariants = Object.keys(variantSelections).length > 0;
                  
                  return (
                    <TableRow key={idx}>
                      <TableCell>
                        {product.thumbnail ? (
                          <Image src={product.thumbnail} alt={product.name || "thumb"} width={40} height={40} className="rounded object-cover" />
                        ) : (
                          <div className="w-14 h-14 rounded flex items-center justify-center">
                            <Package className="h-6 w-6" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {product._id ? (
                        <Link className="hover:underline" href={`/products/${product._id}`}>{product.name || "N/A"}</Link>
                        ) : (
                          <span>{product.name || "N/A"}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Link 
                          className="hover:underline" 
                          href={brand?._id ? `/brands/${brand._id}` : "#"}
                          onClick={(e) => {
                            if (!brand?._id) {
                              e.preventDefault();
                            }
                          }}
                        >
                          {brand?.name || "N/A"}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link 
                          className="hover:underline" 
                          href={category?._id ? `/categories/${category._id}` : "#"}
                          onClick={(e) => {
                            if (!category?._id) {
                              e.preventDefault();
                            }
                          }}
                        >
                          {category?.title || "N/A"}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {hasVariants ? (
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(variantSelections).map(([key, value]) => (
                              <Badge key={key} variant="secondary" className="text-xs">
                                {key}: {value}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No variants</span>
                        )}
                      </TableCell>
                      {/*<TableCell className="text-right font-semibold">₹{(product.finalPrice ?? 0).toFixed(2)}
                      </TableCell>*/}
                      <TableCell className="text-right">
                        {item.unit || 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.quantity}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
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
                  <img src={order.image} alt="Custom order image" className="max-w-full h-auto rounded" />
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
                {shippingAddress.line1 ? (
                  <>
                <p className="text-sm text-muted-foreground">
                      {shippingAddress.line1}{shippingAddress.line2 ? `, ${shippingAddress.line2}` : ""}, {shippingAddress.city || ""}, {shippingAddress.state || ""} {shippingAddress.postalCode || ""}
                </p>
                    {shippingAddress.country && <p className="text-sm text-muted-foreground">{shippingAddress.country}</p>}
                    {shippingAddress.phone && <p className="text-sm text-muted-foreground">{shippingAddress.phone}</p>}
                    {shippingAddress.fullname && <p className="font-medium">{shippingAddress.fullname}</p>}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Shipping address not available</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Timeline - Status Changes from Order History */}
      <Card>
        <CardHeader>
          <CardTitle>Order Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            // Use order history instead of logs
            const history = order?.history || [];
            const sortedHistory = [...history].sort(
              (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
            
            const hasHistory = sortedHistory.length > 0;
            const currentStatusInHistory = sortedHistory.some(
              (item) => item.status.toLowerCase() === order.status.toLowerCase()
            );
            
            // Always show at least current status
            if (!hasHistory && order.status) {
              return (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                  <div className="space-y-4">
                    <div className="relative flex items-start gap-4">
                      <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                          <span className="text-xs text-muted-foreground">Current Status</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          No status changes recorded yet
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
            
            return (
              <div className="relative">
                {/* Timeline line */}
                {(hasHistory || !currentStatusInHistory) && (
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                )}
                
                <div className="space-y-4">
                  {sortedHistory.map((item, index) => {
                    const updatedBy = item.updatedBy;
                    const adminName = typeof updatedBy === "object" && updatedBy !== null
                      ? updatedBy.name
                      : updatedBy
                      ? "System"
                      : "System";
                    const adminEmail = typeof updatedBy === "object" && updatedBy !== null
                      ? updatedBy.email
                      : undefined;
                    const isLast = index === sortedHistory.length - 1;
                    const isCurrentStatus = item.status.toLowerCase() === order.status.toLowerCase();
                    const prevItem = index > 0 ? sortedHistory[index - 1] : null;
                    
                    return (
                      <div key={`${item.status}-${item.timestamp}-${index}`} className="relative flex items-start gap-4">
                        {/* Timeline dot */}
                        <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background ${
                          isLast || isCurrentStatus ? "border-primary" : "border-muted"
                        }`}>
                          <div className={`h-2 w-2 rounded-full ${
                            isLast || isCurrentStatus ? "bg-primary" : "bg-muted-foreground"
                          }`} />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 pb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getStatusColor(item.status)}>
                              {item.status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                            {prevItem && (
                              <>
                                <span className="text-xs text-muted-foreground">from</span>
                                <Badge variant="outline" className="text-xs">
                                  {prevItem.status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                                </Badge>
                              </>
                            )}
                            {isCurrentStatus && (
                              <span className="text-xs text-muted-foreground">(Current)</span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                            <div className="flex items-center gap-1">
                              <UserIcon className="w-3 h-3" />
                              <span className="font-medium">{adminName}</span>
                              {adminEmail && (
                                <span className="text-[10px]">({adminEmail})</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>
                                {formatDistanceToNow(new Date(item.timestamp), {
                                  addSuffix: true,
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Current status (if not in history) */}
                  {!currentStatusInHistory && order.status && (
                    <div className="relative flex items-start gap-4">
                      <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                          <span className="text-xs text-muted-foreground">Current Status</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          Order created with this status
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Order Logs */}
      {logsData?.data && logsData.data.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="w-4 h-4" />
                Order Activity Log
              </CardTitle>
              <Badge variant="outline" className="text-xs">{logsData.data.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="h-[400px] w-full">
              <div className="space-y-1.5 pr-2">
                {logsData.data.map((log) => (
                  <LogItem key={log._id} log={log} currentOrderId={orderId} />
                ))}
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </CardContent>
        </Card>
      )}

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