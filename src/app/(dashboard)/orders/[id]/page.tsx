"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Package, DollarSign, MapPin, Clock, UserIcon } from "lucide-react";
import {Link} from "next-view-transitions"
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { orderService } from "@/services/order.service";
import { OrderItem } from "@/types/order";
import { Product, Address, User } from "@/types";

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => await orderService.getById(orderId),
    enabled: !!orderId,
  });

  const order = data?.data;

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 sm:max-w-6xl mx-auto w-full space-y-8 p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-1 flex-col gap-4 sm:max-w-6xl mx-auto w-full space-y-8 p-4">
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
    <div className="flex flex-1 flex-col gap-4 sm:max-w-6xl mx-auto w-full space-y-8 p-4">
      <Link href="/orders">
        <Button variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User</CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(order.user as User).name}</div>
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
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{order.totalAmount.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(order.status)}>
              {order.status.replace("_", " ").toUpperCase()}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items.map((item: OrderItem, index) => {
                const product = item.product as Partial<Product>;
                return (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{product.name || "Unknown Product"}</h3>
                        <p className="text-sm text-muted-foreground">
                          ₹{item.price.toFixed(2)} each
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">Qty: {item.quantity}</Badge>
                      <p className="text-sm font-semibold mt-1">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-lg font-bold">₹{order.totalAmount.toFixed(2)}</span>
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
              <div>
                <p className="font-medium">{shippingAddress.fullname || "N/A"}</p>
                <p className="text-sm text-muted-foreground">
                  {shippingAddress.line1}{shippingAddress.line2 ? `, ${shippingAddress.line2}` : ""}, {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
                </p>
                <p className="text-sm text-muted-foreground">{shippingAddress.country}</p>
                <p className="text-sm text-muted-foreground">{shippingAddress.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {order.isCustomOrder && (
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
      )}

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
    </div>
  );
}