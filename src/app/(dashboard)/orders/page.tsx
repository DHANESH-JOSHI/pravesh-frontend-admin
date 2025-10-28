import { PageHeader } from "@/components/dashboard/common/page-header";
import { OrdersTable } from "@/components/dashboard/order/table";
import { Receipt } from "lucide-react";

export default function OrdersPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 sm:max-w-6xl mx-auto w-full space-y-8 p-4">
      <PageHeader
        icon={Receipt}
        title="Order Management"
        subtitle="View and manage customer orders with a modern interface."
      />
      <OrdersTable />
    </div>
  );
}
