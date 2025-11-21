"use client";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Phone, User, Calendar, Package, Eye, MoreHorizontal } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PaginationControls } from "@/components/dashboard/common/pagination-controls";
import { addressService } from "@/services/address.service";
import { Order } from "@/types/order";
import { Link, useTransitionRouter } from "next-view-transitions";
import Loader from "@/components/ui/loader";

export default function AddressDetailPage() {
  const router = useTransitionRouter()
  const params = useParams();
  const addressId = params.id as string;

  const [ordersPage, setOrdersPage] = useState(1);
  const itemsPerPage = 8;

  const { data, isLoading, error } = useQuery({
    queryKey: ["address", addressId],
    queryFn: async () => await addressService.getById(addressId),
    enabled: !!addressId,
  });

  const address = data?.data;
  const user = typeof address?.user === 'object' ? address.user : null;
  const orders = address?.orders || [];
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const paginatedOrders = orders.slice((ordersPage - 1) * itemsPerPage, ordersPage * itemsPerPage);

  if (isLoading) {
    return <Loader/>
  }

  if (error || !address) {
    return (
      <div className="flex flex-1 flex-col gap-6 sm:max-w-6xl mx-auto w-full p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Address not found</h1>
          <p className="text-muted-foreground">The address you're looking for doesn't exist.</p>
          <Link href="/addresses">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Addresses
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 sm:max-w-6xl mx-auto w-full p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()} >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold">{address._id}</h1>
        </div>
        <Badge variant={address.isDeleted ? "destructive" : "secondary"}>
          {address.isDeleted ? "Deleted" : "Active"}
        </Badge>
      </div>

      {/* Address Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Address Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <p className="text-lg font-semibold">{address.fullname}</p>
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone
                </label>
                <p className="font-mono">{address.phone}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Updated At
                </label>
                <p className="text-sm">{address.updatedAt}</p>
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Created At
                </label>
                <p className="text-sm">{address.createdAt}</p>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Address Information */}
          <div>
            <label className="text-sm font-medium">Address</label>
            <div className="mt-2 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium">{address.line1}</p>
                  {address.line2 && (
                    <p className="text-sm text-muted-foreground">{address.line2}</p>
                  )}
                  {address.landmark && (
                    <p className="text-sm text-muted-foreground">Landmark: {address.landmark}</p>
                  )}
                  <p className="text-sm">
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                  <p className="text-sm">{address.country}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">City:</span>
              <p>{address.city}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">State:</span>
              <p>{address.state}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Postal Code:</span>
              <p className="font-mono">{address.postalCode}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Country:</span>
              <p>{address.country}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Information */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-12 md:gap-20">
                <div>
                  <label className="text-sm font-medium">ID</label>
                  <p className="font-mono text-sm">{user._id || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <p className="text-lg font-semibold">{user.name || "Unknown User"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="font-mono text-sm">{user.email || "N/A"}</p>
                </div>
              </div>
              <Button asChild variant="outline">
                <Link href={`/users/${user._id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View User
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Orders ({orders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Updated Date</TableHead>
                  <TableHead className="w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="p-6 text-center text-muted-foreground">
                      No orders found for this address.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedOrders.map((order: Partial<Order>) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium font-mono">
                        {order._id?.slice(-8) || `ORD-${order._id?.slice(-4)}`}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          order.status === "delivered" ? "default" :
                            order.status === "cancelled" ? "destructive" :
                              "secondary"
                        }>
                          {order.status || "pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {order.createdAt || "N/A"}
                      </TableCell>
                      <TableCell>
                        {order.updatedAt || "N/A"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/orders/${order._id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        {totalPages > 1 && (
          <div className="px-6 pb-4">
            <PaginationControls
              page={ordersPage}
              totalPages={totalPages}
              isFetching={false}
              onPrev={() => setOrdersPage((p) => Math.max(1, p - 1))}
              onNext={() => setOrdersPage((p) => Math.min(totalPages, p + 1))}
              onPageChange={setOrdersPage}
            />
          </div>
        )}
      </Card>
    </div>
  );
}