"use client";

import { PageHeader } from "@/components/dashboard/common/page-header";
import { ProductsTable } from "@/components/dashboard/product/table";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { BulkImportDialog } from "@/components/dashboard/product/bulk-import-dialog";

export default function ProductsPage() {
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 sm:px-8 lg:px-20 mx-auto w-full max-w-[1600px]">
      <PageHeader
        title="Product Management"
        actions={
          <Button
            variant="outline"
            onClick={() => setIsBulkImportOpen(true)}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Bulk Import
          </Button>
        }
      />
      <ProductsTable />
      <BulkImportDialog
        open={isBulkImportOpen}
        onOpenChange={setIsBulkImportOpen}
      />
    </div>
  );
}
