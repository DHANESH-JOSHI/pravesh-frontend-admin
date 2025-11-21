import { PageHeader } from "@/components/dashboard/common/page-header";
import { AddressesTable } from "@/components/dashboard/address/table";
import { MapPin } from "lucide-react";limit: 10

export default function AddressesPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 sm:px-8 lg:px-20 mx-auto w-full space-y-4 max-w-[1400px]">
      <PageHeader
        icon={MapPin}
        title="Address Management"
        subtitle="View and manage user addresses with a modern interface."
      />
      <AddressesTable />
    </div>
  );
}