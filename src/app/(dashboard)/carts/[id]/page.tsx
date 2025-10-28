"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, User, Package, DollarSign } from "lucide-react";
import {Link} from "next-view-transitions"
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cartService } from "@/services/cart.service";
import { Cart } from "@/types/cart";
import { Product, User as UserType } from "@/types";

export default function CartDetailPage() {
  const params = useParams();
  const cartId = params.id as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ["cart", cartId],
    queryFn: async () => await cartService.getCartById(cartId),
    enabled: !!cartId,
  });

  const cart = data?.data as Cart;

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 sm:max-w-6xl mx-auto w-full space-y-8 p-4">
        <div className="animate-pulse">
          <div className="h-8 rounded w-1/4 mb-4"></div>
          <div className="h-64 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !cart) {
    return (
      <div className="flex flex-1 flex-col gap-4 sm:max-w-6xl mx-auto w-full space-y-8 p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Cart not found</h1>
          <p className="text-muted-foreground">The cart you're looking for doesn't exist.</p>
          <Link href="/carts">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Carts
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const user = cart.user as Partial<UserType>;
  const totalAmount = cart.items.reduce((acc, item) => {
    const product = item.product as Partial<Product>;
    return acc + (product.finalPrice || 0) * item.quantity;
  }, 0);
  const totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="flex flex-1 flex-col gap-4 sm:max-w-6xl mx-auto w-full space-y-8 p-4">
      <Link href="/carts">
        <Button variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Carts
        </Button>
      </Link>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.name || "N/A"}</div>
            <p className="text-xs text-muted-foreground">{user.email || "N/A"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">{cart.items.length} unique products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Estimated total</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cart Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cart.items.map((item, index) => {
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
                        ₹{product.finalPrice?.toFixed(2) || "N/A"} each
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">Qty: {item.quantity}</Badge>
                    <p className="text-sm font-semibold mt-1">
                      ₹{((product.finalPrice || 0) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-lg font-bold">₹{totalAmount.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cart Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Cart ID</label>
              <p className="font-mono text-sm">{cart._id}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Created At</label>
              <p className="text-sm">{cart.createdAt}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Updated At</label>
              <p className="text-sm">{cart.updatedAt}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}