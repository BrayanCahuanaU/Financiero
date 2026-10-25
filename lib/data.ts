import { getDb } from "./db";
import { BANK_PROVIDERS, generateBankTransactions, getProvider, mockAccountNumber, type BankProviderId } from "./banks";
import { categoryColor, currentMonthKey, monthLabel, monthRange, uid } from "./utils";

export type Account = {
  id: string;
  name: string;
  type: string;
  institution: string | null;
  number: string | null;
  initial_balance: number;
  currency: string;
  color: string;
  created_at: string;
  balance: number;
};

export type Transaction = {
  id: string;
  account_id: string;
  type: "income" | "expense";
  category: string;
  description: string;
  amount: number;
  date: string;
  source: string;
  created_at: string;
  account_name?: string;
  account_color?: string;
  institution?: string | null;
};

export type Goal = {
  id: string;
  name: string;
  target_amount: number;
  saved_amount: number;
  deadline: string | null;
  color: string;
  note: string | null;
  created_at: string;
  progress: number;
};

export type Investment = {
  id: string;
  name: string;
  type: string;
  institution: string | null;
  invested_amount: number;
  current_value: number;
  start_date: string;
  notes: string | null;
  created_at: string;
  gain: number;
  gain_pct: number;
};

export type Budget = {
  id: string;
  category: string;
  monthly_limit: number;
  spent: number;
  progress: number;
};

export type BankLink = {
  id: string;
  provider: string;
  account_id: string;
  status: string;
  last_sync_at: string | null;
  account_name: string;
  account_balance: number;
  movement_count: number;
};

const ACCOUNT_BALANCE_SELECT = `
  SELECT a.id, a.name, a.type, a.institution, a.number, a.initial_balance, a.currency,
         a.color, a.created_at,
         a.initial_balance + COALESCE((
           SELECT SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END)
           FROM transactions t WHERE t.account_id = a.id
         ), 0) AS balance
  FROM accounts a
  WHERE a.user_id = ?
`;

const ACCOUNT_BALANCE_SQL = `${ACCOUNT_BALANCE_SELECT} ORDER BY a.created_at ASC`;

export async function listAccounts(userId: string): Promise<Account[]> {
  const db = await getDb();
  const { results = [] } = await db.prepare(ACCOUNT_BALANCE_SQL).bind(userId).all<Account>();
  return results;
}

export async function getAccount(userId: string, accountId: string): Promise<Account | undefined> {
  const db = await getDb();
  const row = await db
    .prepare(`${ACCOUNT_BALANCE_SELECT} AND a.id = ? LIMIT 1`)
    .bind(userId, accountId)
    .first<Account>();
  return row ?? undefined;
}

export async function createAccount(
  userId: string,
  input: {
    name: string;
    type: string;
    initial_balance: number;
    color: string;
    currency?: string;
    institution?: string | null;
    number?: string | null;
  },
): Promise<Account> {
  const db = await getDb();
  const id = uid("acc_");
  await db
    .prepare(
      `INSERT INTO accounts (id, user_id, name, type, institution, number, initial_balance, currency, color, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      userId,
      input.name,
      input.type,
      input.institution ?? null,
      input.number ?? null,
      input.initial_balance,
      input.currency ?? "PEN",
      input.color,
      new Date().toISOString(),
    )
    .run();
  const account = await getAccount(userId, id);
  if (!account) throw new Error("No se pudo crear la cuenta.");
  return account;
}

export async function deleteAccount(userId: string, accountId: string): Promise<boolean> {
  const db = await getDb();
  const result = await db
    .prepare("DELETE FROM accounts WHERE id = ? AND user_id = ?")
    .bind(accountId, userId)
    .run();
  return result.meta.changes > 0;
}

export type TransactionFilters = {
  month?: string;
  type?: string;
  accountId?: string;
  category?: string;
  q?: string;
  page?: number;
  pageSize?: number;
};

function buildTransactionFilter(userId: string, filters: TransactionFilters) {
  const clauses: string[] = ["t.user_id = ?"];
  const params: unknown[] = [userId];

  if (filters.month) {
    const { start, end } = monthRange(filters.month);
    clauses.push("t.date BETWEEN ? AND ?");
    params.push(start, end);
  }
  if (filters.type === "income" || filters.type === "expense") {
    clauses.push("t.type = ?");
    params.push(filters.type);
  }
  if (filters.accountId) {
    clauses.push("t.account_id = ?");
    params.push(filters.accountId);
  }
  if (filters.category) {
    clauses.push("t.category = ?");
    params.push(filters.category);
  }
  if (filters.q) {
    clauses.push("(t.description LIKE ? OR t.category LIKE ?)");
    params.push(`%${filters.q}%`, `%${filters.q}%`);
  }

  return { where: clauses.join(" AND "), params };
}

export async function transactionTotals(userId: string, filters: TransactionFilters = {}) {
  const db = await getDb();
  const { where, params } = buildTransactionFilter(userId, filters);
  const row = await db
    .prepare(
      `SELECT
         COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount END), 0) AS income,
         COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount END), 0) AS expense,
         COUNT(*) AS count
       FROM transactions t WHERE ${where}`,
    )
    .bind(...params)
    .first<{ income: number; expense: number; count: number }>();
  const totals = row ?? { income: 0, expense: 0, count: 0 };
  return { ...totals, net: totals.income - totals.expense };
}

export async function listTransactions(
  userId: string,
  filters: TransactionFilters = {},
): Promise<{ items: Transaction[]; total: number; page: number; pageSize: number }> {
  const db = await getDb();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(200, Math.max(5, filters.pageSize ?? 25));
  const { where, params } = buildTransactionFilter(userId, filters);

  const countRow = await db
    .prepare(`SELECT COUNT(*) AS count FROM transactions t WHERE ${where}`)
    .bind(...params)
    .first<{ count: number }>();

  const { results = [] } = await db
    .prepare(
      `SELECT t.*, a.name AS account_name, a.color AS account_color, a.institution
       FROM transactions t
       JOIN accounts a ON a.id = t.account_id
       WHERE ${where}
       ORDER BY t.date DESC, t.created_at DESC
       LIMIT ? OFFSET ?`,
    )
    .bind(...params, pageSize, (page - 1) * pageSize)
    .all<Transaction>();

  return { items: results, total: countRow?.count ?? 0, page, pageSize };
}

export async function createTransaction(
  userId: string,
  input: {
    account_id: string;
    type: "income" | "expense";
    category: string;
    description: string;
    amount: number;
    date: string;
    source?: string;
  },
): Promise<Transaction> {
  const account = await getAccount(userId, input.account_id);
  if (!account) throw new Error("La cuenta no existe o no te pertenece.");

  const db = await getDb();
  const id = uid("tx_");
  await db
    .prepare(
      `INSERT INTO transactions
       (id, user_id, account_id, type, category, description, amount, date, source, external_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?)`,
    )
    .bind(
      id,
      userId,
      input.account_id,
      input.type,
      input.category,
      input.description,
      Math.abs(input.amount),
      input.date,
      input.source ?? "manual",
      new Date().toISOString(),
    )
    .run();

  const transaction = await db
    .prepare("SELECT * FROM transactions WHERE id = ?")
    .bind(id)
    .first<Transaction>();
  if (!transaction) throw new Error("No se pudo registrar el movimiento.");
  return transaction;
}

export async function deleteTransaction(userId: string, transactionId: string): Promise<boolean> {
  const db = await getDb();
  const result = await db
    .prepare("DELETE FROM transactions WHERE id = ? AND user_id = ?")
    .bind(transactionId, userId)
    .run();
  return result.meta.changes > 0;
}

function withGoalProgress(goal: Omit<Goal, "progress">): Goal {
  return {
    ...goal,
    progress: goal.target_amount > 0 ? Math.min(100, (goal.saved_amount / goal.target_amount) * 100) : 0,
  };
}

export async function listGoals(userId: string): Promise<Goal[]> {
  const db = await getDb();
  const { results = [] } = await db
    .prepare(
      "SELECT * FROM savings_goals WHERE user_id = ? ORDER BY (saved_amount * 1.0 / target_amount) DESC, created_at ASC",
    )
    .bind(userId)
    .all<Omit<Goal, "progress">>();
  return results.map(withGoalProgress);
}

export async function createGoal(
  userId: string,
  input: {
    name: string;
    target_amount: number;
    saved_amount?: number;
    deadline?: string | null;
    color: string;
    note?: string | null;
  },
): Promise<Goal> {
  const db = await getDb();
  const id = uid("goal_");
  const now = new Date().toISOString();
  const saved = Math.max(0, input.saved_amount ?? 0);

  const statements = [
    db
      .prepare(
        `INSERT INTO savings_goals
         (id, user_id, name, target_amount, saved_amount, deadline, color, note, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(id, userId, input.name, input.target_amount, saved, input.deadline || null, input.color, input.note || null, now),
  ];

  if (saved > 0) {
    statements.push(
      db
        .prepare(
          `INSERT INTO goal_contributions (id, goal_id, user_id, amount, note, date, created_at)
           VALUES (?, ?, ?, ?, 'Monto inicial', ?, ?)`,
        )
        .bind(uid("con_"), id, userId, saved, new Date().toISOString().slice(0, 10), now),
    );
  }

  await db.batch(statements);

  const goal = await db
    .prepare("SELECT * FROM savings_goals WHERE id = ?")
    .bind(id)
    .first<Omit<Goal, "progress">>();
  if (!goal) throw new Error("No se pudo crear la meta.");
  return withGoalProgress(goal);
}

export async function deleteGoal(userId: string, goalId: string): Promise<boolean> {
  const db = await getDb();
  const result = await db
    .prepare("DELETE FROM savings_goals WHERE id = ? AND user_id = ?")
    .bind(goalId, userId)
    .run();
  return result.meta.changes > 0;
}

export async function addContribution(
  userId: string,
  goalId: string,
  input: { amount: number; note?: string | null; date: string },
): Promise<void> {
  const db = await getDb();
  const goal = await db
    .prepare("SELECT id FROM savings_goals WHERE id = ? AND user_id = ?")
    .bind(goalId, userId)
    .first<{ id: string }>();
  if (!goal) throw new Error("La meta no existe.");

  await db.batch([
    db
      .prepare(
        `INSERT INTO goal_contributions (id, goal_id, user_id, amount, note, date, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(uid("con_"), goalId, userId, Math.abs(input.amount), input.note || null, input.date, new Date().toISOString()),
    db
      .prepare("UPDATE savings_goals SET saved_amount = saved_amount + ? WHERE id = ? AND user_id = ?")
      .bind(Math.abs(input.amount), goalId, userId),
  ]);
}

export async function listContributions(userId: string, goalId: string) {
  const db = await getDb();
  const { results = [] } = await db
    .prepare(
      "SELECT * FROM goal_contributions WHERE user_id = ? AND goal_id = ? ORDER BY date DESC, created_at DESC LIMIT 20",
    )
    .bind(userId, goalId)
    .all<{ id: string; amount: number; note: string | null; date: string }>();
  return results;
}

export async function listInvestments(userId: string): Promise<Investment[]> {
  const db = await getDb();
  const { results = [] } = await db
    .prepare("SELECT * FROM investments WHERE user_id = ? ORDER BY start_date DESC")
    .bind(userId)
    .all<Omit<Investment, "gain" | "gain_pct">>();
  return results.map((investment) => {
    const gain = investment.current_value - investment.invested_amount;
    return {
      ...investment,
      gain,
      gain_pct: investment.invested_amount > 0 ? (gain / investment.invested_amount) * 100 : 0,
    };
  });
}

export async function createInvestment(
  userId: string,
  input: {
    name: string;
    type: string;
    institution?: string | null;
    invested_amount: number;
    current_value: number;
    start_date: string;
    notes?: string | null;
  },
): Promise<Investment> {
  const db = await getDb();
  const id = uid("inv_");
  await db
    .prepare(
      `INSERT INTO investments
       (id, user_id, name, type, institution, invested_amount, current_value, start_date, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      userId,
      input.name,
      input.type,
      input.institution || null,
      input.invested_amount,
      input.current_value,
      input.start_date,
      input.notes || null,
      new Date().toISOString(),
    )
    .run();

  const investment = await db
    .prepare("SELECT * FROM investments WHERE id = ?")
    .bind(id)
    .first<Omit<Investment, "gain" | "gain_pct">>();
  if (!investment) throw new Error("No se pudo crear la inversión.");
  const gain = investment.current_value - investment.invested_amount;
  return {
    ...investment,
    gain,
    gain_pct: investment.invested_amount > 0 ? (gain / investment.invested_amount) * 100 : 0,
  };
}

export async function deleteInvestment(userId: string, investmentId: string): Promise<boolean> {
  const db = await getDb();
  const result = await db
    .prepare("DELETE FROM investments WHERE id = ? AND user_id = ?")
    .bind(investmentId, userId)
    .run();
  return result.meta.changes > 0;
}

export async function updateInvestmentValue(
  userId: string,
  investmentId: string,
  currentValue: number,
): Promise<boolean> {
  const db = await getDb();
  const result = await db
    .prepare("UPDATE investments SET current_value = ? WHERE id = ? AND user_id = ?")
    .bind(currentValue, investmentId, userId)
    .run();
  return result.meta.changes > 0;
}

export async function listBudgets(userId: string, monthKey = currentMonthKey()): Promise<Budget[]> {
  const db = await getDb();
  const { start, end } = monthRange(monthKey);
  const { results = [] } = await db
    .prepare(
      `SELECT b.id, b.category, b.monthly_limit,
        COALESCE((
          SELECT SUM(t.amount) FROM transactions t
          WHERE t.user_id = b.user_id AND t.type = 'expense'
            AND t.category = b.category AND t.date BETWEEN ? AND ?
        ), 0) AS spent
       FROM budgets b
       WHERE b.user_id = ?
       ORDER BY spent DESC`,
    )
    .bind(start, end, userId)
    .all<Omit<Budget, "progress">>();
  return results.map((budget) => ({
    ...budget,
    progress: budget.monthly_limit > 0 ? (budget.spent / budget.monthly_limit) * 100 : 0,
  }));
}

export async function upsertBudget(userId: string, category: string, monthlyLimit: number): Promise<void> {
  const db = await getDb();
  await db
    .prepare(
      `INSERT INTO budgets (id, user_id, category, monthly_limit, created_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(user_id, category) DO UPDATE SET monthly_limit = excluded.monthly_limit`,
    )
    .bind(uid("bud_"), userId, category, monthlyLimit, new Date().toISOString())
    .run();
}

export async function deleteBudget(userId: string, budgetId: string): Promise<boolean> {
  const db = await getDb();
  const result = await db
    .prepare("DELETE FROM budgets WHERE id = ? AND user_id = ?")
    .bind(budgetId, userId)
    .run();
  return result.meta.changes > 0;
}

export async function listBankLinks(userId: string): Promise<BankLink[]> {
  const db = await getDb();
  const { results = [] } = await db
    .prepare(
      `SELECT l.id, l.provider, l.account_id, l.status, l.last_sync_at,
              a.name AS account_name,
              a.initial_balance + COALESCE((
                SELECT SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END)
                FROM transactions t WHERE t.account_id = a.id
              ), 0) AS account_balance,
              (SELECT COUNT(*) FROM transactions t WHERE t.account_id = a.id AND t.source = 'sync') AS movement_count
       FROM bank_links l
       JOIN accounts a ON a.id = l.account_id
       WHERE l.user_id = ?
       ORDER BY l.created_at ASC`,
    )
    .bind(userId)
    .all<BankLink>();
  return results;
}

async function importBankMovements(
  userId: string,
  accountId: string,
  provider: BankProviderId,
): Promise<number> {
  const db = await getDb();
  const movements = generateBankTransactions(provider, userId);
  if (movements.length === 0) return 0;

  const now = new Date().toISOString();
  const statements = movements.map((movement) =>
    db
      .prepare(
        `INSERT OR IGNORE INTO transactions
         (id, user_id, account_id, type, category, description, amount, date, source, external_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'sync', ?, ?)`,
      )
      .bind(
        uid("tx_"),
        userId,
        accountId,
        movement.type,
        movement.category,
        movement.description,
        movement.amount,
        movement.date,
        movement.externalId,
        now,
      ),
  );

  const results = await db.batch(statements);
  return results.reduce((sum, result) => sum + (result.meta?.changes ?? 0), 0);
}

/**
 * Conexión bancaria (modo demostración).
 *
 * No se almacenan credenciales. Cuando exista un contrato oficial con el banco,
 * reemplaza `importBankMovements` por la llamada a la API/open banking y
 * conserva el mismo esquema de deduplicación por `external_id`.
 */
export async function connectBank(userId: string, provider: BankProviderId) {
  const meta = BANK_PROVIDERS[provider];
  if (!meta) throw new Error("Banco no soportado.");

  const db = await getDb();
  const existing = await db
    .prepare("SELECT id FROM bank_links WHERE user_id = ? AND provider = ?")
    .bind(userId, provider)
    .first<{ id: string }>();
  if (existing) throw new Error("Ya tienes este banco conectado.");

  let account = await db
    .prepare("SELECT id FROM accounts WHERE user_id = ? AND institution = ?")
    .bind(userId, provider)
    .first<{ id: string }>();

  const now = new Date().toISOString();
  const statements = [];

  if (!account) {
    const accountId = uid("acc_");
    statements.push(
      db
        .prepare(
          `INSERT INTO accounts
           (id, user_id, name, type, institution, number, initial_balance, currency, color, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'PEN', ?, ?)`,
        )
        .bind(
          accountId,
          userId,
          meta.accountName,
          meta.accountType,
          provider,
          mockAccountNumber(provider, userId),
          meta.initialBalance,
          meta.accountColor,
          now,
        ),
    );
    account = { id: accountId };
  }

  statements.push(
    db
      .prepare(
        `INSERT INTO bank_links (id, user_id, provider, account_id, status, last_sync_at, created_at)
         VALUES (?, ?, ?, ?, 'connected', ?, ?)`,
      )
      .bind(uid("lnk_"), userId, provider, account.id, now, now),
  );

  await db.batch(statements);

  const imported = await importBankMovements(userId, account.id, provider);
  return { imported, accountId: account.id };
}

export async function syncBank(userId: string, provider: BankProviderId) {
  const db = await getDb();
  const link = await db
    .prepare("SELECT * FROM bank_links WHERE user_id = ? AND provider = ?")
    .bind(userId, provider)
    .first<{ id: string; account_id: string; last_sync_at: string | null }>();
  if (!link) throw new Error("Este banco no está conectado.");

  const imported = await importBankMovements(userId, link.account_id, provider);
  const now = new Date().toISOString();
  await db
    .prepare("UPDATE bank_links SET last_sync_at = ?, status = 'connected' WHERE id = ?")
    .bind(now, link.id)
    .run();
  return { imported, last_sync_at: now };
}

export async function disconnectBank(userId: string, provider: BankProviderId): Promise<boolean> {
  const db = await getDb();
  const result = await db
    .prepare("DELETE FROM bank_links WHERE user_id = ? AND provider = ?")
    .bind(userId, provider)
    .run();
  return result.meta.changes > 0;
}

export type Dashboard = {
  monthKey: string;
  monthName: string;
  totalBalance: number;
  netWorth: number;
  investedTotal: number;
  investmentValue: number;
  goalsSaved: number;
  goalsTarget: number;
  income: number;
  expense: number;
  savings: number;
  savingsRate: number;
  prevIncome: number;
  prevExpense: number;
  txCount: number;
  series: Array<{ month: string; label: string; income: number; expense: number }>;
  categories: Array<{ category: string; total: number; percent: number; color: string }>;
  accounts: Account[];
  goals: Goal[];
  budgets: Budget[];
  recent: Transaction[];
  bankLinks: BankLink[];
};

export async function getDashboard(userId: string, monthKey = currentMonthKey()): Promise<Dashboard> {
  const db = await getDb();
  const [accounts, goals, budgets, investments, bankLinks] = await Promise.all([
    listAccounts(userId),
    listGoals(userId),
    listBudgets(userId, monthKey),
    listInvestments(userId),
    listBankLinks(userId),
  ]);

  const { start, end } = monthRange(monthKey);
  const totalsQuery = db
    .prepare(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount END), 0) AS income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount END), 0) AS expense,
         COUNT(*) AS count
       FROM transactions
       WHERE user_id = ? AND date BETWEEN ? AND ?`,
    )
    .bind(userId, start, end)
    .first<{ income: number; expense: number; count: number }>();

  const [year, month] = monthKey.split("-").map(Number);
  const prevDate = new Date(Date.UTC(year, month - 2, 1));
  const prevKey = `${prevDate.getUTCFullYear()}-${String(prevDate.getUTCMonth() + 1).padStart(2, "0")}`;
  const prevRange = monthRange(prevKey);
  const prevQuery = db
    .prepare(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount END), 0) AS income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount END), 0) AS expense
       FROM transactions WHERE user_id = ? AND date BETWEEN ? AND ?`,
    )
    .bind(userId, prevRange.start, prevRange.end)
    .first<{ income: number; expense: number }>();

  const keys: string[] = [];
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(Date.UTC(year, month - 1 - i, 1));
    keys.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  const seriesStart = monthRange(keys[0]).start;
  const groupedQuery = db
    .prepare(
      `SELECT substr(date, 1, 7) AS month,
              COALESCE(SUM(CASE WHEN type = 'income' THEN amount END), 0) AS income,
              COALESCE(SUM(CASE WHEN type = 'expense' THEN amount END), 0) AS expense
       FROM transactions
       WHERE user_id = ? AND date >= ?
       GROUP BY month`,
    )
    .bind(userId, seriesStart)
    .all<{ month: string; income: number; expense: number }>();

  const categoryQuery = db
    .prepare(
      `SELECT category, SUM(amount) AS total
       FROM transactions
       WHERE user_id = ? AND type = 'expense' AND date BETWEEN ? AND ?
       GROUP BY category
       ORDER BY total DESC`,
    )
    .bind(userId, start, end)
    .all<{ category: string; total: number }>();

  const [totalsRow, prevRow, groupedResult, categoryResult] = await Promise.all([
    totalsQuery,
    prevQuery,
    groupedQuery,
    categoryQuery,
  ]);

  const totals = totalsRow ?? { income: 0, expense: 0, count: 0 };
  const prev = prevRow ?? { income: 0, expense: 0 };
  const grouped = groupedResult.results ?? [];
  const categoryRows = categoryResult.results ?? [];

  const series = keys.map((key) => {
    const found = grouped.find((row) => row.month === key);
    return {
      month: key,
      label: monthLabel(key),
      income: found?.income ?? 0,
      expense: found?.expense ?? 0,
    };
  });

  const expenseTotal = categoryRows.reduce((sum, row) => sum + row.total, 0);
  const categories = categoryRows.map((row) => ({
    category: row.category,
    total: row.total,
    percent: expenseTotal > 0 ? (row.total / expenseTotal) * 100 : 0,
    color: categoryColor(row.category),
  }));

  const recent = (await listTransactions(userId, { pageSize: 6 })).items;
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const investmentValue = investments.reduce((sum, investment) => sum + investment.current_value, 0);
  const investedTotal = investments.reduce((sum, investment) => sum + investment.invested_amount, 0);
  const goalsSaved = goals.reduce((sum, goal) => sum + goal.saved_amount, 0);
  const goalsTarget = goals.reduce((sum, goal) => sum + goal.target_amount, 0);

  return {
    monthKey,
    monthName: monthLabel(monthKey, { long: true }),
    totalBalance,
    netWorth: totalBalance + investmentValue,
    investedTotal,
    investmentValue,
    goalsSaved,
    goalsTarget,
    income: totals.income,
    expense: totals.expense,
    savings: totals.income - totals.expense,
    savingsRate: totals.income > 0 ? ((totals.income - totals.expense) / totals.income) * 100 : 0,
    prevIncome: prev.income,
    prevExpense: prev.expense,
    txCount: totals.count,
    series,
    categories,
    accounts,
    goals,
    budgets,
    recent,
    bankLinks,
  };
}

export async function getProfile(userId: string) {
  const db = await getDb();
  const row = await db
    .prepare("SELECT id, name, email, currency, created_at, password_hash FROM users WHERE id = ?")
    .bind(userId)
    .first<{
      id: string;
      name: string;
      email: string;
      currency: string;
      created_at: string;
      password_hash: string;
    }>();
  return row ?? undefined;
}

export async function updateProfile(userId: string, input: { name: string; currency: string }): Promise<void> {
  const db = await getDb();
  await db
    .prepare("UPDATE users SET name = ?, currency = ? WHERE id = ?")
    .bind(input.name, input.currency, userId)
    .run();
}

export async function updatePassword(userId: string, passwordHash: string): Promise<void> {
  const db = await getDb();
  await db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").bind(passwordHash, userId).run();
}

export async function countUserData(userId: string) {
  const db = await getDb();
  const row = await db
    .prepare(
      `SELECT
        (SELECT COUNT(*) FROM accounts WHERE user_id = ?) AS accounts,
        (SELECT COUNT(*) FROM transactions WHERE user_id = ?) AS transactions,
        (SELECT COUNT(*) FROM savings_goals WHERE user_id = ?) AS goals,
        (SELECT COUNT(*) FROM investments WHERE user_id = ?) AS investments,
        (SELECT COUNT(*) FROM bank_links WHERE user_id = ?) AS links`,
    )
    .bind(userId, userId, userId, userId, userId)
    .first<{
      accounts: number;
      transactions: number;
      goals: number;
      investments: number;
      links: number;
    }>();
  return row ?? { accounts: 0, transactions: 0, goals: 0, investments: 0, links: 0 };
}

export async function resetUserData(userId: string): Promise<void> {
  const db = await getDb();
  await db.batch([
    db.prepare("DELETE FROM transactions WHERE user_id = ?").bind(userId),
    db.prepare("DELETE FROM bank_links WHERE user_id = ?").bind(userId),
    db.prepare("DELETE FROM accounts WHERE user_id = ?").bind(userId),
    db.prepare("DELETE FROM goal_contributions WHERE user_id = ?").bind(userId),
    db.prepare("DELETE FROM savings_goals WHERE user_id = ?").bind(userId),
    db.prepare("DELETE FROM investments WHERE user_id = ?").bind(userId),
    db.prepare("DELETE FROM budgets WHERE user_id = ?").bind(userId),
  ]);
}

export { getProvider };
