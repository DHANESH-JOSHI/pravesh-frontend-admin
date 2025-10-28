"use client";

import { MapPin, Phone, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Address } from "@/types/address";

interface AddressViewDialogProps {
  address: Address | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddressViewDialog({
  address,
  open,
  onOpenChange,
}: AddressViewDialogProps) {
  if (!address) return null;

  const user = typeof address.user === 'object' ? address.user : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Address Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Information */}
          {user && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                User Information
              </h3>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{user.name || "Unknown User"}</p>
                </div>
                {user.email && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {user.email}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Contact Information
            </h3>
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{address.fullname}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{address.phone}</span>
              </div>
            </div>
          </div>

          {/* Address Details */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Address Details
            </h3>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium">{address.line1}</p>
                  {address.line2 && (
                    <p className="text-sm">{address.line2}</p>
                  )}
                  {address.landmark && (
                    <p className="text-sm text-muted-foreground">
                      Landmark: {address.landmark}
                    </p>
                  )}
                  <p className="text-sm">
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                  <p className="text-sm">{address.country}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Status
            </h3>
            <Badge variant={address.isDeleted ? "destructive" : "secondary"}>
              {address.isDeleted ? "Deleted" : "Active"}
            </Badge>
          </div>

          <Separator />

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Created:</span>
              <p>{address.createdAt}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Updated:</span>
              <p>{address.updatedAt}</p>
            </div>
          </div>

          {/* Address ID */}
          <div>
            <span className="text-xs font-medium text-muted-foreground">
              Address ID:
            </span>
            <p className="text-xs font-mono mt-1">{address._id}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}