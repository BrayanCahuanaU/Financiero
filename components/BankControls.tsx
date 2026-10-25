"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FlaskConical, Link2, Loader2, RefreshCw, ShieldCheck, Unplug } from "lucide-react";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { apiRequest } from "@/lib/client";

export type BankCard = {
  id: "bcp" | "bn" | "yape";
  name: string;
  fullName: string;
  description: string;
  kind: "bank" | "wallet";
  color: string;
  soft: string;
};

export function BankConnectButton({ provider }: { provider: BankCard }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function connect() {
    setError("");
    if (!accepted) {
      setError("Marca la casilla para continuar.");
      return;
    }
    setLoading(true);
    try {
      const result = await apiRequest<{ imported: number }>("/api/banks/connect", {
        method: "POST",
        body: { provider: provider.id },
      });
      setOpen(false);
      setAccepted(false);
      toast(
        `${provider.name} conectado · ${result.imported} movimientos importados.`,
        "success",
      );
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo conectar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-secondary w-full"
      >
        <Link2 className="h-4 w-4" /> Conectar
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`Conectar ${provider.name}`}
        description={`${provider.fullName} · ${provider.kind === "wallet" ? "Billetera digital" : "Cuenta bancaria"}`}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-400/20 bg-amber-500/[0.07] p-3">
            <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            <div>
              <p className="text-xs font-semibold text-amber-200">Conexión en modo demostración</p>
              <p className="mt-1 text-[11px] leading-relaxed text-amber-100/70">
                BCP, Banco de la Nación y Yape todavía no ofrecen una API pública de open banking.
                Esta conexión importa movimientos de ejemplo para que pruebes el seguimiento
                bancario. Nunca ingresamos ni guardamos tus claves reales.
              </p>
            </div>
          </div>

          <ul className="space-y-2 text-xs text-slate-300">
            {[
              "Se crea una cuenta con tu saldo simulado.",
              "Importamos los últimos 150 días de movimientos.",
              "Luego podrás sincronizar para traer novedades.",
              "Puedes desconectar en cualquier momento.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mint" />
                {item}
              </li>
            ))}
          </ul>

          <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-line bg-ink-950/50 p-3 text-[11px] leading-relaxed text-slate-300">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(event) => setAccepted(event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-line bg-ink-900 accent-[#2fe0a4]"
            />
            Entiendo que esta es una simulación y que los datos importados son de ejemplo.
          </label>

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
            <button type="button" onClick={connect} className="btn btn-primary" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Conectar en modo demo
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export function SyncBankButton({
  provider,
  label = "Sincronizar",
  iconOnly = false,
}: {
  provider: BankCard;
  label?: string;
  iconOnly?: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  async function sync() {
    setLoading(true);
    try {
      const result = await apiRequest<{ imported: number }>("/api/banks/sync", {
        method: "POST",
        body: { provider: provider.id },
      });
      toast(
        result.imported > 0
          ? `${result.imported} movimientos nuevos de ${provider.name}.`
          : `${provider.name} está al día. No hay movimientos nuevos.`,
        "info",
      );
      router.refresh();
    } catch (caught) {
      toast(caught instanceof Error ? caught.message : "No se pudo sincronizar.", "error");
    } finally {
      setLoading(false);
    }
  }

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={sync}
        disabled={loading}
        className="btn btn-secondary !px-2.5"
        title="Sincronizar movimientos"
        aria-label="Sincronizar movimientos"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
      </button>
    );
  }

  return (
    <button type="button" onClick={sync} disabled={loading} className="btn btn-secondary">
      <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
      {label}
    </button>
  );
}

export function DisconnectBankButton({ provider }: { provider: BankCard }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function disconnect() {
    setLoading(true);
    try {
      await apiRequest(`/api/banks/${provider.id}`, { method: "DELETE" });
      setOpen(false);
      toast(`${provider.name} desconectado. Tus movimientos se conservan.`, "info");
      router.refresh();
    } catch (caught) {
      toast(caught instanceof Error ? caught.message : "No se pudo desconectar.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="icon-btn"
        title="Desconectar banco"
        aria-label="Desconectar banco"
      >
        <Unplug className="h-4 w-4" />
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`Desconectar ${provider.name}`}
        description="Dejaremos de sincronizar movimientos nuevos. Las cuentas y movimientos ya importados se mantienen en tu historial."
      >
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancelar
          </button>
          <button type="button" onClick={disconnect} className="btn btn-danger" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Desconectar
          </button>
        </div>
      </Modal>
    </>
  );
}
