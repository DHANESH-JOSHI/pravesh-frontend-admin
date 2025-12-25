"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, User, Mail, Shield, Calendar, MapPin, Package, Star, Eye } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationControls } from "@/components/dashboard/common/pagination-controls";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { userService } from "@/services/user.service";
import { User as UserType } from "@/types/user";
import { Link, useTransitionRouter } from "next-view-transitions";
import Loader from "@/components/ui/loader";
import { OrderLogsTable } from "@/components/dashboard/logs/logs-table";
import { DetailPageHeader } from "@/components/dashboard/common/detail-page-header";

export default function UserDetailPage() {
  const params = useParams();
  const router = useTransitionRouter();
  const userId = params.id as string;

  const [addressesPage, setAddressesPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const [reviewsPage, setReviewsPage] = useState(1);
  const itemsPerPage = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => await userService.getById(userId),
    enabled: !!userId,
  });

  const user = data?.data as UserType;

  if (isLoading) {
    return <Loader />;
  }

  if (error || !user) {
    return (
      <div className="flex flex-1 flex-col gap-4 sm:gap-6 sm:max-w-6xl mx-auto w-full p-3 sm:p-4 lg:p-6 min-w-0 overflow-x-hidden min-w-0 overflow-x-hidden">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">User not found</h1>
          <p className="text-muted-foreground">The user you're looking for doesn't exist.</p>
          <Link href="/users">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-purple-100 text-purple-800";
      case "user": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 sm:max-w-6xl mx-auto w-full p-4">
      <DetailPageHeader
        title={user.name}
        moduleName="User"
        badge={{
          label: user.isDeleted ? "Deleted" : "Active",
          variant: user.isDeleted ? "destructive" : "secondary",
        }}
      />

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <p className="text-lg font-semibold">{user.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </label>
                <p className="font-mono text-sm">{user.email || "N/A"}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Role
                </label>
                <Badge className={getRoleColor(user.role)}>
                  {user.role.toUpperCase()}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium mr-3">Status</label>
                <Badge className={getStatusColor(user.status)}>
                  {user.status.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Account Created
                </label>
                <p className="text-sm">{user.createdAt}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Last Updated</label>
                <p className="text-sm">{user.updatedAt}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Addresses Table */}
      {user.addresses && user.addresses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Addresses ({user.addresses.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded border">
              <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>State</TableHead>
                        <TableHead>Postal Code</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead className="w-16 text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(user.addresses || [])
                        .slice((addressesPage - 1) * itemsPerPage, addressesPage * itemsPerPage)
                        .map((address, index) => (
                          <TableRow key={address._id || index}>
                            <TableCell className="font-medium">
                              {address.fullname || "N/A"}
                            </TableCell>
                            <TableCell>{address.phone || "N/A"}</TableCell>
                            <TableCell>
                              <div className="max-w-xs">
                                <p className="truncate">{address.line1 || "N/A"}</p>
                                {address.line2 && (
                                  <p className="truncate text-sm text-muted-foreground">
                                    {address.line2}
                                  </p>
                                )}
                                {address.landmark && (
                                  <p className="truncate text-sm text-muted-foreground">
                                    Landmark: {address.landmark}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{address.city || "N/A"}</TableCell>
                            <TableCell>{address.state || "N/A"}</TableCell>
                            <TableCell>{address.postalCode || "N/A"}</TableCell>
                            <TableCell>{address.country || "N/A"}</TableCell>
                            <TableCell>
                              <Link href={`/addresses/${address._id}`}>
                                <Button variant="ghost">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          {(user.addresses || []).length > itemsPerPage && (
            <div className="px-6 pb-4">
              <PaginationControls
                total={(user.addresses || []).length}
                limit={itemsPerPage}
                page={addressesPage}
                totalPages={Math.ceil((user.addresses || []).length / itemsPerPage)}
                isFetching={false}
                onPrev={() => setAddressesPage((p) => Math.max(1, p - 1))}
                onNext={() => setAddressesPage((p) => Math.min(Math.ceil((user.addresses || []).length / itemsPerPage), p + 1))}
                onPageChange={setAddressesPage}
              />
            </div>
          )}
        </Card>
      )}

      {/* Orders Table */}
      {user.orders && user.orders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Orders ({user.orders.length})
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Order Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 rounded">
                <p className="text-2xl font-bold text-green-600">
                  {user.orders.filter(order => order.status === "delivered").length}
                </p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded">
                <p className="text-2xl font-bold text-blue-600">
                  {user.orders.filter(order => ["pending", "processing", "shipped"].includes(order.status || "")).length}
                </p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded">
                <p className="text-2xl font-bold text-yellow-600">
                  {user.orders.filter(order => order.status === "cancelled").length}
                </p>
                <p className="text-sm text-muted-foreground">Cancelled</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded">
                <p className="text-2xl font-bold text-gray-600">
                  {user.orders.length}
                </p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>

            <div className="rounded border">
              <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead>Updated Date</TableHead>
                      <TableHead className="w-16 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(user.orders || [])
                      .slice((ordersPage - 1) * itemsPerPage, ordersPage * itemsPerPage)
                      .map((order, index) => (
                        <TableRow key={order._id || index}>
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
                            <Link href={`/orders/${order._id}`}>
                              <Button variant="ghost">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
          </CardContent>
          {(user.orders || []).length > itemsPerPage && (
            <div className="px-6 pb-6">
              <PaginationControls
                total={(user.orders || []).length}
                limit={itemsPerPage}
                page={ordersPage}
                totalPages={Math.ceil((user.orders || []).length / itemsPerPage)}
                isFetching={false}
                onPrev={() => setOrdersPage((p) => Math.max(1, p - 1))}
                onNext={() => setOrdersPage((p) => Math.min(Math.ceil((user.orders || []).length / itemsPerPage), p + 1))}
                onPageChange={setOrdersPage}
              />
            </div>
          )}
        </Card>
      )}

      {/* Reviews Table */}
      {user.reviews && user.reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Reviews ({user.reviews.length})
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Review Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-yellow-50 rounded">
                <p className="text-2xl font-bold text-yellow-600">
                  {(user.reviews.reduce((acc, review) => acc + (review.rating || 0), 0) / user.reviews.length).toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground">Average Rating</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded">
                <p className="text-2xl font-bold text-blue-600">
                  {user.reviews.length}
                </p>
                <p className="text-sm text-muted-foreground">Total Reviews</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded">
                <p className="text-2xl font-bold text-green-600">
                  {user.reviews.filter(review => review.rating && review.rating >= 4).length}
                </p>
                <p className="text-sm text-muted-foreground">Positive Reviews</p>
              </div>
            </div>

            <div className="mt-6 -mx-6 px-6">
              <div className="rounded border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rating</TableHead>
                      <TableHead>Comment</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead className="w-16 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(user.reviews || [])
                      .slice((reviewsPage - 1) * itemsPerPage, reviewsPage * itemsPerPage)
                      .map((review, index) => (
                        <TableRow key={review._id || index}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${i < (review.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                  />
                                ))}
                              </div>
                              <span className="font-medium">{review.rating}/5</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <p className="truncate">
                                {review.comment || "No comment"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <p className="truncate font-medium">
                                {typeof review.product === 'object' && review.product?.name
                                  ? review.product.name
                                  : "Product"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {review.createdAt || "N/A"}
                          </TableCell>
                          <TableCell>
                            <Link href={`/reviews/${review._id}`}>
                              <Button variant="ghost">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            {(user.reviews || []).length > itemsPerPage && (
              <div className="px-6 pb-6">
                <PaginationControls
                  total={(user.reviews || []).length}
                  limit={itemsPerPage}
                  page={reviewsPage}
                  totalPages={Math.ceil((user.reviews || []).length / itemsPerPage)}
                  isFetching={false}
                  onPrev={() => setReviewsPage((p) => Math.max(1, p - 1))}
                  onNext={() => setReviewsPage((p) => Math.min(Math.ceil((user.reviews || []).length / itemsPerPage), p + 1))}
                  onPageChange={setReviewsPage}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Staff Recent Logs */}
      {user.role === "staff" && (
        <OrderLogsTable staffId={user._id} showFilters={true} />
      )}

      {/* No Relations Message */}
      {(!user.addresses || user.addresses.length === 0) && (!user.orders || user.orders.length === 0) && (!user.reviews || user.reviews.length === 0) && user.role !== "staff" && (
        <Card>
          <CardHeader>
            <CardTitle>Related Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              No related data (addresses, orders, reviews) found for this user.
            </p>
          </CardContent>
        </Card>
      )}


    </div>
  );
}