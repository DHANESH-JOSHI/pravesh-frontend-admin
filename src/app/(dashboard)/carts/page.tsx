import { PageHeader } from "@/components/dashboard/common/page-header";
import { CartsTable } from "@/components/dashboard/cart/table";
import { ShoppingCart } from "lucide-react";

export default function CartsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 sm:max-w-6xl mx-auto w-full space-y-8 p-4">
      <PageHeader
        icon={ShoppingCart}
        title="Cart Management"
        subtitle="View and manage user shopping carts."
      />
      <CartsTable />
    </div>
  );
}