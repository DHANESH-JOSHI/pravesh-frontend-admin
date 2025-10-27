import { PageHeader } from "@/components/dashboard/common/page-header";
import { BlogsTable } from "@/components/dashboard/blog/table";
import { FileText } from "lucide-react";

export default function BlogsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 sm:max-w-6xl mx-auto w-full space-y-8 p-4">
      <PageHeader
        icon={FileText}
        title="Blog Management"
        subtitle="Create, edit, and manage your blog posts with a modern interface."
      />
      <BlogsTable />
    </div>
  );
}
