import { PageHeader } from "@/components/dashboard/common/page-header";
import { ReviewsTable } from "@/components/dashboard/review/table";
import { Star } from "lucide-react";

export default function ReviewsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 sm:px-8 lg:px-20 mx-auto w-full space-y-4 max-w-[1400px]">
      <PageHeader
        icon={Star}
        title="Review Management"
        subtitle="View and manage user reviews with a modern interface."
      />
      <ReviewsTable />
    </div>
  );
}