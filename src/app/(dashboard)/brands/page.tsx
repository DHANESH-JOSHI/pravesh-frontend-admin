import { PageHeader } from "@/components/dashboard/common/page-header";
import { BrandsTable } from "@/components/dashboard/brand/table";

export default function BrandsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 sm:px-8 lg:px-20 mx-auto w-full max-w-[1400px]">
      <PageHeader
        title="Brand Management"
      />
      <BrandsTable />
    </div>
  );
}
