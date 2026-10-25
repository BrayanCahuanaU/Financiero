"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { apiRequest } from "@/lib/client";

export function DeleteButton({
  url,
  title,
  description,
  confirmLabel = "Eliminar",
  triggerLabel = "Eliminar",
  iconOnly = true,
}: {
  url: string;
  title: string;
  description: string;
  confirmLabel?: string;
  triggerLabel?: string;
  iconOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  async function remove() {
    setLoading(true);
    try {
      await apiRequest(url, { method: "DELETE" });
      setOpen(false);
      toast("Eliminado correctamente.");
      router.refresh();
    } catch (error) {
      toast(error instanceof Error ? error.message : "No se pudo eliminar.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={iconOnly ? "icon-btn" : "btn btn-danger"}
        aria-label={triggerLabel}
        title={triggerLabel}
      >
        <Trash2 className="h-4 w-4" />
        {!iconOnly && <span>{triggerLabel}</span>}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={title} description={description}>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancelar
          </button>
          <button type="button" onClick={remove} className="btn btn-danger" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </Modal>
    </>
  );
}
