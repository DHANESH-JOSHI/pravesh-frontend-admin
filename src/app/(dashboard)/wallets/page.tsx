import { PageHeader } from "@/components/dashboard/common/page-header";
import { WalletsTable } from "@/components/dashboard/wallet/table";
import { Wallet } from "lucide-react";

export default function WalletsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 sm:max-w-6xl mx-auto w-full space-y-8 p-4">
      <PageHeader
        icon={Wallet}
        title="Wallet Management"
        subtitle="View and manage user wallets and transactions."
      />
      <WalletsTable />
    </div>
  );
}