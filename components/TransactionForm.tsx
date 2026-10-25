"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowDownLeft, ArrowUpRight, Loader2, Plus } from "lucide-react";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { apiRequest } from "@/lib/client";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/constants";
import { todayISO } from "@/lib/utils";

export type AccountOption = {
  id: string;
  name: string;
  color: string;
  institution: string | null;
};

export function TransactionForm({
  accounts,
  autoOpen = false,
  defaultType = "expense",
  triggerLabel = "Nuevo movimiento",
  triggerClassName = "btn btn-primary",
  currency = "PEN",
}: {
  accounts: AccountOption[];
  autoOpen?: boolean;
  defaultType?: "income" | "expense";
  triggerLabel?: string;
  triggerClassName?: string;
  currency?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const [open, setOpen] = useState(autoOpen);
  const [type, setType] = useState<"income" | "expense">(defaultType);
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [category, setCategory] = useState<string>(
    defaultType === "income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0],
  );
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (autoOpen) {
      router.replace(pathname, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "S/";

  function openModal() {
    setError("");
    setDescription("");
    setAmount("");
    setCategory(type === "income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
    setDate(todayISO());
    if (!accountId && accounts[0]) setAccountId(accounts[0].id);
    setOpen(true);
  }

  function changeType(next: "income" | "expense") {
    setType(next);
    setCategory(next === "income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const parsed = Number(amount);
    if (!accountId) {
      setError("Primero agrega una cuenta.");
      return;
    }
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Ingresa un monto mayor a cero.");
      return;
    }
    if (description.trim().length < 3) {
      setError("Describe el movimiento con al menos 3 caracteres.");
      return;
    }

    setLoading(true);
    try {
      await apiRequest("/api/transactions", {
        method: "POST",
        body: {
          account_id: accountId,
          type,
          category,
          description: description.trim(),
          amount: parsed,
          date,
        },
      });
      setOpen(false);
      toast(type === "income" ? "Ingreso registrado." : "Gasto registrado.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo guardar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button type="button" onClick={openModal} className={triggerClassName}>
        <Plus className="h-4 w-4" strokeWidth={2.4} />
        {triggerLabel}
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nuevo movimiento"
        description="Registra un ingreso o gasto. Se reflejará al instante en tu saldo."
      >
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-line bg-ink-950/60 p-1">
            <button
              type="button"
              onClick={() => changeType("expense")}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
                type === "expense"
                  ? "bg-rose-500/15 text-rose-300"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <ArrowUpRight className="h-3.5 w-3.5" /> Gasto
            </button>
            <button
              type="button"
              onClick={() => changeType("income")}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
                type === "income"
                  ? "bg-mint/15 text-mint"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <ArrowDownLeft className="h-3.5 w-3.5" /> Ingreso
            </button>
          </div>

          <div>
            <label className="label" htmlFor="tx-amount">
              Monto
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                {symbol}
              </span>
              <input
                id="tx-amount"
                type="number"
                inputMode="decimal"
                min="0.01"
                step="0.01"
                required
                autoFocus
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.00"
                className="field !py-3 pl-10 !text-lg font-semibold tnum"
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="tx-description">
              Descripción
            </label>
            <input
              id="tx-description"
              required
              maxLength={120}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={type === "income" ? "Ej. Sueldo de setiembre" : "Ej. Almuerzo en el mercado"}
              className="field"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="tx-category">
                Categoría
              </label>
              <select
                id="tx-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="field"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="tx-account">
                Cuenta
              </label>
              <select
                id="tx-account"
                value={accountId}
                onChange={(event) => setAccountId(event.target.value)}
                className="field"
              >
                {accounts.length === 0 && <option value="">Sin cuentas</option>}
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label" htmlFor="tx-date">
              Fecha
            </label>
            <input
              id="tx-date"
              type="date"
              required
              value={date}
              onChange={(event) => setDate(event.target.value)}
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
              Guardar movimiento
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
