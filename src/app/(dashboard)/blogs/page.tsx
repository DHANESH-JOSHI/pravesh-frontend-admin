import { PageHeader } from "@/components/dashboard/common/page-header";
import { BlogsTable } from "@/components/dashboard/blog/table";
import { FileText } from "lucide-react";

export default function BlogsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 sm:px-8 lg:px-20 mx-auto w-full space-y-4 max-w-[1400px]">
      <PageHeader
        icon={FileText}
        title="Blog Management"
        subtitle="Create, edit, and manage your blog posts with a modern interface."
      />
      <BlogsTable />
    </div>
  );
}
