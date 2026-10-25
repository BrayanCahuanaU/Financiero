import { getCloudflareContext } from "@opennextjs/cloudflare";
import { BANK_PROVIDERS, generateBankTransactions, mockAccountNumber } from "./banks";
import { hashPassword } from "./password";
import { addDays, todayISO, uid } from "./utils";

/**
 * Tipos mínimos de D1.
 *
 * No importamos `@cloudflare/workers-types` para no mezclar los tipos de
 * Worker con los del DOM que usa Next.js. Solo usamos la parte de la API que
 * necesita la aplicación.
 */
export type D1Result<T = Record<string, unknown>> = {
  success: boolean;
  results?: T[];
  meta: {
    changes: number;
    last_row_id: number;
    [key: string]: unknown;
  };
};

export type D1Statement = {
  bind(...values: unknown[]): D1Statement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run(): Promise<D1Result>;
};

export type D1DatabaseLike = {
  prepare(query: string): D1Statement;
  batch(statements: D1Statement[]): Promise<D1Result[]>;
  exec(query: string): Promise<{ count: number; duration: number }>;
};

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'PEN',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    institution TEXT,
    number TEXT,
    initial_balance REAL NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'PEN',
    color TEXT NOT NULL DEFAULT '#2fe0a4',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'manual',
    external_id TEXT,
    created_at TEXT NOT NULL,
    UNIQUE(user_id, external_id)
  );
  CREATE INDEX IF NOT EXISTS idx_tx_user_date ON transactions(user_id, date DESC);
  CREATE INDEX IF NOT EXISTS idx_tx_account ON transactions(account_id);

  CREATE TABLE IF NOT EXISTS savings_goals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount REAL NOT NULL,
    saved_amount REAL NOT NULL DEFAULT 0,
    deadline TEXT,
    color TEXT NOT NULL DEFAULT '#2fe0a4',
    note TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS goal_contributions (
    id TEXT PRIMARY KEY,
    goal_id TEXT NOT NULL REFERENCES savings_goals(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount REAL NOT NULL,
    note TEXT,
    date TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS investments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    institution TEXT,
    invested_amount REAL NOT NULL,
    current_value REAL NOT NULL,
    start_date TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS budgets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    monthly_limit REAL NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(user_id, category)
  );

  CREATE TABLE IF NOT EXISTS bank_links (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'connected',
    last_sync_at TEXT,
    created_at TEXT NOT NULL,
    UNIQUE(user_id, provider)
  );
`;

let schemaPromise: Promise<void> | null = null;
let demoPromise: Promise<void> | null = null;

async function resolveDatabase(): Promise<D1DatabaseLike> {
  const { env } = await getCloudflareContext({ async: true });
  const database = (env as unknown as { DB?: D1DatabaseLike }).DB;
  if (!database) {
    throw new Error(
      "Falta el binding D1 `DB`. Revisa wrangler.jsonc y vuelve a iniciar el servidor.",
    );
  }
  return database;
}

/**
 * Devuelve la base D1 y garantiza que el esquema exista.
 *
 * En local, el binding se emula con Miniflare (carpeta .wrangler/state).
 * En producción apunta a la base D1 real.
 */
export async function getDb(): Promise<D1DatabaseLike> {
  const db = await resolveDatabase();
  if (!schemaPromise) {
    // D1 no permite dividir un `exec` por líneas dentro de un mismo CREATE.
    // Enviamos cada sentencia como un batch transaccional.
    const statements = SCHEMA.split(";")
      .map((statement) => statement.trim())
      .filter(Boolean)
      .map((statement) => db.prepare(statement));
    schemaPromise = db
      .batch(statements)
      .then(() => undefined)
      .catch((error) => {
        schemaPromise = null;
        throw error;
      });
  }
  await schemaPromise;
  return db;
}

/**
 * Crea la cuenta demo la primera vez que alguien intenta entrar con ella.
 * Es idempotente y segura ante peticiones concurrentes: todo se inserta en
 * un único batch transaccional y la clave única del correo evita duplicados.
 */
export async function ensureDemoUser(): Promise<void> {
  if (!demoPromise) {
    demoPromise = seedDemo().catch((error) => {
      demoPromise = null;
      throw error;
    });
  }
  return demoPromise;
}

async function seedDemo() {
  const db = await getDb();
  const existing = await db
    .prepare("SELECT id FROM users WHERE email = ?")
    .bind("demo@yupay.pe")
    .first<{ id: string }>();
  if (existing) return;

  const now = new Date().toISOString();
  const today = todayISO();
  const userId = "usr_demo";
  const passwordHash = hashPassword("demo1234");

  const statements: D1Statement[] = [];
  const add = (sql: string, ...values: unknown[]) => {
    statements.push(db.prepare(sql).bind(...values));
  };

  add(
    "INSERT INTO users (id, name, email, password_hash, currency, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    userId,
    "Valeria Quispe",
    "demo@yupay.pe",
    passwordHash,
    "PEN",
    now,
  );

  const accountSeeds = [
    {
      provider: "bcp" as const,
      id: uid("acc_"),
      name: BANK_PROVIDERS.bcp.accountName,
      type: "bank",
      color: BANK_PROVIDERS.bcp.accountColor,
      initial: BANK_PROVIDERS.bcp.initialBalance,
    },
    {
      provider: "bn" as const,
      id: uid("acc_"),
      name: BANK_PROVIDERS.bn.accountName,
      type: "bank",
      color: BANK_PROVIDERS.bn.accountColor,
      initial: BANK_PROVIDERS.bn.initialBalance,
    },
    {
      provider: "yape" as const,
      id: uid("acc_"),
      name: BANK_PROVIDERS.yape.accountName,
      type: "wallet",
      color: BANK_PROVIDERS.yape.accountColor,
      initial: BANK_PROVIDERS.yape.initialBalance,
    },
  ];

  for (const account of accountSeeds) {
    add(
      `INSERT INTO accounts (id, user_id, name, type, institution, number, initial_balance, currency, color, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      account.id,
      userId,
      account.name,
      account.type,
      account.provider,
      mockAccountNumber(account.provider, userId),
      account.initial,
      "PEN",
      account.color,
      now,
    );
    add(
      `INSERT INTO bank_links (id, user_id, provider, account_id, status, last_sync_at, created_at)
       VALUES (?, ?, ?, ?, 'connected', ?, ?)`,
      uid("lnk_"),
      userId,
      account.provider,
      account.id,
      now,
      now,
    );

    const movements = generateBankTransactions(account.provider, userId);
    for (const movement of movements) {
      add(
        `INSERT OR IGNORE INTO transactions
         (id, user_id, account_id, type, category, description, amount, date, source, external_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'sync', ?, ?)`,
        uid("tx_"),
        userId,
        account.id,
        movement.type,
        movement.category,
        movement.description,
        movement.amount,
        movement.date,
        movement.externalId,
        now,
      );
    }
  }

  const cashId = uid("acc_");
  add(
    `INSERT INTO accounts (id, user_id, name, type, institution, number, initial_balance, currency, color, created_at)
     VALUES (?, ?, 'Efectivo', 'cash', NULL, NULL, ?, 'PEN', ?, ?)`,
    cashId,
    userId,
    260,
    "#fbbf24",
    now,
  );

  const manualTransactions = [
    { type: "expense", category: "Alimentación", description: "Mercado de Surquillo", amount: 64.5, date: addDays(today, -1) },
    { type: "expense", category: "Transporte", description: "Taxi al aeropuerto", amount: 45, date: addDays(today, -2) },
    { type: "income", category: "Freelance", description: "Diseño de landing page", amount: 650, date: addDays(today, -4) },
    { type: "expense", category: "Entretenimiento", description: "Entradas al cine", amount: 38, date: addDays(today, -6) },
    { type: "expense", category: "Alimentación", description: "Almuerzo con equipo", amount: 72, date: addDays(today, -8) },
    { type: "income", category: "Ventas", description: "Venta de bici usada", amount: 420, date: addDays(today, -12) },
    { type: "expense", category: "Mascotas", description: "Vacuna de Michi", amount: 85, date: addDays(today, -15) },
    { type: "expense", category: "Compras", description: "Zapatillas para correr", amount: 289, date: addDays(today, -20) },
  ];
  for (const tx of manualTransactions) {
    add(
      `INSERT INTO transactions
       (id, user_id, account_id, type, category, description, amount, date, source, external_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'manual', NULL, ?)`,
      uid("tx_"),
      userId,
      cashId,
      tx.type,
      tx.category,
      tx.description,
      tx.amount,
      tx.date,
      now,
    );
  }

  const goals = [
    { name: "Viaje a Cusco", target: 3500, saved: 2150, deadline: addDays(today, 95), color: "#2fe0a4", note: "Vuelos + hotel + tours" },
    { name: "Fondo de emergencia", target: 8000, saved: 3200, deadline: addDays(today, 240), color: "#60a5fa", note: "3 meses de gastos fijos" },
    { name: "Laptop nueva", target: 4500, saved: 1200, deadline: addDays(today, 160), color: "#a78bfa", note: "Para freelancear" },
  ];
  for (const goal of goals) {
    const goalId = uid("goal_");
    add(
      `INSERT INTO savings_goals (id, user_id, name, target_amount, saved_amount, deadline, color, note, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      goalId,
      userId,
      goal.name,
      goal.target,
      goal.saved,
      goal.deadline,
      goal.color,
      goal.note,
      now,
    );
    const contributions = [
      { amount: Math.round(goal.saved * 0.5 * 100) / 100, date: addDays(today, -50) },
      { amount: Math.round(goal.saved * 0.3 * 100) / 100, date: addDays(today, -25) },
      { amount: Math.round(goal.saved * 0.2 * 100) / 100, date: addDays(today, -7) },
    ];
    for (const contribution of contributions) {
      add(
        `INSERT INTO goal_contributions (id, goal_id, user_id, amount, note, date, created_at)
         VALUES (?, ?, ?, ?, 'Aporte mensual', ?, ?)`,
        uid("con_"),
        goalId,
        userId,
        contribution.amount,
        contribution.date,
        now,
      );
    }
  }

  const investments = [
    { name: "ETF S&P 500", type: "ETF", institution: "Hapi", invested: 3000, current: 3420, start: addDays(today, -300) },
    { name: "Fondo mutuo moderado", type: "Fondo mutuo", institution: "BCP", invested: 2000, current: 2115, start: addDays(today, -180) },
    { name: "Bitcoin", type: "Criptomonedas", institution: "Bitso", invested: 800, current: 690, start: addDays(today, -120) },
    { name: "Depósito a plazo 12m", type: "Depósito a plazo", institution: "Banco de la Nación", invested: 5000, current: 5185, start: addDays(today, -90) },
  ];
  for (const investment of investments) {
    add(
      `INSERT INTO investments (id, user_id, name, type, institution, invested_amount, current_value, start_date, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, ?)`,
      uid("inv_"),
      userId,
      investment.name,
      investment.type,
      investment.institution,
      investment.invested,
      investment.current,
      investment.start,
      now,
    );
  }

  const budgets = [
    { category: "Alimentación", limit: 950 },
    { category: "Transporte", limit: 380 },
    { category: "Servicios", limit: 350 },
    { category: "Entretenimiento", limit: 250 },
    { category: "Compras", limit: 400 },
  ];
  for (const budget of budgets) {
    add(
      "INSERT INTO budgets (id, user_id, category, monthly_limit, created_at) VALUES (?, ?, ?, ?, ?)",
      uid("bud_"),
      userId,
      budget.category,
      budget.limit,
      now,
    );
  }

  try {
    await db.batch(statements);
  } catch (error) {
    // Si otra petición ganó la carrera, el batch entero se revierte y el
    // usuario demo ya existe. En cualquier otro caso, propaga el error.
    const raced = await db
      .prepare("SELECT id FROM users WHERE email = ?")
      .bind("demo@yupay.pe")
      .first<{ id: string }>()
      .catch(() => null);
    if (!raced) throw error;
  }
}
