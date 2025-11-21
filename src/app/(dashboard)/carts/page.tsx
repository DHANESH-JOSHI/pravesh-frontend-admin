import { PageHeader } from "@/components/dashboard/common/page-header";
import { CartsTable } from "@/components/dashboard/cart/table";
import { ShoppingCart } from "lucide-react";

export default function CartsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 sm:px-20 mx-auto w-full space-y-4">
      <PageHeader
        icon={ShoppingCart}
        title="Cart Management"
        subtitle="View and manage user shopping carts."
      />
      <CartsTable />
    </div>
  );
}