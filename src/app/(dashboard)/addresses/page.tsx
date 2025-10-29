import { PageHeader } from "@/components/dashboard/common/page-header";
import { AddressesTable } from "@/components/dashboard/address/table";
import { MapPin } from "lucide-react";

export default function AddressesPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 sm:max-w-6xl mx-auto w-full space-y-8 p-4">
      <PageHeader
        icon={MapPin}
        title="Address Management"
        subtitle="View and manage user addresses with a modern interface."
      />
      <AddressesTable />
    </div>
  );
}