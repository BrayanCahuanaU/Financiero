"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { apiRequest } from "@/lib/client";
import { todayISO } from "@/lib/utils";

export function ContributionForm({ goalId, goalName }: { goalId: string; goalName: string }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Ingresa un monto mayor a cero.");
      return;
    }
    setLoading(true);
    try {
      await apiRequest(`/api/goals/${goalId}/contributions`, {
        method: "POST",
        body: { amount: parsed, date, note: note.trim() || null },
      });
      toast("Aporte registrado. ¡Sigue así!");
      setOpen(false);
      setAmount("");
      setNote("");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo registrar el aporte.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-lg border border-mint/25 bg-mint/10 px-2.5 py-1.5 text-[11px] font-semibold text-mint transition hover:bg-mint/15"
      >
        <Plus className="h-3 w-3" /> Aportar
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Registrar aporte"
        description={`Suma un monto a tu meta “${goalName}”.`}
      >
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label" htmlFor={`contribution-${goalId}`}>
              Monto del aporte
            </label>
            <input
              id={`contribution-${goalId}`}
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              autoFocus
              required
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
              className="field !py-3 !text-lg font-semibold tnum"
            />
          </div>
          <div>
            <label className="label" htmlFor={`contribution-date-${goalId}`}>
              Fecha
            </label>
            <input
              id={`contribution-date-${goalId}`}
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="field"
            />
          </div>
          <div>
            <label className="label" htmlFor={`contribution-note-${goalId}`}>
              Nota (opcional)
            </label>
            <input
              id={`contribution-note-${goalId}`}
              maxLength={120}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Ej. Aporte de quincena"
              className="field"
            />
          </div>

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
              Guardar aporte
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
