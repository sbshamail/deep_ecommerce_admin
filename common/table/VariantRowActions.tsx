"use client";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SheetPanel } from "@/components/ui/sheet-panel";
import { ProductVariantBase } from "@/types/product_types";

import VariantForm from "./VariantForm";

interface VariantRowActionsProps {
  productId: number;
  variant: ProductVariantBase;
  onSaved?: (variant: ProductVariantBase) => void;
  onDeleted?: (id: number) => void;
}

const VariantRowActions = ({
  productId,
  variant,
  onSaved,
  onDeleted,
}: VariantRowActionsProps) => {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    const res = await fetch(`/api/product-variant/delete/${variant.id}`, {
      method: "DELETE",
    });
    setDeleting(false);
    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      setError(payload?.detail ?? "Failed to delete variant");
      return;
    }
    setDeleteOpen(false);
    onDeleted?.(variant.id);
  };

  return (
    <div className="flex items-center justify-center gap-3">
      <button
        type="button"
        title="Edit variant"
        onClick={() => setEditOpen(true)}
        className="text-muted-foreground hover:text-foreground"
      >
        <Pencil size={14} />
      </button>
      <button
        type="button"
        title="Delete variant"
        onClick={() => setDeleteOpen(true)}
        className="text-muted-foreground hover:text-destructive"
      >
        <Trash2 size={14} />
      </button>

      <SheetPanel
        open={editOpen}
        onOpenChange={setEditOpen}
        title="Edit variant"
        resizable
        width={{ default: 480, min: 400, max: 720 }}
      >
        <VariantForm
          mode="update"
          productId={productId}
          variant={variant}
          onSuccess={(saved) => {
            onSaved?.(saved);
            setEditOpen(false);
          }}
          close={() => setEditOpen(false)}
        />
      </SheetPanel>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this variant?"
        description="This can't be undone."
        onConfirm={handleDelete}
        loading={deleting}
      >
        {error && <p className="text-sm text-destructive">{error}</p>}
      </ConfirmDialog>
    </div>
  );
};

export default VariantRowActions;
