import { PageHeader } from "@/components/dashboard/common/page-header";
import { CategoriesTable } from "@/components/dashboard/category/table";
import { Folder } from "lucide-react";

export default function CategoriesPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 sm:max-w-6xl mx-auto w-full space-y-8 p-4">
      <PageHeader
        icon={Folder}
        title="Category Management"
        subtitle="Create, edit, and manage your categories with a modern interface."
      />
      <CategoriesTable />
    </div>
  );
}
