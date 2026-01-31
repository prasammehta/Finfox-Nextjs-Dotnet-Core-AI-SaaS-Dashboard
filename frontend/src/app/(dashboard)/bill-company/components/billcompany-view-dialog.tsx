"use client"

import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { BillCompany } from "@/types/schema"

interface BillCompanyViewDialogProps {
  company: BillCompany | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BillCompanyViewDialog({
  company,
  open,
  onOpenChange,
}: BillCompanyViewDialogProps) {
  if (!company) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Company Details</DialogTitle>
          <DialogDescription>
            View complete company information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Company Logo */}
          {company.logoUrl && (
            <div className="flex justify-center">
              <Image
                src={company.logoUrl}
                alt={company.name}
                width={128}
                height={128}
                className="object-contain rounded-lg border border-slate-200 dark:border-slate-700"
              />
            </div>
          )}

          {/* Basic Information */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                <p className="text-base mt-1">{company.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Address</label>
                <p className="text-base mt-1">{company.address}</p>
              </div>
            </div>
          </div>

          {/* Tax Information */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-4">Tax Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">GSTIN</label>
                <p className="text-base mt-1">
                  {company.gstin ? <Badge variant="outline">{company.gstin}</Badge> : "—"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">PAN</label>
                <p className="text-base mt-1">
                  {company.pan ? <Badge variant="outline">{company.pan}</Badge> : "—"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">TDS (%)</label>
                <p className="text-base mt-1">{company.tdsPercent || "—"}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-4">Contact Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-base mt-1">{company.email || "—"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <p className="text-base mt-1">{company.phone || "—"}</p>
              </div>
            </div>
          </div>

          {/* Bank Information */}
          {(company.accountName || company.accountNumber || company.ifscCode) && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Bank Details</h3>
              <div className="space-y-3">
                {company.accountName && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Account Name</label>
                    <p className="text-base mt-1">{company.accountName}</p>
                  </div>
                )}
                {company.accountNumber && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Account Number</label>
                    <p className="text-base mt-1">{company.accountNumber}</p>
                  </div>
                )}
                {company.ifscCode && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">IFSC Code</label>
                    <p className="text-base mt-1">{company.ifscCode}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="border rounded-lg p-4 bg-muted/50">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="font-medium text-muted-foreground">Created</label>
                <p className="mt-1">{new Date(company.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="font-medium text-muted-foreground">Last Updated</label>
                <p className="mt-1">{new Date(company.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}