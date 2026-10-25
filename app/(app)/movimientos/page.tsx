import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Filter,
  Landmark,
  Search,
  Wallet,
  X,
} from "lucide-react";
import { DeleteButton } from "@/components/DeleteButton";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { TransactionForm } from "@/components/TransactionForm";
import { requireSessionUser } from "@/lib/auth";
import { listAccounts, listTransactions, transactionTotals } from "@/lib/data";
import {
  ALL_CATEGORIES,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "@/lib/constants";
import {
  categoryColor,
  currentMonthKey,
  formatCurrency,
  formatDate,
  monthLabel,
  monthOptions,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function param(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export default async function TransactionsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireSessionUser();
  const sp = await searchParams;
  const accounts = await listAccounts(user.id);

  const month = param(sp.mes) || currentMonthKey();
  const type = param(sp.tipo);
  const accountId = param(sp.cuenta);
  const category = param(sp.categoria);
  const q = param(sp.q).slice(0, 80);
  const page = Math.max(1, Number(param(sp.pagina)) || 1);
  const autoOpen = param(sp.nuevo) === "1";

  const filters = {
    month: month === "todos" ? undefined : month,
    type: type || undefined,
    accountId: accountId || undefined,
    category: category || undefined,
    q: q || undefined,
    page,
    pageSize: 20,
  };

  const [result, totals] = await Promise.all([
    listTransactions(user.id, filters),
    transactionTotals(user.id, filters),
  ]);
  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));
  const currency = user.currency;
  const months = monthOptions(18);
  const categoryOptions = [...new Set([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES, ...ALL_CATEGORIES])];

  const hasFilters = Boolean(type || accountId || category || q || month !== currentMonthKey());

  function href(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const values: Record<string, string | undefined> = {
      mes: month,
      tipo: type || undefined,
      cuenta: accountId || undefined,
      categoria: category || undefined,
      q: q || undefined,
      ...overrides,
    };
    for (const [key, value] of Object.entries(values)) {
      if (value) params.set(key, value);
    }
    const query = params.toString();
    return `/movimientos${query ? `?${query}` : ""}`;
  }

  return (
    <>
      <PageHeader
        eyebrow="Historial"
        title="Movimientos"
        subtitle="Todos tus ingresos y gastos, con búsqueda, filtros y control por cuenta."
        actions={
          <>
            <a href="/api/transactions/export" className="btn btn-secondary" download>
              <Download className="h-4 w-4" /> Exportar
            </a>
            <TransactionForm
              accounts={accounts}
              autoOpen={autoOpen}
              currency={currency}
            />
          </>
        }
      />

      <section className="mb-4 grid grid-cols-3 gap-2 sm:gap-3">
        <div className="card-flat px-3 py-2.5 sm:px-4">
          <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Ingresos</p>
          <p className="mt-1 text-sm font-semibold text-mint tnum sm:text-lg">
            +{formatCurrency(totals.income, currency, { decimals: false })}
          </p>
        </div>
        <div className="card-flat px-3 py-2.5 sm:px-4">
          <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Gastos</p>
          <p className="mt-1 text-sm font-semibold text-rose-300 tnum sm:text-lg">
            −{formatCurrency(totals.expense, currency, { decimals: false })}
          </p>
        </div>
        <div className="card-flat px-3 py-2.5 sm:px-4">
          <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Neto</p>
          <p
            className={`mt-1 text-sm font-semibold tnum sm:text-lg ${
              totals.net >= 0 ? "text-white" : "text-rose-300"
            }`}
          >
            {formatCurrency(totals.net, currency, { decimals: false })}
          </p>
        </div>
      </section>

      <section className="card mb-4 p-3.5 sm:p-4">
        <form method="get" className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Buscar por descripción o categoría…"
                className="field !pl-9"
              />
            </div>
            <button type="submit" className="btn btn-primary shrink-0">
              <Filter className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Filtrar</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <select name="mes" defaultValue={month} className="field !py-2 text-xs" aria-label="Mes">
              <option value="todos">Todos los meses</option>
              {months.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <select name="tipo" defaultValue={type} className="field !py-2 text-xs" aria-label="Tipo">
              <option value="">Todos los tipos</option>
              <option value="income">Solo ingresos</option>
              <option value="expense">Solo gastos</option>
            </select>

            <select name="cuenta" defaultValue={accountId} className="field !py-2 text-xs" aria-label="Cuenta">
              <option value="">Todas las cuentas</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>

            <select
              name="categoria"
              defaultValue={category}
              className="field !py-2 text-xs"
              aria-label="Categoría"
            >
              <option value="">Todas las categorías</option>
              {categoryOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {hasFilters && (
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] text-slate-500">
                {result.total} resultado{result.total === 1 ? "" : "s"}
                {month !== "todos" ? ` · ${monthLabel(month, { long: true })}` : ""}
              </p>
              <Link href="/movimientos" className="inline-flex items-center gap-1 text-[10px] text-mist hover:text-white">
                <X className="h-3 w-3" /> Limpiar filtros
              </Link>
            </div>
          )}
        </form>
      </section>

      <section className="card overflow-hidden">
        <div className="hidden grid-cols-[92px_1fr_140px_150px_120px_36px] items-center gap-3 border-b border-line/70 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500 sm:grid">
          <span>Fecha</span>
          <span>Descripción</span>
          <span>Categoría</span>
          <span>Cuenta</span>
          <span className="text-right">Monto</span>
          <span />
        </div>

        {result.items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={<Wallet className="h-5 w-5" />}
              title="No encontramos movimientos"
              description={
                hasFilters
                  ? "Prueba con otros filtros o limpia la búsqueda para ver todo tu historial."
                  : "Registra tu primer ingreso o gasto para empezar a ver tu historial aquí."
              }
              action={
                hasFilters ? (
                  <Link href="/movimientos" className="btn btn-secondary">
                    Limpiar filtros
                  </Link>
                ) : (
                  <TransactionForm accounts={accounts} triggerClassName="btn btn-secondary" currency={currency} />
                )
              }
            />
          </div>
        ) : (
          <ul className="divide-y divide-line/60">
            {result.items.map((transaction) => (
              <li
                key={transaction.id}
                className="grid grid-cols-[1fr_auto_32px] items-center gap-3 px-4 py-3 transition hover:bg-white/[0.015] sm:grid-cols-[92px_1fr_140px_150px_120px_36px]"
              >
                <span className="hidden text-[11px] text-slate-500 tnum sm:block">
                  {formatDate(transaction.date, { withYear: false })}
                </span>

                <div className="flex min-w-0 items-center gap-2.5">
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
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-slate-200">
                      {transaction.description}
                    </p>
                    <p className="flex items-center gap-1 truncate text-[10px] text-slate-500 sm:hidden">
                      {transaction.category} · {formatDate(transaction.date, { withYear: false })}
                    </p>
                    <p className="hidden items-center gap-1 text-[10px] text-slate-500 sm:flex">
                      {transaction.category}
                      <span className="text-slate-600">·</span>
                      {transaction.source === "sync" ? (
                        <span className="inline-flex items-center gap-0.5">
                          <Landmark className="h-2.5 w-2.5" /> Banco
                        </span>
                      ) : (
                        "Manual"
                      )}
                    </p>
                  </div>
                </div>

                <span className="hidden sm:block">
                  <span className="chip !border-transparent !bg-white/[0.03] !text-[10px]">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: categoryColor(transaction.category) }}
                    />
                    {transaction.category}
                  </span>
                </span>

                <span className="hidden truncate text-[11px] text-mist sm:block">
                  {transaction.account_name}
                </span>

                <span
                  className={`text-right text-[13px] font-semibold tnum ${
                    transaction.type === "income" ? "text-mint" : "text-slate-200"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "−"}
                  {formatCurrency(transaction.amount, currency)}
                </span>

                <DeleteButton
                  url={`/api/transactions/${transaction.id}`}
                  title="Eliminar movimiento"
                  description={`“${transaction.description}” por ${formatCurrency(transaction.amount, currency)}. Esta acción actualizará el saldo de tu cuenta.`}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500">
            Página {page} de {totalPages} · {result.total} movimientos
          </p>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link href={href({ pagina: String(page - 1) })} className="btn btn-secondary">
                Anterior
              </Link>
            ) : (
              <span className="btn btn-secondary pointer-events-none opacity-40">Anterior</span>
            )}
            {page < totalPages ? (
              <Link href={href({ pagina: String(page + 1) })} className="btn btn-secondary">
                Siguiente
              </Link>
            ) : (
              <span className="btn btn-secondary pointer-events-none opacity-40">Siguiente</span>
            )}
          </div>
        </div>
      )}
    </>
  );
}
