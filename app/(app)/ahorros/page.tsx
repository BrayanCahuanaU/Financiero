import { CalendarDays, CheckCircle2, PiggyBank, Target } from "lucide-react";
import { Boarding } from "@/components/Boarding";
import { ContributionForm } from "@/components/ContributionForm";
import { DeleteButton } from "@/components/DeleteButton";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { GoalForm } from "@/components/GoalForm";
import { requireSessionUser } from "@/lib/auth";
import { listGoals } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SavingsPage() {
  const user = await requireSessionUser();
  const goals = await listGoals(user.id);
  const currency = user.currency;
  const saved = goals.reduce((sum, goal) => sum + goal.saved_amount, 0);
  const target = goals.reduce((sum, goal) => sum + goal.target_amount, 0);
  const progress = target > 0 ? Math.min(100, (saved / target) * 100) : 0;
  const completed = goals.filter((goal) => goal.progress >= 100).length;

  return (
    <>
      <PageHeader
        eyebrow="Patrimonio"
        title="Ahorros"
        subtitle="Convierte tus propósitos en metas con monto, fecha y aportes que sí puedes seguir."
        actions={<GoalForm />}
      />

      {goals.length > 0 && (
        <section className="card relative mb-4 overflow-hidden p-5 sm:p-6">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-24 h-64 w-64 rounded-full bg-amber-400/[0.07] blur-3xl"
          />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-amber-300/90">
                Ahorro acumulado
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-white tnum sm:text-4xl">
                {formatCurrency(saved, currency)}
              </p>
              <p className="mt-1.5 text-xs text-mist">
                de {formatCurrency(target, currency)} en {goals.length} meta
                {goals.length === 1 ? "" : "s"}
                {completed > 0 ? ` · ${completed} completada${completed === 1 ? "" : "s"}` : ""}
              </p>
            </div>
            <div className="w-full max-w-xs">
              <div className="mb-1.5 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Progreso general</span>
                <span className="font-semibold text-amber-300 tnum">{progress.toFixed(0)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-ink-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-mint transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {goals.length === 0 ? (
        <EmptyState
          icon={<PiggyBank className="h-5 w-5" />}
          title="Tu primera meta te espera"
          description="Crea una meta para un viaje, tu fondo de emergencia o ese curso que quieres llevar. Define cuánto necesitas y empieza a aportar."
          action={<GoalForm />}
        />
      ) : (
        <section className="grid gap-3 sm:grid-cols-2">
          {goals.map((goal) => {
            const remaining = Math.max(0, goal.target_amount - goal.saved_amount);
            const done = goal.progress >= 100;
            return (
              <article key={goal.id} className="card relative overflow-hidden p-4 sm:p-5">
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${goal.color}80, transparent)`,
                  }}
                />
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-2.5">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border"
                      style={{
                        backgroundColor: `${goal.color}15`,
                        borderColor: `${goal.color}35`,
                        color: goal.color,
                      }}
                    >
                      {done ? <CheckCircle2 className="h-4 w-4" /> : <Target className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-semibold text-white">{goal.name}</h2>
                      {goal.note && (
                        <p className="mt-0.5 line-clamp-1 text-[10px] text-slate-500">{goal.note}</p>
                      )}
                    </div>
                  </div>
                  <DeleteButton
                    url={`/api/goals/${goal.id}`}
                    title="Eliminar meta"
                    description={`Se eliminará “${goal.name}” y su historial de aportes. El dinero de tus cuentas no se modifica.`}
                    triggerLabel="Eliminar meta"
                  />
                </div>

                <div className="mt-4 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xl font-semibold tracking-tight text-white tnum sm:text-2xl">
                      {formatCurrency(goal.saved_amount, currency)}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-500">
                      de {formatCurrency(goal.target_amount, currency)}
                    </p>
                  </div>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold tnum"
                    style={{ backgroundColor: `${goal.color}18`, color: goal.color }}
                  >
                    {goal.progress.toFixed(0)}%
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink-700">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, goal.progress)}%`, backgroundColor: goal.color }}
                  />
                </div>

                <div className="mt-4 flex items-center justify-between gap-2 border-t border-line/60 pt-3">
                  <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                    <CalendarDays className="h-3 w-3" />
                    {goal.deadline ? formatDate(goal.deadline) : "Sin fecha límite"}
                  </span>
                  {done ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-mint">
                      <CheckCircle2 className="h-3 w-3" /> Meta completada
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 tnum">
                      Faltan {formatCurrency(remaining, currency, { decimals: false })}
                    </span>
                  )}
                  <ContributionForm goalId={goal.id} goalName={goal.name} />
                </div>
              </article>
            );
          })}
        </section>
      )}

      <Boarding
        title="El mejor ahorro es el que automatizas"
        description="Aporta a tus metas apenas recibes tu sueldo. Pequeños montos constantes hacen más que un gran aporte de vez en cuando."
        action={<GoalForm />}
      />
    </>
  );
}
