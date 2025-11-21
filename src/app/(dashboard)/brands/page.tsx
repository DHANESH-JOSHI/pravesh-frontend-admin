import { PageHeader } from "@/components/dashboard/common/page-header";
import { BrandsTable } from "@/components/dashboard/brand/table";
import { Building2 } from "lucide-react";

export default function BrandsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 sm:px-20 mx-auto w-full space-y-4">
      <PageHeader
        icon={Building2}
        title="Brand Management"
        subtitle="Create, edit, and manage your brands with a modern interface."
      />
      <BrandsTable />
    </div>
  );
}
