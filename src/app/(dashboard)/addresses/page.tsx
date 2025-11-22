import { PageHeader } from "@/components/dashboard/common/page-header";
import { AddressesTable } from "@/components/dashboard/address/table";

export default function AddressesPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 sm:px-8 lg:px-20 mx-auto w-full max-w-[1600px]">

      <PageHeader
        title="Address Management"
      />
      <AddressesTable />
    </div>
  );
}