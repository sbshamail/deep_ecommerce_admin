"use client";
import { Trash2 } from "lucide-react";
import { useState } from "react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ProductVariantBase } from "@/types/product_types";

interface VariantRowActionsProps {
  variant: ProductVariantBase;
  onDeleted?: (id: number) => void;
}

const VariantRowActions = ({ variant, onDeleted }: VariantRowActionsProps) => {
  const [open, setOpen] = useState(false);
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
    setOpen(false);
    onDeleted?.(variant.id);
  };

  return (
    <div className="flex items-center justify-center">
      <button
        type="button"
        title="Delete variant"
        onClick={() => setOpen(true)}
        className="text-muted-foreground hover:text-destructive"
      >
        <Trash2 size={14} />
      </button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
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
