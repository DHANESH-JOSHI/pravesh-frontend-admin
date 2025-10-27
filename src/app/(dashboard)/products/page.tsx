import { PageHeader } from "@/components/dashboard/common/page-header";
import { ProductsTable } from "@/components/dashboard/product/table";
import { Package } from "lucide-react";

export default function ProductsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 sm:max-w-6xl mx-auto w-full space-y-8 p-4">
      <PageHeader
        icon={Package}
        title="Product Management"
        subtitle="Create, edit, and manage your products with a modern interface."
      />
      <ProductsTable />
    </div>
  );
}
