import { PageHeader } from "@/components/dashboard/common/page-header";
import { UsersTable } from "@/components/dashboard/user/table";
import { Users } from "lucide-react";

export default function UsersPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 sm:max-w-6xl mx-auto w-full space-y-8 p-4">
      <PageHeader
        icon={Users}
        title="User Management"
        subtitle="View and manage users with a modern interface."
      />
      <UsersTable />
    </div>
  );
}
