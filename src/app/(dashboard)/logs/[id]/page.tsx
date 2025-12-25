"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { orderLogService } from "@/services/order-log.service";
import { productService } from "@/services/product.service";
import { DetailPageHeader } from "@/components/dashboard/common/detail-page-header";
import { formatDistanceToNow } from "date-fns";
import { Link } from "next-view-transitions";
import { CheckCircle, Package, Edit, Eye, List, FileText, Clock, User, ArrowLeft, ExternalLink } from "lucide-react";
import Loader from "@/components/ui/loader";
import { Separator } from "@/components/ui/separator";
import React from "react";

// Component to display product with name and link
function ProductDisplay({ productId }: { productId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => await productService.getById(productId),
    enabled: !!productId && productId !== "N/A",
  });

  const product = data?.data;

  if (isLoading) {
    return <span className="text-muted-foreground">Loading product...</span>;
  }

  if (!product) {
    return (
      <span className="text-muted-foreground">
        Product ID: {productId.substring(0, 8)}...
      </span>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
      <span className="font-semibold text-base">{product.name || "Unknown Product"}</span>
      <Link
        href={`/products/${productId}`}
        className="inline-flex items-center gap-1 text-primary hover:underline text-sm font-medium whitespace-nowrap"
        onClick={(e) => e.stopPropagation()}
      >
        <ExternalLink className="h-4 w-4" />
        View Product
      </Link>
    </div>
  );
}

export default function LogDetailPage() {
  const params = useParams();
  const logId = params.id as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ["order-log", logId],
    queryFn: async () => await orderLogService.getById(logId),
    enabled: !!logId,
  });

  const log = data?.data;

  if (isLoading) {
    return <Loader />;
  }

  if (error || !log) {
    return (
      <div className="flex flex-1 flex-col gap-4 sm:gap-6 sm:max-w-6xl mx-auto w-full p-3 sm:p-4 lg:p-6 min-w-0 overflow-x-hidden">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Log not found</h1>
          <p className="text-muted-foreground">The log you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const getActionIcon = (action: string, field?: string) => {
    switch (action) {
      case "update":
        if (field === "status") return CheckCircle;
        if (field === "items") return Package;
        if (field === "feedback") return Edit;
        return Edit;
      case "view":
        return Eye;
      case "list":
        return List;
      default:
        return FileText;
    }
  };

  const getActionColor = (action: string, field?: string) => {
    switch (action) {
      case "update":
        if (field === "status") return "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300";
        if (field === "items") return "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300";
        if (field === "feedback") return "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300";
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
      case "view":
        return "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";
      case "list":
        return "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const renderFormattedValue = (value: any, field?: string): React.ReactNode => {
    if (value === null || value === undefined) return <span className="text-muted-foreground">—</span>;
    
    // Format order items array in a user-friendly way
    if (field === "items" && Array.isArray(value)) {
      if (value.length === 0) return <span className="text-muted-foreground">No items</span>;
      
      return (
        <div className="space-y-3">
          {value.map((item: any, index: number) => (
            <div key={index} className="p-3 bg-background/50 rounded-md border">
              <div className="font-semibold text-base mb-2">Item {index + 1}</div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground font-medium">Product: </span>
                  {item.product ? (
                    <ProductDisplay productId={String(item.product)} />
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                </div>
                <div className="text-muted-foreground">
                  <span className="font-medium">Quantity: </span>
                  <span className="font-semibold text-foreground text-base">{item.quantity || 0}</span> {item.unit || ""}
                </div>
                {item.variantSelections && Object.keys(item.variantSelections).length > 0 && (
                  <div className="text-muted-foreground">
                    <span className="font-medium">Variants: </span>
                    {Object.entries(item.variantSelections).map(([key, val], idx) => (
                      <span key={key} className="inline-block mr-2">
                        <span className="font-semibold capitalize">{key}</span>: <span className="text-foreground font-medium">{String(val)}</span>
                        {idx < Object.entries(item.variantSelections).length - 1 && ","}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    // Format status values
    if (field === "status") {
      return <span className="font-semibold text-base">{String(value).replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</span>;
    }
    
    // Format feedback
    if (field === "feedback") {
      return <span className="whitespace-pre-wrap text-sm">{value || "—"}</span>;
    }
    
    // For arrays, format as list
    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="text-muted-foreground">—</span>;
      return (
        <div className="space-y-1">
          {value.map((item, idx) => (
            <div key={idx} className="text-xs">• {JSON.stringify(item)}</div>
          ))}
        </div>
      );
    }
    
    // For objects, format nicely
    if (typeof value === "object") {
      return <pre className="text-xs whitespace-pre-wrap break-words">{JSON.stringify(value, null, 2)}</pre>;
    }
    
    // For strings and numbers
    if (typeof value === "string") return <span className="whitespace-pre-wrap">{value}</span>;
    if (typeof value === "number") return <span>{String(value)}</span>;
    return <span>{String(value)}</span>;
  };

  const ActionIcon = getActionIcon(log.action, log.field);
  const admin = typeof log.admin === "object" ? log.admin : null;
  const order = typeof log.order === "object" ? log.order : null;
  const orderIdValue = typeof log.order === "object" ? log.order?._id : log.order;

  return (
    <div className="flex flex-1 flex-col gap-4 sm:gap-6 sm:max-w-6xl mx-auto w-full p-3 sm:p-4 lg:p-6 min-w-0 overflow-x-hidden">
      <DetailPageHeader
        title={`Log ${log._id.substring(0, 8)}`}
        moduleName="Log"
        backUrl="/logs"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Action Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className={`p-2 rounded-md ${getActionColor(log.action, log.field)}`}>
                  <ActionIcon className="w-5 h-5" />
                </div>
                Action Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Action</label>
                  <p className="text-lg font-semibold capitalize">
                    {log.action.replace(/_/g, " ")}
                  </p>
                </div>
                {log.field && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Field</label>
                    <div className="text-lg font-semibold mt-1">
                      <Badge variant="outline">{log.field}</Badge>
                    </div>
                  </div>
                )}
              </div>
              <Separator />
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-sm mt-1">{log.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Value Changes */}
          {(log.oldValue !== undefined || log.newValue !== undefined) && (
            <Card>
              <CardHeader>
                <CardTitle>Changes Made</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col min-w-0">
                    <label className="text-base font-semibold text-muted-foreground mb-3 block">Before</label>
                    <div className="p-4 rounded-md bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 min-h-[80px] flex-1 overflow-x-auto">
                      <div className="text-base text-red-700 dark:text-red-300">
                        {renderFormattedValue(log.oldValue, log.field)}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <label className="text-base font-semibold text-muted-foreground mb-3 block">After</label>
                    <div className="p-4 rounded-md bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 min-h-[80px] flex-1 overflow-x-auto">
                      <div className="text-base text-green-700 dark:text-green-300">
                        {renderFormattedValue(log.newValue, log.field)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {log.metadata.cached !== undefined && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Data Source</label>
                    <p className="text-sm mt-1">
                      {log.metadata.cached ? (
                        <span className="text-amber-600 dark:text-amber-400">Retrieved from cache</span>
                      ) : (
                        <span className="text-blue-600 dark:text-blue-400">Fetched from database</span>
                      )}
                    </p>
                  </div>
                )}
                {log.metadata.query && Object.keys(log.metadata.query).length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Filters Applied</label>
                    <div className="mt-2 space-y-1">
                      {log.metadata.query.status && (
                        <div className="text-sm">
                          <span className="font-medium">Status:</span>{" "}
                          <Badge variant="outline" className="ml-1">
                            {String(log.metadata.query.status).replace(/_/g, " ")}
                          </Badge>
                        </div>
                      )}
                      {log.metadata.query.user && (
                        <div className="text-sm">
                          <span className="font-medium">User:</span>{" "}
                          <span className="text-muted-foreground">{String(log.metadata.query.user)}</span>
                        </div>
                      )}
                      {log.metadata.query.isCustomOrder !== undefined && (
                        <div className="text-sm">
                          <span className="font-medium">Order Type:</span>{" "}
                          <Badge variant="outline" className="ml-1">
                            {log.metadata.query.isCustomOrder === "true" || log.metadata.query.isCustomOrder === true ? "Custom" : "Regular"}
                          </Badge>
                        </div>
                      )}
                      {log.metadata.query.page && (
                        <div className="text-sm">
                          <span className="font-medium">Page:</span>{" "}
                          <span className="text-muted-foreground">{String(log.metadata.query.page)}</span>
                        </div>
                      )}
                      {log.metadata.query.limit && (
                        <div className="text-sm">
                          <span className="font-medium">Items per page:</span>{" "}
                          <span className="text-muted-foreground">{String(log.metadata.query.limit)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {log.metadata.total !== undefined && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Total Results</label>
                    <p className="text-sm mt-1">{log.metadata.total.toLocaleString()} orders</p>
                  </div>
                )}
                {log.metadata.page !== undefined && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Page Number</label>
                    <p className="text-sm mt-1">{log.metadata.page}</p>
                  </div>
                )}
                {log.metadata.orderId && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Order ID</label>
                    <p className="text-sm mt-1">
                      <Link href={`/orders/${log.metadata.orderId}`} className="text-primary hover:underline">
                        {log.metadata.orderId}
                      </Link>
                    </p>
                  </div>
                )}
                {log.metadata.userId && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">User ID</label>
                    <p className="text-sm mt-1">
                      <Link href={`/users/${log.metadata.userId}`} className="text-primary hover:underline">
                        {log.metadata.userId}
                      </Link>
                    </p>
                  </div>
                )}
                {/* Show any other metadata fields that aren't handled above */}
                {Object.keys(log.metadata).filter(key => 
                  !['cached', 'query', 'total', 'page', 'orderId', 'userId'].includes(key)
                ).length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Other Information</label>
                    <div className="mt-2 space-y-1">
                      {Object.entries(log.metadata)
                        .filter(([key]) => !['cached', 'query', 'total', 'page', 'orderId', 'userId'].includes(key))
                        .map(([key, value]) => (
                          <div key={key} className="text-sm">
                            <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>{" "}
                            <span className="text-muted-foreground">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Staff Member */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Staff Member
              </CardTitle>
            </CardHeader>
            <CardContent>
              {admin ? (
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="text-lg font-semibold">
                      <Link
                        href={`/users/${admin._id}`}
                        className="text-primary hover:underline"
                      >
                        {admin.name}
                      </Link>
                    </p>
                  </div>
                  {admin.email && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-sm">{admin.email}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Role</label>
                    <div className="text-sm mt-1">
                      <Badge variant="outline" className="capitalize">
                        {admin.role}
                      </Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Unknown</p>
              )}
            </CardContent>
          </Card>

          {/* Related Order */}
          {orderIdValue && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Related Order
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Order Number</label>
                    <p className="text-lg font-semibold">
                      <Link
                        href={`/orders/${orderIdValue}`}
                        className="text-primary hover:underline"
                      >
                        {order && typeof order === "object" && order.orderNumber
                          ? order.orderNumber
                          : String(orderIdValue).substring(0, 8)}
                      </Link>
                    </p>
                  </div>
                  {order && typeof order === "object" && order.status && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Current Status</label>
                      <div className="text-sm mt-1">
                        <Badge variant="outline" className="capitalize">
                          {order.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timestamps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p className="text-sm">
                  {new Date(log.createdAt).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                </p>
              </div>
              <Separator />
              <div>
                <label className="text-sm font-medium text-muted-foreground">Updated</label>
                <p className="text-sm">
                  {new Date(log.updatedAt).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(log.updatedAt), { addSuffix: true })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

