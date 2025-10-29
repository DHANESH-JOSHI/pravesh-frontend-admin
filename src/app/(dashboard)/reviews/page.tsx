import { PageHeader } from "@/components/dashboard/common/page-header";
import { ReviewsTable } from "@/components/dashboard/review/table";
import { Star } from "lucide-react";

export default function ReviewsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 sm:max-w-6xl mx-auto w-full space-y-8 p-4">
      <PageHeader
        icon={Star}
        title="Review Management"
        subtitle="View and manage user reviews with a modern interface."
      />
      <ReviewsTable />
    </div>
  );
}