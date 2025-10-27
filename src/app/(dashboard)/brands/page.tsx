import { PageHeader } from "@/components/dashboard/common/page-header";
import { BrandsTable } from "@/components/dashboard/brand/table";
import { Tag } from "lucide-react";

export default function BrandsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 sm:max-w-6xl mx-auto w-full space-y-8 p-4">
      <PageHeader
        icon={Tag}
        title="Brand Management"
        subtitle="Create, edit, and manage your brands with a modern interface."
      />
      <BrandsTable />
    </div>
  );
}
