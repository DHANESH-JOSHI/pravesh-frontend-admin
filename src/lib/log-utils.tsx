import React from "react";
import { Eye, List, Edit, CheckCircle, Package, FileText } from "lucide-react";
import { Link } from "next-view-transitions";
import { formatOrderId } from "./format-id";

export const getActionConfig = (action: string) => {
  const configs: Record<string, { color: string; icon: typeof Eye; label: string }> = {
    status_update: { color: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300", icon: CheckCircle, label: "Status" },
    items_updated: { color: "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300", icon: Package, label: "Items" },
    feedback_updated: { color: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300", icon: Edit, label: "Feedback" },
    view: { color: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300", icon: Eye, label: "Viewed" },
    view_list: { color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300", icon: List, label: "List View" },
  };
  return configs[action] || { color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300", icon: FileText, label: action.replace(/_/g, " ") };
};

export const HighlightText = ({ text }: { text: string }) => {
  const statuses = [
    'received', 'approved', 'cancelled', 'confirmed', 'shipped',
    'out for delivery', 'out_for_delivery', 'delivered', 'refunded'
  ];
  const parts: (string | React.ReactNode)[] = [];
  let lastIndex = 0;
  let keyCounter = 0;

  const patterns = statuses.map(status => {
    const escaped = status.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return escaped.replace(/[\s_]+/g, '[\\s_]+');
  });

  const regex = new RegExp(`\\b(${patterns.join('|')})\\b`, 'gi');
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    parts.push(
      <span key={`highlight-${keyCounter++}`} className="font-semibold text-foreground">
        {match[0]}
      </span>
    );
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <>{parts.length > 0 ? parts : text}</>;
};

export const formatLogMessage = (log: any, options?: { showAdminName?: boolean; currentOrderId?: string }) => {
  const { showAdminName = true, currentOrderId } = options || {};
  const adminName = typeof log.admin === "object" ? log.admin?.name : "Unknown";
  const adminId = typeof log.admin === "object" ? log.admin?._id : log.admin;
  const orderId = typeof log.order === "object" ? log.order?._id : log.order;
  const orderRef = orderId ? formatOrderId(String(orderId), { showPrefix: false }) : null;
  const displayOrderId = currentOrderId || orderId;

  const UserLink = ({ id, name }: { id: string, name: string }) => (
    <Link
      href={`/users/${id}`}
      className="underline text-primary hover:text-primary/80 font-medium"
      onClick={(e) => e.stopPropagation()}
    >
      {name}
    </Link>
  );

  const OrderLink = ({ id }: { id: string }) => (
    <Link
      href={`/orders/${id}`}
      className="underline text-primary hover:text-primary/80 font-medium"
      onClick={(e) => e.stopPropagation()}
    >
      {formatOrderId(id)}
    </Link>
  );

  const adminPrefix = showAdminName ? (
    adminId ? <UserLink id={String(adminId)} name={adminName} /> : adminName
  ) : null;

  switch (log.action) {
    case "status_update":
      if (log.oldValue && log.newValue) {
        return (
          <>
            {adminPrefix && <>{adminPrefix} </>}
            <HighlightText text="changed status from" /> {String(log.oldValue).replace(/_/g, " ")} to {String(log.newValue).replace(/_/g, " ")}
            {orderRef && <> for <HighlightText text="order" /> <OrderLink id={String(displayOrderId)} /></>}
          </>
        );
      }
      return (
        <>
          {adminPrefix && <>{adminPrefix} </>}
          <HighlightText text="updated order status" />{orderRef && <> <OrderLink id={String(displayOrderId)} /></>}
        </>
      );
    
    case "view":
      return (
        <>
          {adminPrefix && <>{adminPrefix} </>}
          <HighlightText text="viewed order" /> {orderRef ? <OrderLink id={String(displayOrderId)} /> : ""}
        </>
      );
    
    case "view_list":
      const query = log.metadata?.query;
      if (query?.status) {
        return (
          <>
            {adminPrefix && <>{adminPrefix} </>}
            <HighlightText text="viewed orders filtered by" /> {String(query.status).replace(/_/g, " ")}
          </>
        );
      }
      if (query?.user) {
        return (
          <>
            {adminPrefix && <>{adminPrefix} </>}
            <HighlightText text="searched orders" /> for "{query.user}"
          </>
        );
      }
      return (
        <>
          {adminPrefix && <>{adminPrefix} </>}
          <HighlightText text="viewed all orders" />
        </>
      );
    
    case "items_updated":
      if (log.field) {
        return (
          <>
            {adminPrefix && <>{adminPrefix} </>}
            <HighlightText text="updated" /> {log.field}{orderRef && <> for <HighlightText text="order" /> <OrderLink id={String(displayOrderId)} /></>}
          </>
        );
      }
      return (
        <>
          {adminPrefix && <>{adminPrefix} </>}
          <HighlightText text="updated order items" />{orderRef && <> <OrderLink id={String(displayOrderId)} /></>}
        </>
      );
    
    case "feedback_updated":
      return (
        <>
          {adminPrefix && <>{adminPrefix} </>}
          <HighlightText text="updated feedback" />{orderRef && <> for <HighlightText text="order" /> <OrderLink id={String(displayOrderId)} /></>}
        </>
      );
    
    default:
      const defaultText = log.description || `${log.action.replace(/_/g, " ")}${orderRef ? ` order #${orderRef}` : ""}`;
      return (
        <>
          {adminPrefix && <>{adminPrefix} </>}
          <HighlightText text={defaultText} />{orderRef && <> <OrderLink id={String(displayOrderId)} /></>}
        </>
      );
  }
};

