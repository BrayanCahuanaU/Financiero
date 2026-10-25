"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { apiRequest } from "@/lib/client";
import { todayISO } from "@/lib/utils";

const GOAL_COLORS = ["#2fe0a4", "#60a5fa", "#a78bfa", "#fbbf24", "#f472b6", "#fb923c"];

export function GoalForm() {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [saved, setSaved] = useState("");
  const [deadline, setDeadline] = useState("");
  const [note, setNote] = useState("");
  const [color, setColor] = useState(GOAL_COLORS[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const targetAmount = Number(target);
    const savedAmount = Number(saved || 0);
    if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
      setError("La meta debe ser mayor a cero.");
      return;
    }
    if (!Number.isFinite(savedAmount) || savedAmount < 0) {
      setError("El monto ahorrado no es válido.");
      return;
    }
    setLoading(true);
    try {
      await apiRequest("/api/goals", {
        method: "POST",
        body: {
          name: name.trim(),
          target_amount: targetAmount,
          saved_amount: savedAmount,
          deadline: deadline || null,
          note: note.trim() || null,
          color,
        },
      });
      toast("Meta de ahorro creada.");
      setOpen(false);
      setName("");
      setTarget("");
      setSaved("");
      setDeadline("");
      setNote("");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo crear la meta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn btn-primary">
        <Plus className="h-4 w-4" /> Nueva meta
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nueva meta de ahorro"
        description="Define cuánto quieres ahorrar y para cuándo. Luego registra tus aportes."
      >
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label" htmlFor="goal-name">
              ¿Qué quieres lograr?
            </label>
            <input
              id="goal-name"
              required
              maxLength={60}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej. Viaje a Cusco"
              className="field"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="goal-target">
                Meta (S/)
              </label>
              <input
                id="goal-target"
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                required
                value={target}
                onChange={(event) => setTarget(event.target.value)}
                placeholder="3500"
                className="field tnum"
              />
            </div>
            <div>
              <label className="label" htmlFor="goal-saved">
                Ya ahorrado (opcional)
              </label>
              <input
                id="goal-saved"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={saved}
                onChange={(event) => setSaved(event.target.value)}
                placeholder="0.00"
                className="field tnum"
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="goal-deadline">
              Fecha objetivo (opcional)
            </label>
            <input
              id="goal-deadline"
              type="date"
              min={todayISO()}
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
              className="field"
            />
          </div>

          <div>
            <label className="label" htmlFor="goal-note">
              Nota (opcional)
            </label>
            <input
              id="goal-note"
              maxLength={160}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Ej. Vuelos + hotel + tours"
              className="field"
            />
          </div>

          <div>
            <span className="label">Color</span>
            <div className="flex flex-wrap gap-2">
              {GOAL_COLORS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setColor(option)}
                  aria-label={`Color ${option}`}
                  className={`h-7 w-7 rounded-full transition ${
                    color === option
                      ? "ring-2 ring-white/70 ring-offset-2 ring-offset-ink-900"
                      : "opacity-75 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: option }}
                />
              ))}
            </div>
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
              Crear meta
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
