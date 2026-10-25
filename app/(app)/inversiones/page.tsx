import {
  ArrowDownRight,
  ArrowUpRight,
  ChartCandlestick,
  Coins,
  Landmark,
  LineChart,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { DeleteButton } from "@/components/DeleteButton";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { InvestmentForm } from "@/components/InvestmentForm";
import { UpdateInvestmentButton } from "@/components/UpdateInvestmentButton";
import { requireSessionUser } from "@/lib/auth";
import { listInvestments } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TYPE_ICONS: Record<string, typeof LineChart> = {
  "Fondo mutuo": LineChart,
  Acciones: ChartCandlestick,
  ETF: TrendingUp,
  Criptomonedas: Coins,
  "Depósito a plazo": Landmark,
  Bonos: Wallet,
  Otros: Wallet,
};

export default async function InvestmentsPage() {
  const user = await requireSessionUser();
  const investments = await listInvestments(user.id);
  const currency = user.currency;
  const invested = investments.reduce((sum, item) => sum + item.invested_amount, 0);
  const current = investments.reduce((sum, item) => sum + item.current_value, 0);
  const gain = current - invested;
  const gainPct = invested > 0 ? (gain / invested) * 100 : 0;

  const byType = new Map<string, number>();
  for (const investment of investments) {
    byType.set(investment.type, (byType.get(investment.type) ?? 0) + investment.current_value);
  }
  const allocation = [...byType.entries()]
    .map(([type, value]) => ({
      type,
      value,
      percent: current > 0 ? (value / current) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  const palette = ["#2fe0a4", "#60a5fa", "#a78bfa", "#fbbf24", "#f472b6", "#fb923c", "#22d3ee"];

  return (
    <>
      <PageHeader
        eyebrow="Patrimonio"
        title="Inversiones"
        subtitle="Sigue lo que invertiste, cuánto vale hoy y el rendimiento real de tu portafolio."
        actions={<InvestmentForm />}
      />

      {investments.length > 0 ? (
        <>
          <section className="card relative mb-4 overflow-hidden p-5 sm:p-6">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-mint/[0.08] blur-3xl"
            />
            <div className="relative grid gap-5 sm:grid-cols-3 sm:items-end">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-mint/80">
                  Valor del portafolio
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-white tnum">
                  {formatCurrency(current, currency)}
                </p>
                <p className="mt-1 text-xs text-mist">
                  Invertido: {formatCurrency(invested, currency)}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
                  Rendimiento
                </p>
                <p
                  className={`mt-2 flex items-center gap-1.5 text-xl font-semibold tnum ${
                    gain >= 0 ? "text-mint" : "text-rose-300"
                  }`}
                >
                  {gain >= 0 ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  {gain >= 0 ? "+" : "−"}
                  {formatCurrency(Math.abs(gain), currency)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {gain >= 0 ? "+" : ""}
                  {gainPct.toFixed(1)}% total
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
                  Activos
                </p>
                <p className="mt-2 text-xl font-semibold text-white tnum">{investments.length}</p>
                <p className="mt-1 text-xs text-slate-500">
                  en {allocation.length} tipo{allocation.length === 1 ? "" : "s"} de inversión
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
            <div className="card p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-white">Mis inversiones</h2>
                  <p className="text-[11px] text-slate-500">
                    Actualiza el valor actual cuando quieras
                  </p>
                </div>
              </div>
              <ul className="divide-y divide-line/60">
                {investments.map((investment) => {
                  const Icon = TYPE_ICONS[investment.type] ?? LineChart;
                  const positive = investment.gain >= 0;
                  return (
                    <li key={investment.id} className="py-3.5 first:pt-0 last:pb-0">
                      <div className="flex items-start gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-slate-300">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-[13px] font-medium text-white">
                                {investment.name}
                              </p>
                              <p className="truncate text-[10px] text-slate-500">
                                {investment.type}
                                {investment.institution ? ` · ${investment.institution}` : ""} ·
                                desde {formatDate(investment.start_date)}
                              </p>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-[13px] font-semibold text-white tnum">
                                {formatCurrency(investment.current_value, currency)}
                              </p>
                              <p
                                className={`text-[10px] font-medium tnum ${
                                  positive ? "text-mint" : "text-rose-300"
                                }`}
                              >
                                {positive ? "+" : "−"}
                                {formatCurrency(Math.abs(investment.gain), currency)} ·{" "}
                                {positive ? "+" : ""}
                                {investment.gain_pct.toFixed(1)}%
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <span className="text-[10px] text-slate-500 tnum">
                              Invertido {formatCurrency(investment.invested_amount, currency)}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <UpdateInvestmentButton
                                id={investment.id}
                                name={investment.name}
                                currentValue={investment.current_value}
                                currency={currency}
                              />
                              <DeleteButton
                                url={`/api/investments/${investment.id}`}
                                title="Eliminar inversión"
                                description={`Se eliminará “${investment.name}” del portafolio. Tu dinero real no se modifica.`}
                                triggerLabel="Eliminar inversión"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="card p-4 sm:p-5">
              <h2 className="text-sm font-semibold text-white">Distribución</h2>
              <p className="text-[11px] text-slate-500">Por tipo de activo</p>
              <ul className="mt-4 space-y-4">
                {allocation.map((item, index) => (
                  <li key={item.type}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-2">
                      <span className="flex items-center gap-1.5 truncate text-[11px] text-slate-300">
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: palette[index % palette.length] }}
                        />
                        {item.type}
                      </span>
                      <span className="shrink-0 text-[10px] text-slate-500 tnum">
                        {item.percent.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-ink-700">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${item.percent}%`,
                          backgroundColor: palette[index % palette.length],
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-5 rounded-xl border border-line bg-ink-950/50 p-3">
                <p className="text-[10px] font-medium text-slate-300">Consejo</p>
                <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                  Diversificar reduce el riesgo. No pongas todo tu dinero en un solo activo y revisa
                  tus valores al menos una vez al mes.
                </p>
              </div>
            </div>
          </section>
        </>
      ) : (
        <EmptyState
          icon={<TrendingUp className="h-5 w-5" />}
          title="Empieza tu portafolio"
          description="Registra tu primera inversión: un depósito a plazo, un fondo mutuo o un ETF. Verás tu rendimiento en un solo lugar."
          action={<InvestmentForm />}
        />
      )}
    </>
  );
}
