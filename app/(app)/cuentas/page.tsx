import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  CreditCard,
  Landmark,
  PiggyBank,
  Plus,
  Smartphone,
  Wallet,
} from "lucide-react";
import { AccountForm } from "@/components/AccountForm";
import { Boarding } from "@/components/Boarding";
import { DeleteButton } from "@/components/DeleteButton";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { requireSessionUser } from "@/lib/auth";
import { listAccounts, listBankLinks } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TYPE_META: Record<string, { label: string; icon: typeof Wallet }> = {
  bank: { label: "Cuenta bancaria", icon: Landmark },
  wallet: { label: "Billetera digital", icon: Smartphone },
  cash: { label: "Efectivo", icon: Banknote },
  credit: { label: "Tarjeta de crédito", icon: CreditCard },
};

export default async function AccountsPage() {
  const user = await requireSessionUser();
  const accounts = await listAccounts(user.id);
  const links = await listBankLinks(user.id);
  const currency = user.currency;
  const total = accounts.reduce((sum, account) => sum + account.balance, 0);
  const linkedProviders = new Map(links.map((link) => [link.provider, link]));

  return (
    <>
      <PageHeader
        eyebrow="Patrimonio"
        title="Cuentas"
        subtitle="El saldo actualizado de todo tu dinero: bancos, billeteras y efectivo."
        actions={<AccountForm currency={currency} />}
      />

      <section className="card relative mb-4 overflow-hidden p-5 sm:p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-mint/10 blur-3xl"
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-mint/80">
              Total en cuentas
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-white tnum sm:text-4xl">
              {formatCurrency(total, currency)}
            </p>
            <p className="mt-1.5 text-xs text-mist">
              {accounts.length} cuenta{accounts.length === 1 ? "" : "s"} · {links.length}{" "}
              {links.length === 1 ? "conexión bancaria" : "conexiones bancarias"}
            </p>
          </div>
          <Link href="/bancos" className="btn btn-secondary shrink-0">
            <Plus className="h-4 w-4" /> Conectar banco
          </Link>
        </div>

        {accounts.length > 0 && (
          <div className="relative mt-5 flex h-2 overflow-hidden rounded-full bg-ink-700">
            {accounts.map((account) => {
              const share = total > 0 ? Math.max(0, account.balance / total) : 0;
              if (share <= 0) return null;
              return (
                <div
                  key={account.id}
                  style={{ width: `${share * 100}%`, backgroundColor: account.color }}
                  title={`${account.name}: ${formatCurrency(account.balance, currency)}`}
                />
              );
            })}
          </div>
        )}
      </section>

      {accounts.length === 0 ? (
        <EmptyState
          icon={<Wallet className="h-5 w-5" />}
          title="Aún no tienes cuentas"
          description="Agrega una cuenta bancaria, tu billetera Yape o tu efectivo para empezar a controlar tus saldos."
          action={<AccountForm currency={currency} />}
        />
      ) : (
        <section className="grid gap-3 sm:grid-cols-2">
          {accounts.map((account) => {
            const meta = TYPE_META[account.type] ?? TYPE_META.bank;
            const Icon = meta.icon;
            const linked = account.institution ? linkedProviders.get(account.institution) : undefined;
            return (
              <article key={account.id} className="card group relative overflow-hidden p-4 sm:p-5">
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${account.color}60, transparent)`,
                  }}
                />
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border"
                      style={{
                        backgroundColor: `${account.color}15`,
                        borderColor: `${account.color}30`,
                        color: account.color,
                      }}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate text-[13px] font-semibold text-white">{account.name}</h2>
                      <p className="truncate text-[10px] text-slate-500">
                        {meta.label}
                        {account.number ? ` · ${account.number}` : ""}
                      </p>
                    </div>
                  </div>
                  <DeleteButton
                    url={`/api/accounts/${account.id}`}
                    title="Eliminar cuenta"
                    description={`Se eliminarán la cuenta “${account.name}” y todos sus movimientos. Los saldos de tus otras cuentas no cambian.`}
                    triggerLabel="Eliminar cuenta"
                  />
                </div>

                <p
                  className={`mt-4 text-2xl font-semibold tracking-tight tnum ${
                    account.balance < 0 ? "text-rose-300" : "text-white"
                  }`}
                >
                  {formatCurrency(account.balance, account.currency)}
                </p>

                <div className="mt-4 flex items-center justify-between gap-2 border-t border-line/60 pt-3">
                  <div className="flex items-center gap-1.5">
                    {linked ? (
                      <span className="chip !border-mint/20 !bg-mint/[0.06] !text-[10px] !text-mint">
                        <span className="h-1 w-1 rounded-full bg-mint" /> Conectada
                      </span>
                    ) : (
                      <span className="chip !text-[10px]">Manual</span>
                    )}
                    <span className="chip !text-[10px]">{account.currency}</span>
                  </div>
                  <Link
                    href={`/movimientos?cuenta=${account.id}`}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-mist transition hover:text-mint"
                  >
                    Movimientos <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      )}

      <section className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="card-flat flex items-start gap-3 p-4">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-400/10 text-sky-300">
            <Landmark className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-semibold text-white">Saldos siempre al día</p>
            <p className="mt-1 text-[11px] leading-relaxed text-mist">
              Cada ingreso o gasto que registras actualiza el saldo de su cuenta automáticamente.
              También puedes importar movimientos desde Bancos.
            </p>
          </div>
        </div>
        <div className="card-flat flex items-start gap-3 p-4">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
            <PiggyBank className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-semibold text-white">Ahorros aparte de tus cuentas</p>
            <p className="mt-1 text-[11px] leading-relaxed text-mist">
              Las metas de ahorro te ayudan a reservar dinero sin afectar el saldo real de tus
              cuentas.
            </p>
          </div>
        </div>
      </section>

      {accounts.length > 0 && (
        <Boarding
          title="¿Quieres agregar una cuenta de otro banco?"
          description="Crea una cuenta manual o conecta BCP, Banco de la Nación y Yape en modo demostración."
          action={
            <Link href="/bancos" className="btn btn-secondary">
              Ir a conexiones
            </Link>
          }
        />
      )}
    </>
  );
}
