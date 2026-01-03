"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Upload, FileText, Download, X, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { productService } from "@/services/product.service";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { invalidateProductQueries } from "@/lib/invalidate-queries";

interface BulkImportResult {
  total: number;
  success: number;
  failed: number;
  errors: Array<{ row: number; errors: string[] }>;
}

export function BulkImportDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<BulkImportResult | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (csvFile: File) => {
      return await productService.bulkImport(csvFile);
    },
    onSuccess: (data) => {
      if (data.data) {
        setResult(data.data);
        if (data.data.success > 0) {
          toast.success(`Successfully imported ${data.data.success} products`);
          invalidateProductQueries(queryClient);
        }
        if (data.data.failed > 0) {
          toast.error(`Failed to import ${data.data.failed} products. Check errors below.`);
        }
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to import products");
      setResult(null);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
        toast.error("Please select a CSV file");
        e.target.value = ""; // Clear the input
        return;
      }
      
      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (selectedFile.size > maxSize) {
        toast.error("File size must be less than 10MB");
        e.target.value = ""; // Clear the input
        return;
      }
      
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleSubmit = () => {
    if (!file) {
      toast.error("Please select a CSV file");
      return;
    }
    mutation.mutate(file);
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    onOpenChange(false);
  };

  const downloadTemplate = () => {
    const template = `name,categoryId,units,brandId,tags,variants,specifications,isFeatured,isNewArrival,thumbnail
Product Name 1,CategoryID1,UnitID1 UnitID2,BrandID1,tag1 tag2,"{""size"":[""S"",""M"",""L""]}","{""weight"":""1kg"",""dimensions"":[""10cm"",""20cm""]}",false,true,https://example.com/image.jpg
Product Name 2,CategoryID2,UnitID1,,tag3,"{""color"":[""Red"",""Blue""]}","{""material"":""Plastic""}",true,false,`;
    
    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "product-import-template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Import Products</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import multiple products at once. Download the template to see the required format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">CSV Template</span>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          <div className="border-2 border-dashed rounded-lg p-6">
            <div className="flex flex-col items-center justify-center gap-4">
              <Upload className="h-12 w-12 text-muted-foreground" />
              <div className="text-center">
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <span className="text-sm font-medium text-primary hover:underline">
                    Click to upload
                  </span>
                  <span className="text-sm text-muted-foreground"> or drag and drop</span>
                </label>
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground mt-2">CSV file only (max 10MB)</p>
              </div>
              {file && (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4" />
                  <span>{file.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {result && (
            <div className="space-y-2 p-4 rounded-lg border bg-muted/50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Import Results</span>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{result.success} successful</span>
                  </div>
                  <div className="flex items-center gap-1 text-red-600">
                    <XCircle className="h-4 w-4" />
                    <span>{result.failed} failed</span>
                  </div>
                </div>
              </div>
              {result.errors.length > 0 && (
                <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                  <p className="text-xs font-medium text-muted-foreground">Errors:</p>
                  {result.errors.map((error, idx) => (
                    <div key={idx} className="text-xs p-2 rounded bg-destructive/10 border border-destructive/20">
                      <span className="font-medium">Row {error.row}:</span> {error.errors.join(", ")}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!file || mutation.isPending}
          >
            {mutation.isPending ? "Importing..." : "Import Products"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

