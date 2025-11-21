import { PageHeader } from "@/components/dashboard/common/page-header";
import { ProductsTable } from "@/components/dashboard/product/table";
import { Package } from "lucide-react";

export default function ProductsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 sm:px-8 lg:px-20 mx-auto w-full space-y-4 max-w-[1400px]">
      <PageHeader
        icon={Package}
        title="Product Management"
        subtitle="Create, edit, and manage your products with a modern interface."
      />
      <ProductsTable />
    </div>
  );
}
