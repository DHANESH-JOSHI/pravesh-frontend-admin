"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Package, MapPin, Clock, UserIcon, Edit, IndianRupee, FileText, Maximize2, X, Download } from "lucide-react";
import { Link, useTransitionRouter } from "next-view-transitions"
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
import { OrderLogsTable } from "@/components/dashboard/logs/logs-table";
import { formatDistanceToNow } from "date-fns";
import { DetailPageHeader } from "@/components/dashboard/common/detail-page-header";


export default function OrderDetailPage() {
  const router = useTransitionRouter()
  const params = useParams();
  const orderId = params.id as string;
  const queryClient = useQueryClient();
  const [open, setOpen] = useState<boolean>(false);
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);

  const handleDownloadImage = async () => {
    if (!order?.image) return;
    
    try {
      const response = await fetch(order.image);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `order-${orderId}-image.${blob.type.split('/')[1] || 'jpg'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Image downloaded successfully");
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

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
      
      const productsTouched = newStatus === 'delivered';
      
      invalidateOrderQueries(queryClient, { 
        orderId, 
        userId,
        touchesProducts: productsTouched,
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
      <div className="flex flex-1 flex-col gap-4 sm:gap-6 sm:max-w-6xl mx-auto w-full p-3 sm:p-4 lg:p-6 min-w-0 overflow-x-hidden min-w-0 overflow-x-hidden">
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
    accepted: "bg-amber-100 text-amber-800",
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
    <div className="flex flex-1 flex-col gap-4 sm:gap-6 sm:max-w-6xl mx-auto w-full p-3 sm:p-4 lg:p-6 min-w-0 overflow-x-hidden min-w-0 overflow-x-hidden">
      <DetailPageHeader
        title={order.orderNumber}
        moduleName="Order"
        actions={
          <Button size="sm" onClick={() => setOpen(true)} disabled={order.status !== 'received'}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                <SelectItem value="accepted"><Badge className={getStatusColor("accepted")}>Accepted</Badge></SelectItem>
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
                <div className="mb-4 relative group">
                  <img src={order.image} alt="Custom order image" className="max-w-full h-auto rounded" />
                  <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="h-7 w-7 sm:h-8 sm:w-8 bg-background/90 hover:bg-background"
                      onClick={() => setIsImageFullscreen(true)}
                      title="View fullscreen"
                    >
                      <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="h-7 w-7 sm:h-8 sm:w-8 bg-background/90 hover:bg-background"
                      onClick={handleDownloadImage}
                      title="Download image"
                    >
                      <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
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
      {logsData?.data?.logs && logsData.data.logs.length > 0 && (
        <OrderLogsTable orderId={orderId} showFilters={true} />
      )}

      <OrderFormDialog
        isLoading={updatemutation.isPending}
        open={!!open}
        onOpenChange={setOpen}
        onSubmit={(data) => updatemutation.mutate(data)}
        initialData={order}
      />

      {/* Fullscreen Image Dialog */}
      {order?.image && (
        <Dialog open={isImageFullscreen} onOpenChange={setIsImageFullscreen}>
          <DialogContent 
            className="max-w-[95vw] max-h-[95vh] w-[95vw] h-[95vh] p-2 sm:p-4 z-[100] sm:max-w-[95vw]"
            showCloseButton={false}
          >
            <DialogTitle className="sr-only">Fullscreen Order Image</DialogTitle>
            <div className="relative w-full h-full flex items-center justify-center">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 h-8 w-8 sm:h-10 sm:w-10 bg-background/80 hover:bg-background"
                onClick={() => setIsImageFullscreen(false)}
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <img
                src={order.image}
                alt="Fullscreen custom order image"
                className="max-w-full max-h-full w-auto h-auto object-contain rounded"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div >
  );
}