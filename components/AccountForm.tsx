"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { apiRequest } from "@/lib/client";
import { ACCOUNT_COLORS, ACCOUNT_TYPES } from "@/lib/constants";

export function AccountForm({ currency = "PEN" }: { currency?: string }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("bank");
  const [initialBalance, setInitialBalance] = useState("");
  const [color, setColor] = useState(ACCOUNT_COLORS[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const parsed = Number(initialBalance || 0);
    if (!Number.isFinite(parsed)) {
      setError("Ingresa un saldo inicial válido.");
      return;
    }
    setLoading(true);
    try {
      await apiRequest("/api/accounts", {
        method: "POST",
        body: {
          name: name.trim(),
          type,
          initial_balance: parsed,
          color,
          currency,
        },
      });
      toast("Cuenta agregada.");
      setOpen(false);
      setName("");
      setInitialBalance("");
      setColor(ACCOUNT_COLORS[0]);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo crear la cuenta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn btn-secondary">
        <Plus className="h-4 w-4" /> Agregar cuenta
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nueva cuenta"
        description="Agrega el saldo que ya tienes hoy. Los movimientos lo actualizarán automáticamente."
      >
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label" htmlFor="account-name">
              Nombre
            </label>
            <input
              id="account-name"
              required
              maxLength={60}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej. Cuenta sueldo BCP"
              className="field"
            />
          </div>

          <div>
            <label className="label" htmlFor="account-type">
              Tipo de cuenta
            </label>
            <select
              id="account-type"
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="field"
            >
              {ACCOUNT_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="account-balance">
              Saldo actual
            </label>
            <input
              id="account-balance"
              type="number"
              step="0.01"
              inputMode="decimal"
              value={initialBalance}
              onChange={(event) => setInitialBalance(event.target.value)}
              placeholder="0.00"
              className="field tnum"
            />
          </div>

          <div>
            <span className="label">Color</span>
            <div className="flex flex-wrap gap-2">
              {ACCOUNT_COLORS.map((option) => (
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
              Crear cuenta
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
