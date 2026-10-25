import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Landmark,
  PiggyBank,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { CategoryDonut, CashflowChart } from "@/components/Charts";
import { PageHeader } from "@/components/PageHeader";
import { TransactionForm } from "@/components/TransactionForm";
import { EmptyState } from "@/components/EmptyState";
import { requireSessionUser } from "@/lib/auth";
import { getDashboard } from "@/lib/data";
import { formatCurrency, relativeDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

function greeting() {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: "America/Lima",
    }).format(new Date()),
  );
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

function delta(current: number, previous: number) {
  if (previous <= 0) return null;
  return ((current - previous) / previous) * 100;
}

function DeltaBadge({ value, invert = false }: { value: number | null; invert?: boolean }) {
  if (value === null) {
    return <span className="text-[10px] text-slate-500">Sin comparativo</span>;
  }
  const positive = invert ? value <= 0 : value >= 0;
  const Icon = value >= 0 ? TrendingUp : TrendingDown;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-medium ${
        positive ? "text-mint" : "text-rose-300"
      }`}
    >
      <Icon className="h-3 w-3" />
      {Math.abs(value).toFixed(1)}% vs mes anterior
    </span>
  );
}

export default async function DashboardPage() {
  const user = await requireSessionUser();
  const d = await getDashboard(user.id);
  const currency = user.currency;
  const firstName = user.name.split(" ")[0];
  const incomeDelta = delta(d.income, d.prevIncome);
  const expenseDelta = delta(d.expense, d.prevExpense);
  const overBudget = d.budgets.some((budget) => budget.progress > 100);

  const kpis = [
    {
      label: "Patrimonio neto",
      value: d.netWorth,
      hint: `Cuentas ${formatCurrency(d.totalBalance, currency, { decimals: false })} · Inversiones ${formatCurrency(d.investmentValue, currency, { decimals: false })}`,
      icon: Wallet,
      accent: "text-mint",
      bg: "bg-mint/10",
    },
    {
      label: "Ingresos del mes",
      value: d.income,
      hint: `${d.txCount} movimientos registrados`,
      icon: ArrowDownLeft,
      accent: "text-sky-300",
      bg: "bg-sky-400/10",
      badge: <DeltaBadge value={incomeDelta} />,
    },
    {
      label: "Gastos del mes",
      value: d.expense,
      hint:
        d.income > 0
          ? `${((d.expense / d.income) * 100).toFixed(0)}% de tus ingresos`
          : "Sin ingresos registrados",
      icon: ArrowUpRight,
      accent: "text-rose-300",
      bg: "bg-rose-400/10",
      badge: <DeltaBadge value={expenseDelta} invert />,
    },
    {
      label: "Ahorro del mes",
      value: d.savings,
      hint:
        d.income > 0
          ? `Tasa de ahorro ${d.savingsRate.toFixed(0)}%`
          : "Registra ingresos para calcularla",
      icon: PiggyBank,
      accent: d.savings >= 0 ? "text-amber-300" : "text-rose-300",
      bg: d.savings >= 0 ? "bg-amber-400/10" : "bg-rose-400/10",
      negative: d.savings < 0,
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow={d.monthName}
        title={`${greeting()}, ${firstName}`}
        subtitle="Así se mueven tus finanzas este mes. Todo lo importante, de un vistazo."
        actions={
          <>
            <Link href="/movimientos" className="btn btn-secondary">
              Ver movimientos
            </Link>
            <TransactionForm accounts={d.accounts} currency={currency} />
          </>
        }
      />

      {d.txCount === 0 && (
        <div className="card mb-5 flex flex-col gap-4 border-mint/20 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mint/10 text-mint">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Empieza en 2 minutos</p>
              <p className="mt-0.5 text-xs text-mist">
                Crea una cuenta y registra tu primer movimiento manual.
              </p>
            </div>
          </div>
          <Link
            href={d.accounts.length === 0 ? "/cuentas" : "/movimientos?nuevo=1"}
            className="btn btn-primary shrink-0"
          >
            {d.accounts.length === 0 ? "Crear mi primera cuenta" : "Registrar movimiento"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="card flex flex-col p-4 sm:p-5">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-medium text-mist">{kpi.label}</span>
                <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${kpi.bg} ${kpi.accent}`}>
                  <Icon className="h-3.5 w-3.5" />
                </span>
              </div>
              <p
                className={`mt-2.5 text-[1.35rem] font-semibold leading-tight tracking-tight tnum sm:text-2xl ${
                  kpi.negative ? "text-rose-300" : "text-white"
                }`}
              >
                {formatCurrency(kpi.value, currency, { decimals: false })}
              </p>
              <div className="mt-auto pt-2">
                {kpi.badge ?? <p className="line-clamp-2 text-[10px] leading-relaxed text-slate-500">{kpi.hint}</p>}
              </div>
            </div>
          );
        })}
      </section>

      <section className="mt-4 grid gap-4 lg:mt-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="card p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-white">Flujo de caja</h2>
              <p className="text-[11px] text-slate-500">Ingresos y gastos de los últimos 6 meses</p>
            </div>
            <Link href="/movimientos" className="text-[11px] font-medium text-mint hover:text-mint-bright">
              Ver detalle
            </Link>
          </div>
          <CashflowChart series={d.series} currency={currency} />
        </div>

        <div className="card p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-white">Gastos por categoría</h2>
              <p className="text-[11px] text-slate-500">{d.monthName}</p>
            </div>
            <Link href="/presupuestos" className="text-[11px] font-medium text-mint hover:text-mint-bright">
              Presupuestos
            </Link>
          </div>
          <CategoryDonut
            total={d.expense}
            currency={currency}
            slices={d.categories.map((category) => ({
              label: category.category,
              value: category.total,
              color: category.color,
            }))}
          />
        </div>
      </section>

      <section className="mt-4 grid gap-4 lg:mt-5 lg:grid-cols-2">
        <div className="card p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Mis cuentas</h2>
              <p className="text-[11px] text-slate-500">Saldos actualizados al día</p>
            </div>
            <Link href="/cuentas" className="text-[11px] font-medium text-mint hover:text-mint-bright">
              Ver todas
            </Link>
          </div>

          {d.accounts.length === 0 ? (
            <EmptyState
              icon={<Wallet className="h-5 w-5" />}
              title="Sin cuentas todavía"
              description="Agrega una cuenta para empezar a seguir tus saldos."
              action={
                <Link href="/cuentas" className="btn btn-secondary">
                  Agregar cuenta
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-line/60">
              {d.accounts.slice(0, 4).map((account) => (
                <li key={account.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border"
                    style={{
                      backgroundColor: `${account.color}18`,
                      borderColor: `${account.color}30`,
                      color: account.color,
                    }}
                  >
                    {account.type === "wallet" ? (
                      <PiggyBank className="h-3.5 w-3.5" />
                    ) : account.type === "cash" ? (
                      <Wallet className="h-3.5 w-3.5" />
                    ) : (
                      <Landmark className="h-3.5 w-3.5" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-slate-200">{account.name}</p>
                    <p className="truncate text-[10px] text-slate-500">
                      {account.number ?? "Saldo manual"}
                    </p>
                  </div>
                  <span
                    className={`text-[13px] font-semibold tnum ${
                      account.balance < 0 ? "text-rose-300" : "text-white"
                    }`}
                  >
                    {formatCurrency(account.balance, account.currency)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Metas de ahorro</h2>
              <p className="text-[11px] text-slate-500">
                {formatCurrency(d.goalsSaved, currency, { decimals: false })} de{" "}
                {formatCurrency(d.goalsTarget, currency, { decimals: false })}
              </p>
            </div>
            <Link href="/ahorros" className="text-[11px] font-medium text-mint hover:text-mint-bright">
              Ver metas
            </Link>
          </div>

          {d.goals.length === 0 ? (
            <EmptyState
              icon={<Target className="h-5 w-5" />}
              title="Crea tu primera meta"
              description="Ahorrar es más fácil cuando sabes exactamente para qué lo haces."
              action={
                <Link href="/ahorros" className="btn btn-secondary">
                  Crear meta
                </Link>
              }
            />
          ) : (
            <ul className="space-y-4">
              {d.goals.slice(0, 3).map((goal) => (
                <li key={goal.id}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-2">
                    <span className="truncate text-xs font-medium text-slate-200">{goal.name}</span>
                    <span className="shrink-0 text-[10px] text-slate-500 tnum">
                      {formatCurrency(goal.saved_amount, currency, { decimals: false })} /{" "}
                      {formatCurrency(goal.target_amount, currency, { decimals: false })}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-ink-700">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, goal.progress)}%`, backgroundColor: goal.color }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="mt-4 grid gap-4 lg:mt-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="card p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Movimientos recientes</h2>
              <p className="text-[11px] text-slate-500">Últimos registros de todas tus cuentas</p>
            </div>
            <Link href="/movimientos" className="text-[11px] font-medium text-mint hover:text-mint-bright">
              Ver todos
            </Link>
          </div>

          {d.recent.length === 0 ? (
            <EmptyState
              icon={<ArrowDownLeft className="h-5 w-5" />}
              title="Aún no hay movimientos"
              description="Registra tu primer ingreso o gasto para ver el detalle aquí."
            />
          ) : (
            <ul className="divide-y divide-line/60">
              {d.recent.map((transaction) => (
                <li key={transaction.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      transaction.type === "income"
                        ? "bg-mint/10 text-mint"
                        : "bg-white/[0.04] text-slate-400"
                    }`}
                  >
                    {transaction.type === "income" ? (
                      <ArrowDownLeft className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-slate-200">
                      {transaction.description}
                    </p>
                    <p className="truncate text-[10px] text-slate-500">
                      {transaction.category} · {transaction.account_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-[13px] font-semibold tnum ${
                        transaction.type === "income" ? "text-mint" : "text-slate-200"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "−"}
                      {formatCurrency(transaction.amount, currency)}
                    </p>
                    <p className="text-[10px] text-slate-500">{relativeDate(transaction.date)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Presupuestos</h2>
              <p className="text-[11px] text-slate-500">
                {overBudget ? "Tienes categorías por encima del límite" : "Vas bien este mes"}
              </p>
            </div>
            <Link href="/presupuestos" className="text-[11px] font-medium text-mint hover:text-mint-bright">
              Gestionar
            </Link>
          </div>

          {d.budgets.length === 0 ? (
            <EmptyState
              icon={<Target className="h-5 w-5" />}
              title="Sin presupuestos"
              description="Ponle un límite a tus categorías de gasto para controlar mejor tu mes."
            />
          ) : (
            <ul className="space-y-3.5">
              {d.budgets.slice(0, 4).map((budget) => {
                const over = budget.progress > 100;
                return (
                  <li key={budget.id}>
                    <div className="mb-1 flex items-baseline justify-between gap-2 text-[11px]">
                      <span className="truncate text-slate-300">{budget.category}</span>
                      <span className={`shrink-0 tnum ${over ? "text-rose-300" : "text-slate-500"}`}>
                        {formatCurrency(budget.spent, currency, { decimals: false })} /{" "}
                        {formatCurrency(budget.monthly_limit, currency, { decimals: false })}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-ink-700">
                      <div
                        className={`h-full rounded-full ${over ? "bg-rose-400" : "bg-mint"}`}
                        style={{ width: `${Math.min(100, budget.progress)}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <p className="mt-6 text-center text-[10px] text-slate-600">
        Tus datos se guardan en tu cuenta y se sincronizan entre dispositivos cuando inicias sesión.
      </p>
    </>
  );
}
