"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, ShieldAlert, Trash2 } from "lucide-react";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { apiRequest } from "@/lib/client";
import { CURRENCIES } from "@/lib/constants";

export function ProfileForm({ name: initialName, currency: initialCurrency }: { name: string; currency: string }) {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState(initialName);
  const [currency, setCurrency] = useState(initialCurrency);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiRequest("/api/profile", {
        method: "PATCH",
        body: { name: name.trim(), currency },
      });
      toast("Perfil actualizado.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo actualizar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label" htmlFor="profile-name">
          Nombre
        </label>
        <input
          id="profile-name"
          required
          maxLength={80}
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="field"
        />
      </div>
      <div>
        <label className="label" htmlFor="profile-currency">
          Moneda principal
        </label>
        <select
          id="profile-currency"
          value={currency}
          onChange={(event) => setCurrency(event.target.value)}
          className="field"
        >
          {CURRENCIES.map((item) => (
            <option key={item.code} value={item.code}>
              {item.label} ({item.symbol})
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p className="rounded-lg border border-rose-400/25 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Guardar cambios
      </button>
    </form>
  );
}

export function PasswordForm() {
  const toast = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (next.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (next !== confirm) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }
    setLoading(true);
    try {
      await apiRequest("/api/profile/password", {
        method: "POST",
        body: { current_password: current, new_password: next },
      });
      toast("Contraseña actualizada.");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo cambiar la contraseña.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label" htmlFor="current-password">
          Contraseña actual
        </label>
        <input
          id="current-password"
          type="password"
          required
          autoComplete="current-password"
          value={current}
          onChange={(event) => setCurrent(event.target.value)}
          className="field"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="new-password">
            Nueva contraseña
          </label>
          <input
            id="new-password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={next}
            onChange={(event) => setNext(event.target.value)}
            className="field"
          />
        </div>
        <div>
          <label className="label" htmlFor="confirm-password">
            Repite la nueva
          </label>
          <input
            id="confirm-password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            className="field"
          />
        </div>
      </div>
      {error && (
        <p className="rounded-lg border border-rose-400/25 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-secondary" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Cambiar contraseña
      </button>
    </form>
  );
}

export function ResetDataButton() {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function reset() {
    setError("");
    if (confirm !== "BORRAR") {
      setError("Escribe BORRAR exactamente para confirmar.");
      return;
    }
    setLoading(true);
    try {
      await apiRequest("/api/data/reset", { method: "POST", body: { confirm } });
      setOpen(false);
      setConfirm("");
      toast("Tus datos financieros fueron eliminados.", "info");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo eliminar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn btn-danger">
        <Trash2 className="h-4 w-4" /> Borrar mis datos
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Borrar datos financieros"
        description="Se eliminarán cuentas, movimientos, ahorros, inversiones y presupuestos. Tu usuario y contraseña se mantienen."
      >
        <div className="space-y-4">
          <div className="flex items-start gap-2.5 rounded-xl border border-rose-400/25 bg-rose-500/[0.08] p-3 text-[11px] leading-relaxed text-rose-100/80">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
            Esta acción no se puede deshacer. Escribe <strong className="text-rose-100">BORRAR</strong> para
            confirmar.
          </div>
          <input
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            placeholder="BORRAR"
            className="field"
            autoComplete="off"
          />
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
            <button type="button" onClick={reset} className="btn btn-danger" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Eliminar todo
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <button type="button" onClick={logout} className="btn btn-secondary" disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
      Cerrar sesión
    </button>
  );
}
