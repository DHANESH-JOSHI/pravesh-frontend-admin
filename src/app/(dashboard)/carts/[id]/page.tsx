"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, User, Package, DollarSign } from "lucide-react";
import { Link } from "next-view-transitions"
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cartService } from "@/services/cart.service";
import { Cart } from "@/types/cart";
import { Brand, Category, Product, User as UserType } from "@/types";
import Image from "next/image";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

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
      <div className="flex flex-1 flex-col gap-6 sm:max-w-6xl mx-auto w-full p-4">
        <div className="animate-pulse">
          <div className="h-8 rounded w-1/4 mb-4"></div>
          <div className="h-64 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !cart) {
    return (
      <div className="flex flex-1 flex-col gap-6 sm:max-w-6xl mx-auto w-full p-4">
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

  const user = (cart.user as Partial<UserType>) || {};
  const totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="flex flex-1 flex-col gap-6 sm:max-w-6xl mx-auto w-full p-4">
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
            <CardTitle className="text-sm font-medium">Wallet</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(user.wallet?.balance ?? 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">balance</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cart Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thumbnail</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Category</TableHead>
                {/*<TableHead className="text-right">Final Price</TableHead>*/}
                <TableHead className="text-right">Unit</TableHead>
                <TableHead className="text-right">Qty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cart.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="p-6 text-center">
                    No items in cart
                  </TableCell>
                </TableRow>
              ) : (
                cart.items.map((item, idx) => {
                  const product = item.product as Partial<Product> | null | undefined;
                  if (!product) {
                    // Handle deleted/missing product
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
                        <TableCell className="text-right">{item.unit || 'N/A'}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                      </TableRow>
                    );
                  }
                  const brand = product.brand as Partial<Brand> | undefined;
                  const category = product.category as Partial<Category> | undefined;
                  return (
                    <TableRow key={idx}>
                      <TableCell>
                        {product.thumbnail ? (
                          <Image src={product.thumbnail} alt={product.name || "thumb"} width={24} height={24} className="rounded object-cover" />
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
                      {/*<TableCell className="text-right text-muted-foreground">₹{(product.finalPrice ?? 0).toFixed(2)}</TableCell>*/}
                      <TableCell className="text-right">{item.unit || 'N/A'}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cart Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 justify-between items-center">
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