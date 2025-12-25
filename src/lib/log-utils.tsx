import React from "react";
import { Eye, List, Edit, CheckCircle, Package, FileText } from "lucide-react";
import { Link } from "next-view-transitions";

export const getActionConfig = (action: string, field?: string) => {
  // For update actions, use field to determine icon and label
  if (action === 'update') {
    if (field === 'status') {
      return { color: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300", icon: CheckCircle, label: "Status Update" };
    } else if (field === 'items') {
      return { color: "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300", icon: Package, label: "Items Update" };
    } else if (field === 'feedback') {
      return { color: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300", icon: Edit, label: "Feedback Update" };
    }
    return { color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300", icon: Edit, label: "Update" };
  }
  
  const configs: Record<string, { color: string; icon: typeof Eye; label: string }> = {
    view: { color: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300", icon: Eye, label: "View" },
    list: { color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300", icon: List, label: "List View" },
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
  const orderNumber = typeof log.order === "object" ? log.order?.orderNumber : null;
  const orderRef = orderNumber || (orderId ? String(orderId).substring(0, 8) : null);
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

  const OrderLink = ({ id }: { id: string }) => {
    const order = typeof log.order === "object" ? log.order : null;
    const displayValue = order?.orderNumber || String(id).substring(0, 8);
    return (
      <Link
        href={`/orders/${id}`}
        className="underline text-primary hover:text-primary/80 font-medium"
        onClick={(e) => e.stopPropagation()}
      >
        {displayValue}
      </Link>
    );
  };

  const adminPrefix = showAdminName ? (
    adminId ? <UserLink id={String(adminId)} name={adminName} /> : adminName
  ) : null;

  switch (log.action) {
    case "update":
      // Use field to determine what was updated
      if (log.field === "status") {
        if (log.oldValue && log.newValue) {
          return (
            <>
              {adminPrefix && <>{adminPrefix} </>}
              <HighlightText text="changed status from" /> <span className="font-semibold text-muted-foreground">{String(log.oldValue).replace(/_/g, " ")}</span> to <span className="font-semibold text-foreground">{String(log.newValue).replace(/_/g, " ")}</span>
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
      } else if (log.field === "items") {
        if (log.oldValue && log.newValue) {
          const oldItemsCount = Array.isArray(log.oldValue) ? log.oldValue.length : 0;
          const newItemsCount = Array.isArray(log.newValue) ? log.newValue.length : 0;
          return (
            <>
              {adminPrefix && <>{adminPrefix} </>}
              <HighlightText text="updated order items" /> from <span className="font-semibold text-muted-foreground">{oldItemsCount}</span> to <span className="font-semibold text-foreground">{newItemsCount}</span> items
              {orderRef && <> for <HighlightText text="order" /> <OrderLink id={String(displayOrderId)} /></>}
            </>
          );
        }
        return (
          <>
            {adminPrefix && <>{adminPrefix} </>}
            <HighlightText text="updated order items" />{orderRef && <> <OrderLink id={String(displayOrderId)} /></>}
          </>
        );
      } else if (log.field === "feedback") {
        if (log.oldValue !== undefined && log.newValue !== undefined) {
          return (
            <>
              {adminPrefix && <>{adminPrefix} </>}
              <HighlightText text="updated feedback" /> from "<span className="italic text-muted-foreground">{String(log.oldValue || 'empty')}</span>" to "<span className="italic text-foreground">{String(log.newValue || 'empty')}</span>"
              {orderRef && <> for <HighlightText text="order" /> <OrderLink id={String(displayOrderId)} /></>}
            </>
          );
        }
        return (
          <>
            {adminPrefix && <>{adminPrefix} </>}
            <HighlightText text="updated feedback" />{orderRef && <> for <HighlightText text="order" /> <OrderLink id={String(displayOrderId)} /></>}
          </>
        );
      }
      // Generic update
      return (
        <>
          {adminPrefix && <>{adminPrefix} </>}
          <HighlightText text="updated" /> {log.field || "order"}{orderRef && <> <OrderLink id={String(displayOrderId)} /></>}
        </>
      );
    
    case "view":
      return (
        <>
          {adminPrefix && <>{adminPrefix} </>}
          <HighlightText text="viewed order" /> {orderRef ? <OrderLink id={String(displayOrderId)} /> : ""}
        </>
      );
    
    case "list":
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
    
    // Legacy support for old action values
    case "status_update":
      if (log.oldValue && log.newValue) {
        return (
          <>
            {adminPrefix && <>{adminPrefix} </>}
            <HighlightText text="changed status from" /> <span className="font-semibold text-muted-foreground">{String(log.oldValue).replace(/_/g, " ")}</span> to <span className="font-semibold text-foreground">{String(log.newValue).replace(/_/g, " ")}</span>
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
    
    case "items_updated":
      if (log.oldValue && log.newValue) {
        const oldItemsCount = Array.isArray(log.oldValue) ? log.oldValue.length : 0;
        const newItemsCount = Array.isArray(log.newValue) ? log.newValue.length : 0;
        return (
          <>
            {adminPrefix && <>{adminPrefix} </>}
            <HighlightText text="updated order items" /> from <span className="font-semibold text-muted-foreground">{oldItemsCount}</span> to <span className="font-semibold text-foreground">{newItemsCount}</span> items
            {orderRef && <> for <HighlightText text="order" /> <OrderLink id={String(displayOrderId)} /></>}
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
      if (log.oldValue !== undefined && log.newValue !== undefined) {
        return (
          <>
            {adminPrefix && <>{adminPrefix} </>}
            <HighlightText text="updated feedback" /> from "<span className="italic text-muted-foreground">{String(log.oldValue || 'empty')}</span>" to "<span className="italic text-foreground">{String(log.newValue || 'empty')}</span>"
            {orderRef && <> for <HighlightText text="order" /> <OrderLink id={String(displayOrderId)} /></>}
          </>
        );
      }
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

