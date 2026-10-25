"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { apiRequest } from "@/lib/client";
import { INVESTMENT_TYPES } from "@/lib/constants";
import { todayISO } from "@/lib/utils";

export function InvestmentForm() {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<string>(INVESTMENT_TYPES[0]);
  const [institution, setInstitution] = useState("");
  const [invested, setInvested] = useState("");
  const [current, setCurrent] = useState("");
  const [startDate, setStartDate] = useState(todayISO());
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const investedAmount = Number(invested);
    const currentValue = current ? Number(current) : investedAmount;
    if (!Number.isFinite(investedAmount) || investedAmount < 0) {
      setError("Ingresa un monto invertido válido.");
      return;
    }
    if (!Number.isFinite(currentValue) || currentValue < 0) {
      setError("Ingresa un valor actual válido.");
      return;
    }
    setLoading(true);
    try {
      await apiRequest("/api/investments", {
        method: "POST",
        body: {
          name: name.trim(),
          type,
          institution: institution.trim() || null,
          invested_amount: investedAmount,
          current_value: currentValue,
          start_date: startDate,
          notes: notes.trim() || null,
        },
      });
      toast("Inversión registrada.");
      setOpen(false);
      setName("");
      setInvested("");
      setCurrent("");
      setInstitution("");
      setNotes("");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo registrar la inversión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn btn-primary">
        <Plus className="h-4 w-4" /> Nueva inversión
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nueva inversión"
        description="Registra cuánto invertiste y cuánto vale hoy para seguir tu rendimiento."
      >
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label" htmlFor="inv-name">
              Nombre
            </label>
            <input
              id="inv-name"
              required
              maxLength={80}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej. ETF S&P 500"
              className="field"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="inv-type">
                Tipo
              </label>
              <select
                id="inv-type"
                value={type}
                onChange={(event) => setType(event.target.value)}
                className="field"
              >
                {INVESTMENT_TYPES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="inv-institution">
                Plataforma
              </label>
              <input
                id="inv-institution"
                maxLength={60}
                value={institution}
                onChange={(event) => setInstitution(event.target.value)}
                placeholder="Ej. Hapi, BCP"
                className="field"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="inv-invested">
                Monto invertido
              </label>
              <input
                id="inv-invested"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                required
                value={invested}
                onChange={(event) => setInvested(event.target.value)}
                placeholder="0.00"
                className="field tnum"
              />
            </div>
            <div>
              <label className="label" htmlFor="inv-current">
                Valor actual
              </label>
              <input
                id="inv-current"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={current}
                onChange={(event) => setCurrent(event.target.value)}
                placeholder="Igual al invertido"
                className="field tnum"
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="inv-start">
              Fecha de inicio
            </label>
            <input
              id="inv-start"
              type="date"
              required
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="field"
            />
          </div>

          <div>
            <label className="label" htmlFor="inv-notes">
              Notas (opcional)
            </label>
            <input
              id="inv-notes"
              maxLength={200}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Ej. Aporte mensual automático"
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
              Guardar inversión
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
