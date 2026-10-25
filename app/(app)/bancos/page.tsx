import Link from "next/link";
import {
  ArrowRight,
  ArrowLeftRight,
  CheckCircle2,
  FlaskConical,
  Landmark,
  RefreshCw,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { BankConnectButton, DisconnectBankButton, SyncBankButton, type BankCard } from "@/components/BankControls";
import { PageHeader } from "@/components/PageHeader";
import { requireSessionUser } from "@/lib/auth";
import { BANK_LIST } from "@/lib/banks";
import { listBankLinks } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

function formatSync(iso: string | null) {
  if (!iso) return "Sin sincronizar";
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Lima",
  }).format(new Date(iso));
}

export default async function BanksPage() {
  const user = await requireSessionUser();
  const links = await listBankLinks(user.id);
  const currency = user.currency;
  const connected = new Map(links.map((link) => [link.provider, link]));
  const totalImported = links.reduce((sum, link) => sum + link.movement_count, 0);

  return (
    <>
      <PageHeader
        eyebrow="Conexiones"
        title="Bancos y Yape"
        subtitle="Trae tus movimientos y saldos de un solo lugar. BCP, Banco de la Nación y Yape."
      />

      <section className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-500/[0.06] p-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
          <FlaskConical className="h-4 w-4" />
        </span>
        <div>
          <p className="text-xs font-semibold text-amber-200">Modo demostración de conexiones</p>
          <p className="mt-1 max-w-3xl text-[11px] leading-relaxed text-amber-100/70">
            Los bancos peruanos todavía no ofrecen una API pública de open banking. Para que puedas
            probar el seguimiento bancario, estas conexiones importan movimientos de ejemplo.
            <span className="text-amber-100"> Nunca te pedimos ni guardamos tus claves reales.</span>{" "}
            La arquitectura ya está preparada para conectar APIs oficiales cuando estén disponibles.
          </p>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {BANK_LIST.map((provider) => {
          const link = connected.get(provider.id);
          const isWallet = provider.kind === "wallet";
          const Icon = isWallet ? Smartphone : Landmark;
          const card: BankCard = {
            id: provider.id,
            name: provider.name,
            fullName: provider.fullName,
            description: provider.description,
            kind: provider.kind,
            color: provider.color,
            soft: provider.soft,
          };
          return (
            <article key={provider.id} className="card flex flex-col p-4 sm:p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-xl border"
                    style={{
                      backgroundColor: provider.soft,
                      borderColor: `${provider.color}35`,
                      color: provider.color,
                    }}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold text-white">{provider.name}</h2>
                    <p className="text-[10px] text-slate-500">{provider.fullName}</p>
                  </div>
                </div>
                {link ? (
                  <span className="chip !border-mint/20 !bg-mint/[0.06] !text-[9px] !text-mint">
                    <span className="h-1 w-1 rounded-full bg-mint" /> Conectado
                  </span>
                ) : (
                  <span className="chip !text-[9px]">No conectado</span>
                )}
              </div>

              <p className="mt-3 min-h-[2.3rem] text-[11px] leading-relaxed text-mist">
                {provider.description}
              </p>

              {link ? (
                <div className="mt-3 space-y-1.5 rounded-xl border border-line bg-ink-950/50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[10px] text-slate-500">Saldo</span>
                    <span className="text-xs font-semibold text-white tnum">
                      {formatCurrency(link.account_balance, currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-500">Movimientos</span>
                    <span className="text-[10px] text-slate-300 tnum">{link.movement_count}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-500">Última sincronización</span>
                    <span className="text-[10px] text-slate-300">{formatSync(link.last_sync_at)}</span>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-line bg-ink-950/30 p-3 text-[10px] text-slate-500">
                  <CheckCircle2 className="h-3.5 w-3.5 text-slate-600" />
                  Conecta para importar tus últimos 150 días
                </div>
              )}

              <div className="mt-auto flex items-center gap-2 pt-4">
                {link ? (
                  <>
                    <div className="flex-1">
                      <SyncBankButton provider={card} label="Sincronizar" />
                    </div>
                    <Link
                      href={`/movimientos?cuenta=${link.account_id}`}
                      className="icon-btn"
                      aria-label="Ver movimientos"
                      title="Ver movimientos"
                    >
                      <ArrowLeftRight className="h-4 w-4" />
                    </Link>
                    <DisconnectBankButton provider={card} />
                  </>
                ) : (
                  <div className="w-full">
                    <BankConnectButton provider={card} />
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Resumen de conexiones</h2>
              <p className="text-[11px] text-slate-500">Sincronización y datos importados</p>
            </div>
            <span className="chip">{links.length}/3 activas</span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-line bg-ink-950/40 p-3">
              <p className="text-[10px] text-slate-500">Movimientos importados</p>
              <p className="mt-1 text-lg font-semibold text-white tnum">{totalImported}</p>
            </div>
            <div className="rounded-xl border border-line bg-ink-950/40 p-3">
              <p className="text-[10px] text-slate-500">Saldo conectado</p>
              <p className="mt-1 text-lg font-semibold text-white tnum">
                {formatCurrency(
                  links.reduce((sum, link) => sum + link.account_balance, 0),
                  currency,
                  { decimals: false },
                )}
              </p>
            </div>
          </div>

          <p className="mt-4 text-[10px] leading-relaxed text-slate-500">
            Al sincronizar, evitamos duplicados usando un identificador único por movimiento. Puedes
            desconectar una entidad sin perder tu historial.
          </p>
        </div>

        <div className="card p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-white">¿Cómo funciona?</h2>
          <ol className="mt-4 space-y-3.5">
            {[
              {
                icon: Landmark,
                title: "1. Conecta tu entidad",
                text: "Elige BCP, Banco de la Nación o Yape. En esta versión se simula la autorización.",
              },
              {
                icon: RefreshCw,
                title: "2. Sincroniza cuando quieras",
                text: "Importamos movimientos nuevos sin duplicar los que ya tienes registrados.",
              },
              {
                icon: ArrowRight,
                title: "3. Analiza y decide",
                text: "Los movimientos se suman a tus saldos, presupuestos y reportes al instante.",
              },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-mint">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-200">{step.title}</p>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-slate-500">{step.text}</p>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-4 flex items-start gap-2 rounded-xl border border-sky-400/15 bg-sky-400/[0.05] p-3">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-300" />
            <p className="text-[10px] leading-relaxed text-sky-100/70">
              Tu sesión viaja en una cookie segura y privada. Tus datos financieros solo son
              visibles cuando inicias sesión con tu cuenta.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
