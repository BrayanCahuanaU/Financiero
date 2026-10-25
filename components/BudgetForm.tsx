"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { apiRequest } from "@/lib/client";
import { EXPENSE_CATEGORIES } from "@/lib/constants";

export function BudgetForm({
  existingCategories = [],
  defaultCategory,
  triggerLabel = "Nuevo presupuesto",
  triggerClassName = "btn btn-primary",
}: {
  existingCategories?: string[];
  defaultCategory?: string;
  triggerLabel?: string;
  triggerClassName?: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState(
    defaultCategory ??
      EXPENSE_CATEGORIES.find((item) => !existingCategories.includes(item)) ??
      EXPENSE_CATEGORIES[0],
  );
  const [limit, setLimit] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const parsed = Number(limit);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Ingresa un límite mayor a cero.");
      return;
    }
    setLoading(true);
    try {
      await apiRequest("/api/budgets", {
        method: "POST",
        body: { category, monthly_limit: parsed },
      });
      toast(
        existingCategories.includes(category)
          ? "Presupuesto actualizado."
          : "Presupuesto creado.",
      );
      setOpen(false);
      setLimit("");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo guardar el presupuesto.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        <Plus className="h-4 w-4" /> {triggerLabel}
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Presupuesto mensual"
        description="Define un límite por categoría para controlar tus gastos cada mes."
      >
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label" htmlFor="budget-category">
              Categoría
            </label>
            <select
              id="budget-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="field"
            >
              {EXPENSE_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                  {existingCategories.includes(item) ? " · ya tiene límite" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="budget-limit">
              Límite mensual
            </label>
            <input
              id="budget-limit"
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              required
              value={limit}
              onChange={(event) => setLimit(event.target.value)}
              placeholder="0.00"
              className="field !py-3 !text-lg font-semibold tnum"
            />
          </div>

          {existingCategories.includes(category) && (
            <p className="rounded-lg border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200">
              Ya existe un presupuesto para esta categoría. Al guardar se actualizará el límite.
            </p>
          )}

          {error && (
            <p className="rounded-lg border border-rose-400/25 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
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
              Guardar presupuesto
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
