import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Target } from "lucide-react";
import { BudgetForm } from "@/components/BudgetForm";
import { DeleteButton } from "@/components/DeleteButton";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { requireSessionUser } from "@/lib/auth";
import { getDashboard } from "@/lib/data";
import { categoryColor, formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BudgetsPage() {
  const user = await requireSessionUser();
  const dashboard = await getDashboard(user.id);
  const budgets = dashboard.budgets;
  const currency = user.currency;
  const categories = budgets.map((budget) => budget.category);

  const totalLimit = budgets.reduce((sum, budget) => sum + budget.monthly_limit, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const remaining = totalLimit - totalSpent;
  const progress = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;
  const exceeded = budgets.filter((budget) => budget.progress > 100).length;

  return (
    <>
      <PageHeader
        eyebrow={dashboard.monthName}
        title="Presupuestos"
        subtitle="Pon límites claros a tus gastos y entérate a tiempo si te estás pasando."
        actions={<BudgetForm existingCategories={categories} />}
      />

      {budgets.length > 0 && (
        <section className="card relative mb-4 overflow-hidden p-5 sm:p-6">
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-mint/80">
                Presupuestado
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-white tnum sm:text-3xl">
                {formatCurrency(totalLimit, currency, { decimals: false })}
              </p>
              <p className="mt-1 text-xs text-mist">
                {budgets.length} categoría{budgets.length === 1 ? "" : "s"}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
                Gastado
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-white tnum sm:text-3xl">
                {formatCurrency(totalSpent, currency, { decimals: false })}
              </p>
              <p className={`mt-1 text-xs ${exceeded > 0 ? "text-rose-300" : "text-slate-500"}`}>
                {exceeded > 0
                  ? `${exceeded} categoría${exceeded === 1 ? "" : "s"} excedida${exceeded === 1 ? "" : "s"}`
                  : "Todas dentro del límite"}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
                Disponible
              </p>
              <p
                className={`mt-2 text-2xl font-semibold tracking-tight tnum sm:text-3xl ${
                  remaining < 0 ? "text-rose-300" : "text-mint"
                }`}
              >
                {formatCurrency(remaining, currency, { decimals: false })}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {progress.toFixed(0)}% del presupuesto usado
              </p>
            </div>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-ink-700">
            <div
              className={`h-full rounded-full transition-all ${
                progress > 100 ? "bg-rose-400" : progress > 80 ? "bg-amber-400" : "bg-mint"
              }`}
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </section>
      )}

      {budgets.length === 0 ? (
        <EmptyState
          icon={<Target className="h-5 w-5" />}
          title="Aún no tienes presupuestos"
          description="Empieza con tus categorías más grandes, como alimentación, transporte o entretenimiento. Un límite mensual te ayuda a decidir mejor."
          action={<BudgetForm existingCategories={[]} />}
        />
      ) : (
        <section className="grid gap-3 sm:grid-cols-2">
          {budgets.map((budget) => {
            const color = categoryColor(budget.category);
            const isOver = budget.progress > 100;
            const isNear = budget.progress >= 80 && !isOver;
            const left = budget.monthly_limit - budget.spent;
            return (
              <article key={budget.id} className="card p-4 sm:p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className="h-8 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-semibold text-white">{budget.category}</h2>
                      <p className="text-[10px] text-slate-500">
                        {formatCurrency(budget.spent, currency, { decimals: false })} de{" "}
                        {formatCurrency(budget.monthly_limit, currency, { decimals: false })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isOver ? (
                      <span className="chip !border-rose-400/25 !bg-rose-500/10 !text-[9px] !text-rose-300">
                        <AlertTriangle className="h-2.5 w-2.5" /> Excedido
                      </span>
                    ) : isNear ? (
                      <span className="chip !border-amber-400/25 !bg-amber-500/10 !text-[9px] !text-amber-300">
                        Cerca
                      </span>
                    ) : (
                      <span className="chip !border-mint/20 !bg-mint/[0.06] !text-[9px] !text-mint">
                        <CheckCircle2 className="h-2.5 w-2.5" /> En orden
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-baseline justify-between gap-2">
                  <p className="text-lg font-semibold text-white tnum">
                    {budget.progress.toFixed(0)}%
                  </p>
                  <p
                    className={`text-[10px] tnum ${
                      isOver ? "text-rose-300" : "text-slate-500"
                    }`}
                  >
                    {isOver
                      ? `${formatCurrency(Math.abs(left), currency)} sobre el límite`
                      : `${formatCurrency(left, currency)} disponible`}
                  </p>
                </div>

                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-700">
                  <div
                    className={`h-full rounded-full ${
                      isOver ? "bg-rose-400" : isNear ? "bg-amber-400" : "bg-mint"
                    }`}
                    style={{ width: `${Math.min(100, budget.progress)}%` }}
                  />
                </div>

                <div className="mt-4 flex items-center justify-between gap-2 border-t border-line/60 pt-3">
                  <div className="flex items-center gap-2">
                    <BudgetForm
                      existingCategories={categories}
                      defaultCategory={budget.category}
                      triggerLabel="Ajustar"
                      triggerClassName="btn btn-ghost !px-2 !py-1 !text-[10px]"
                    />
                    <DeleteButton
                      url={`/api/budgets/${budget.id}`}
                      title="Eliminar presupuesto"
                      description={`Se eliminará el límite de ${budget.category}. Los movimientos registrados no se borran.`}
                      triggerLabel="Eliminar presupuesto"
                    />
                  </div>
                  <Link
                    href={`/movimientos?mes=${dashboard.monthKey}&categoria=${encodeURIComponent(budget.category)}&tipo=expense`}
                    className="inline-flex items-center gap-1 text-[10px] font-medium text-mist transition hover:text-mint"
                  >
                    Ver gastos <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      )}

      <section className="card-flat mt-4 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-400/10 text-sky-300">
            <Target className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">Regla 50 / 30 / 20</p>
            <p className="mt-1 text-[11px] leading-relaxed text-mist">
              Una guía simple: destina cerca del 50% de tus ingresos a necesidades, 30% a gustos y
              20% a ahorro o pago de deudas.
              {dashboard.income > 0 && (
                <>
                  {" "}
                  Con tus ingresos de {dashboard.monthName} (
                  {formatCurrency(dashboard.income, currency, { decimals: false })}), sería{" "}
                  <span className="text-slate-200">
                    {formatCurrency(dashboard.income * 0.5, currency, { decimals: false })}
                  </span>{" "}
                  /{" "}
                  <span className="text-slate-200">
                    {formatCurrency(dashboard.income * 0.3, currency, { decimals: false })}
                  </span>{" "}
                  /{" "}
                  <span className="text-slate-200">
                    {formatCurrency(dashboard.income * 0.2, currency, { decimals: false })}
                  </span>
                  .
                </>
              )}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
