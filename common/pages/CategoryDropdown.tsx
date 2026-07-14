"use client";
import { ChevronRight, FolderTree, Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { useAuth } from "@/auth/authContext";
import CategoryForm from "@/common/form/CategoryForm";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CategoryRead, CategoryTreeNode } from "@/types/product_types";

// Backend caps the tree at 3 levels (fn.py calculate_category_level); a
// level-3 node can't have children, so it gets no "add child" affordance.
const MAX_LEVEL = 3;
const COLUMN_LABELS = ["Top level", "Sub-category", "Sub-sub-category"];

interface CategoryDropdownProps {
  categories: CategoryTreeNode[];
}

type FormState =
  | { mode: "create"; parentId: number | null }
  | { mode: "update"; category: CategoryRead };

// Selection is tracked by id (not node reference) so it survives the
// router.refresh() that re-fetches `categories` after every mutation.
const CategoryDropdown = ({ categories }: CategoryDropdownProps) => {
  const router = useRouter();
  const { can } = useAuth();

  const canCreate = can("category:create");
  const canUpdate = can("category:create", "category:update");
  const canDelete = can("category:delete");

  const [rawSelectedIds, setSelectedIds] = useState<number[]>([]);
  const [form, setForm] = useState<FormState | null>(null);
  // Default to the first root so a selection is always highlighted — derived
  // (not an effect) so it stays correct across refreshes without extra renders.
  const selectedIds = useMemo(
    () =>
      rawSelectedIds.length === 0 && categories.length > 0
        ? [categories[0].id]
        : rawSelectedIds,
    [rawSelectedIds, categories],
  );

  const [deleteTarget, setDeleteTarget] = useState<CategoryTreeNode | null>(
    null,
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Resolve the selected node at each depth from the current tree, stopping
  // as soon as a level has no selection. columns[0] is always the roots.
  const columns = useMemo(() => {
    const cols: CategoryTreeNode[][] = [categories];
    let level = categories;
    for (let i = 0; i < selectedIds.length; i++) {
      const node = level.find((n) => n.id === selectedIds[i]);
      if (!node || node.children.length === 0) break;
      cols.push(node.children);
      level = node.children;
    }
    return cols;
  }, [categories, selectedIds]);

  // Build from the derived selectedIds (which includes the auto-selected
  // root), NOT rawSelectedIds — otherwise selecting a deeper column would
  // drop the implicit column-0 selection.
  const selectAt = (colIndex: number, id: number) =>
    setSelectedIds([...selectedIds.slice(0, colIndex), id]);

  const refresh = () => router.refresh();

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    const res = await fetch(`/api/category/${deleteTarget.id}`, {
      method: "DELETE",
    });
    setDeleting(false);
    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      // Backend blocks deleting a category with children/products — surface it.
      setDeleteError(payload?.detail ?? "Failed to delete category");
      return;
    }
    setDeleteTarget(null);
    refresh();
  };
  console.log(columns);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-lg font-semibold">
            <FolderTree size={18} className="text-primary" />
            Categories
          </h1>
          <p className="text-sm text-muted-foreground">
            Browse up to three levels. Use + on a category to add a child.
          </p>
        </div>
        {canCreate && (
          <Button
            size="sm"
            className="gap-1"
            onClick={() => setForm({ mode: "create", parentId: null })}
          >
            <Plus size={16} />
            Add top-level
          </Button>
        )}
      </div>

      <div className="flex min-h-[24rem] overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
        {columns.map((nodes, colIndex) => (
          <div
            key={colIndex}
            className="flex w-72 shrink-0 flex-col border-r border-border last:border-r-0"
          >
            <div className="flex items-center justify-between border-b border-border bg-muted/50 px-3 py-2">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {COLUMN_LABELS[colIndex] ?? `Level ${colIndex + 1}`}
              </span>
              <span className="rounded-full bg-muted px-2 text-xs text-muted-foreground">
                {nodes.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-1.5">
              {nodes.length === 0 ? (
                <p className="px-2 py-4 text-center text-sm text-muted-foreground">
                  No categories
                </p>
              ) : (
                nodes.map((node) => {
                  const isSelected = selectedIds[colIndex] === node.id;

                  const hasChildren = node.children.length > 0;
                  const canAddChild = canCreate && node.level < MAX_LEVEL;
                  return (
                    <div
                      key={node.id}
                      onClick={() => selectAt(colIndex, node.id)}
                      className={cn(
                        "group flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
                        isSelected
                          ? "bg-primary/10 text-primary "
                          : "hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      {node.image?.original ? (
                        <Image
                          alt={node.name}
                          src={node.image.original}
                          width={24}
                          height={24}
                          className="h-6 w-6 shrink-0 rounded object-cover"
                        />
                      ) : (
                        <span
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-medium",
                            isSelected
                              ? "bg-primary/20"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {node.name.charAt(0).toUpperCase()}
                        </span>
                      )}

                      <span className="flex-1 truncate">{node.name}</span>

                      {/* Row actions — appear on hover / when selected */}
                      <div
                        className={cn(
                          "flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100",
                          isSelected && "opacity-100",
                        )}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {canAddChild && (
                          <button
                            type="button"
                            title="Add child category"
                            className="rounded p-1 text-muted-foreground hover:bg-primary/20 hover:text-primary"
                            onClick={() =>
                              setForm({ mode: "create", parentId: node.id })
                            }
                          >
                            <Plus size={14} />
                          </button>
                        )}
                        {canUpdate && (
                          <button
                            type="button"
                            title="Edit category"
                            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                            onClick={() =>
                              setForm({ mode: "update", category: node })
                            }
                          >
                            <Pencil size={14} />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            title="Delete category"
                            className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => {
                              setDeleteError(null);
                              setDeleteTarget(node);
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                      {hasChildren && (
                        <ChevronRight
                          size={14}
                          className="shrink-0 text-muted-foreground"
                        />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create / edit modal */}
      <Dialog open={form !== null} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent className="max-h-[90svh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {form?.mode === "update" ? "Edit category" : "Create category"}
            </DialogTitle>
          </DialogHeader>
          {form && (
            <CategoryForm
              mode={form.mode}
              category={form.mode === "update" ? form.category : undefined}
              defaultParentId={
                form.mode === "create" ? form.parentId : undefined
              }
              categories={categories}
              onSuccess={refresh}
              close={() => setForm(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{deleteTarget?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This can&apos;t be undone. Categories with sub-categories or
              assigned products can&apos;t be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <p className="text-sm text-destructive">{deleteError}</p>
          )}
          <AlertDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={confirmDelete}
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CategoryDropdown;
