import { addDays, todayISO } from "./utils";

export type BankProviderId = "bcp" | "bn" | "yape";

export type BankProvider = {
  id: BankProviderId;
  name: string;
  fullName: string;
  kind: "bank" | "wallet";
  color: string;
  soft: string;
  description: string;
  website: string;
  accountType: "bank" | "wallet";
  accountName: string;
  accountColor: string;
  initialBalance: number;
  fields: Array<{
    name: "document" | "password" | "phone" | "code";
    label: string;
    placeholder: string;
    type: "text" | "tel" | "password";
    inputMode?: "numeric" | "text";
    maxLength?: number;
    help?: string;
  }>;
};

export const BANK_PROVIDERS: Record<BankProviderId, BankProvider> = {
  bcp: {
    id: "bcp",
    name: "BCP",
    fullName: "Banco de Crédito del Perú",
    kind: "bank",
    color: "#ff7a1a",
    soft: "rgba(255, 122, 26, 0.12)",
    description: "Cuenta de ahorros en soles y movimientos de tu banca por internet.",
    website: "https://www.bcp.com.pe",
    accountType: "bank",
    accountName: "BCP · Cuenta de ahorros",
    accountColor: "#ff7a1a",
    initialBalance: 500,
    fields: [
      {
        name: "document",
        label: "DNI",
        placeholder: "8 dígitos",
        type: "text",
        inputMode: "numeric",
        maxLength: 8,
      },
      {
        name: "password",
        label: "Clave de banca por internet",
        placeholder: "••••••••",
        type: "password",
        help: "En modo demostración no se guarda ninguna credencial.",
      },
    ],
  },
  bn: {
    id: "bn",
    name: "Banco de la Nación",
    fullName: "Banco de la Nación",
    kind: "bank",
    color: "#38bdf8",
    soft: "rgba(56, 189, 248, 0.12)",
    description: "Cuenta de ahorros y abonos de haberes del Banco de la Nación.",
    website: "https://www.bn.com.pe",
    accountType: "bank",
    accountName: "Banco de la Nación · Ahorros",
    accountColor: "#38bdf8",
    initialBalance: 2500,
    fields: [
      {
        name: "document",
        label: "DNI",
        placeholder: "8 dígitos",
        type: "text",
        inputMode: "numeric",
        maxLength: 8,
      },
      {
        name: "password",
        label: "Clave de banca por internet",
        placeholder: "••••••••",
        type: "password",
        help: "En modo demostración no se guarda ninguna credencial.",
      },
    ],
  },
  yape: {
    id: "yape",
    name: "Yape",
    fullName: "Yape · Billetera digital",
    kind: "wallet",
    color: "#a78bfa",
    soft: "rgba(167, 139, 250, 0.14)",
    description: "Pagos, cobros y yapeos de tu billetera digital.",
    website: "https://www.yape.com.pe",
    accountType: "wallet",
    accountName: "Yape · Billetera",
    accountColor: "#a78bfa",
    initialBalance: 120,
    fields: [
      {
        name: "phone",
        label: "Celular asociado",
        placeholder: "9XX XXX XXX",
        type: "tel",
        inputMode: "numeric",
        maxLength: 9,
      },
      {
        name: "code",
        label: "Código de aprobación",
        placeholder: "6 dígitos",
        type: "password",
        inputMode: "numeric",
        maxLength: 6,
        help: "En modo demostración no se guarda ninguna credencial.",
      },
    ],
  },
};

export const BANK_LIST = Object.values(BANK_PROVIDERS);

export function getProvider(id: string): BankProvider | undefined {
  return BANK_PROVIDERS[id as BankProviderId];
}

type Template = {
  type: "income" | "expense";
  category: string;
  description: string;
  min: number;
  max: number;
  weight: number;
};

const BCP_TEMPLATES: Template[] = [
  { type: "expense", category: "Alimentación", description: "Wong · compra semanal", min: 65, max: 210, weight: 4 },
  { type: "expense", category: "Alimentación", description: "Metro · compra del día", min: 22, max: 85, weight: 5 },
  { type: "expense", category: "Alimentación", description: "Pardos Chicken", min: 38, max: 92, weight: 2 },
  { type: "expense", category: "Transporte", description: "Uber", min: 12, max: 42, weight: 5 },
  { type: "expense", category: "Transporte", description: "Primax · combustible", min: 70, max: 150, weight: 2 },
  { type: "expense", category: "Servicios", description: "Luz del Sur", min: 82, max: 165, weight: 1 },
  { type: "expense", category: "Servicios", description: "Claro · recibo móvil", min: 59, max: 109, weight: 1 },
  { type: "expense", category: "Salud", description: "Inkafarma", min: 18, max: 96, weight: 2 },
  { type: "expense", category: "Entretenimiento", description: "Cineplanet", min: 28, max: 64, weight: 1 },
  { type: "expense", category: "Compras", description: "Ripley", min: 90, max: 380, weight: 1 },
  { type: "expense", category: "Suscripciones", description: "Netflix", min: 27.9, max: 27.9, weight: 1 },
  { type: "expense", category: "Suscripciones", description: "Spotify Premium", min: 17.9, max: 17.9, weight: 1 },
  { type: "expense", category: "Vivienda", description: "Alquiler", min: 950, max: 950, weight: 1 },
  { type: "income", category: "Sueldo", description: "Abono de haberes", min: 3200, max: 3200, weight: 1 },
  { type: "income", category: "Reembolsos", description: "Transferencia recibida", min: 40, max: 260, weight: 2 },
];

const BN_TEMPLATES: Template[] = [
  { type: "expense", category: "Vivienda", description: "Retiro cajero BN", min: 80, max: 300, weight: 3 },
  { type: "expense", category: "Servicios", description: "Pago de servicios", min: 40, max: 130, weight: 3 },
  { type: "expense", category: "Transporte", description: "Pasajes interprovinciales", min: 35, max: 90, weight: 1 },
  { type: "income", category: "Sueldo", description: "Depósito de haberes", min: 1250, max: 1250, weight: 1 },
  { type: "income", category: "Otros ingresos", description: "Transferencia recibida", min: 100, max: 450, weight: 2 },
];

const YAPE_TEMPLATES: Template[] = [
  { type: "expense", category: "Alimentación", description: "Yape · menú del día", min: 9, max: 18, weight: 6 },
  { type: "expense", category: "Alimentación", description: "Yape · bodega", min: 8, max: 35, weight: 5 },
  { type: "expense", category: "Transporte", description: "Yape · taxi", min: 7, max: 16, weight: 5 },
  { type: "expense", category: "Transporte", description: "Yape · mototaxi", min: 4, max: 9, weight: 3 },
  { type: "expense", category: "Entretenimiento", description: "Yape · heladería", min: 6, max: 18, weight: 2 },
  { type: "expense", category: "Otros", description: "Yape · varios", min: 5, max: 40, weight: 3 },
  { type: "income", category: "Ventas", description: "Yape recibido", min: 20, max: 140, weight: 4 },
  { type: "income", category: "Reembolsos", description: "Yape recibido · familiar", min: 30, max: 120, weight: 2 },
];

const TEMPLATES: Record<BankProviderId, Template[]> = {
  bcp: BCP_TEMPLATES,
  bn: BN_TEMPLATES,
  yape: YAPE_TEMPLATES,
};

function hashSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type MockTransaction = {
  externalId: string;
  type: "income" | "expense";
  category: string;
  description: string;
  amount: number;
  date: string;
  dayIndex: number;
};

function pickWeighted(templates: Template[], rand: () => number) {
  const total = templates.reduce((sum, t) => sum + t.weight, 0);
  let ticket = rand() * total;
  for (const template of templates) {
    ticket -= template.weight;
    if (ticket <= 0) return template;
  }
  return templates[templates.length - 1];
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

/**
 * Generador de movimientos de demostración.
 * Es determinista por usuario + banco, así que al sincronizar solo se
 * insertan los movimientos nuevos (deduplicados por externalId).
 *
 * En producción, este generador se reemplaza por el conector real del banco
 * manteniendo el mismo contrato (ver README → Integraciones bancarias).
 */
export function generateBankTransactions(
  provider: BankProviderId,
  seedKey: string,
  days = 150,
): MockTransaction[] {
  const rand = mulberry32(hashSeed(`${provider}:${seedKey}`));
  const templates = TEMPLATES[provider];
  const today = todayISO();
  const result: MockTransaction[] = [];
  const start = addDays(today, -days);
  const startDate = new Date(`${start}T12:00:00Z`);
  const endDate = new Date(`${today}T12:00:00Z`);

  for (let d = new Date(startDate); d <= endDate; d.setUTCDate(d.getUTCDate() + 1)) {
    const date = d.toISOString().slice(0, 10);
    const dayOfMonth = d.getUTCDate();
    const weekday = d.getUTCDay();
    let seq = 0;

    const push = (t: Template, amount: number) => {
      result.push({
        externalId: `${provider}-${date}-${seq}`,
        type: t.type,
        category: t.category,
        description: t.description,
        amount: roundMoney(amount),
        date,
        dayIndex: seq,
      });
      seq += 1;
    };

    // Ingresos recurrentes: sueldo a mitad de mes, haberes a inicios.
    if (provider === "bcp" && dayOfMonth === 15) {
      push(templates.find((t) => t.description === "Abono de haberes")!, 3200);
    }
    if (provider === "bn" && dayOfMonth === 5) {
      push(templates.find((t) => t.description === "Depósito de haberes")!, 1250);
    }
    if (provider === "bcp" && dayOfMonth === 1) {
      push(
        { type: "expense", category: "Vivienda", description: "Alquiler", min: 950, max: 950, weight: 1 },
        950,
      );
    }
    if (provider === "bcp" && (dayOfMonth === 8 || dayOfMonth === 20)) {
      push(
        { type: "expense", category: "Servicios", description: "Luz del Sur", min: 82, max: 165, weight: 1 },
        82 + rand() * 60,
      );
      push(
        { type: "expense", category: "Servicios", description: "Claro · recibo móvil", min: 59, max: 109, weight: 1 },
        59 + rand() * 40,
      );
    }
    if (provider === "bcp" && dayOfMonth === 3) {
      push(
        { type: "expense", category: "Suscripciones", description: "Netflix", min: 27.9, max: 27.9, weight: 1 },
        27.9,
      );
    }

    const daily = provider === "bcp" ? 0.55 : provider === "yape" ? 0.85 : 0.22;
    const rolls = rand() < daily ? (rand() < 0.28 ? 2 : 1) : 0;
    // Los cargos recurrentes (alquiler, servicios, suscripciones) solo se
    // generan en su día programado para no duplicar el mismo cobro.
    const recurring = new Set([
      "Alquiler",
      "Luz del Sur",
      "Claro · recibo móvil",
      "Netflix",
      "Spotify Premium",
    ]);
    const expenses = templates.filter(
      (t) => t.type === "expense" && !recurring.has(t.description),
    );

    for (let i = 0; i < rolls; i += 1) {
      // Los fines de semana gastamos un poco más en comida/ocio.
      const weekendBias = weekday === 0 || weekday === 6;
      const t = pickWeighted(expenses, rand);
      const amount = t.min + rand() * (t.max - t.min);
      if (provider === "yape") {
        push(t, Math.round(amount * 2) / 2);
      } else {
        push(t, weekendBias && t.category === "Alimentación" ? amount * 1.25 : amount);
      }
    }

    if (provider === "yape" && rand() < 0.45) {
      const t = templates.find((item) => item.type === "income")!;
      push(t, 20 + rand() * 120);
    }
    if (provider === "bn" && dayOfMonth === 18 && rand() < 0.7) {
      const t = templates.find((item) => item.type === "income" && item.category === "Otros ingresos")!;
      push(t, 100 + rand() * 350);
    }
  }

  return result;
}

export function mockAccountNumber(provider: BankProviderId, seedKey: string) {
  const rand = mulberry32(hashSeed(`account:${provider}:${seedKey}`));
  const digit = () => Math.floor(rand() * 10);
  if (provider === "yape") {
    return `9${digit()}${digit()} ${digit()}${digit()}${digit()} ${digit()}${digit()}${digit()}`;
  }
  if (provider === "bcp") {
    const block = Array.from({ length: 8 }, digit).join("");
    return `191-${block.slice(0, 4)}-${block.slice(4)}-0-21`;
  }
  const block = Array.from({ length: 8 }, digit).join("");
  return `04-${block.slice(0, 3)}-${block.slice(3, 7)}-${block.slice(7)}`;
}
