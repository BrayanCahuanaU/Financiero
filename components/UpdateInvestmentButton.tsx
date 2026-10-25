"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil } from "lucide-react";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { apiRequest } from "@/lib/client";
import { formatCurrency } from "@/lib/utils";

export function UpdateInvestmentButton({
  id,
  name,
  currentValue,
  currency,
}: {
  id: string;
  name: string;
  currentValue: number;
  currency: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(String(currentValue));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setError("Ingresa un valor actual válido.");
      return;
    }
    setLoading(true);
    try {
      await apiRequest(`/api/investments/${id}`, {
        method: "PATCH",
        body: { current_value: parsed },
      });
      toast("Valor actualizado.");
      setOpen(false);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo actualizar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setValue(String(currentValue));
          setOpen(true);
        }}
        className="inline-flex items-center gap-1 rounded-lg border border-line px-2 py-1 text-[10px] font-medium text-mist transition hover:border-mint/30 hover:text-mint"
      >
        <Pencil className="h-2.5 w-2.5" /> Actualizar valor
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Actualizar valor"
        description={`${name} · valor registrado hoy: ${formatCurrency(currentValue, currency)}`}
      >
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label" htmlFor={`investment-value-${id}`}>
              Nuevo valor actual
            </label>
            <input
              id={`investment-value-${id}`}
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              required
              autoFocus
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className="field !py-3 !text-lg font-semibold tnum"
            />
          </div>
          {error && (
            <p className="rounded-lg border border-rose-400/25 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
