import { PageHeader } from "@/components/dashboard/common/page-header";
import { BannersTable } from "@/components/dashboard/banner/table";
import { Image } from "lucide-react";

export default function BannersPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 sm:px-8 lg:px-20 mx-auto w-full space-y-4 max-w-[1400px]">
      <PageHeader
        icon={Image}
        title="Banner Management"
        subtitle="Create, edit, and manage your banners with a modern interface."
      />
      <BannersTable />
    </div>
  );
}
