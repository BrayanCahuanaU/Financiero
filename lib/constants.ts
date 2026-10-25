export const CURRENCIES = [
  { code: "PEN", symbol: "S/", label: "Sol peruano" },
  { code: "USD", symbol: "$", label: "Dólar estadounidense" },
  { code: "EUR", symbol: "€", label: "Euro" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

export const EXPENSE_CATEGORIES = [
  "Alimentación",
  "Transporte",
  "Vivienda",
  "Servicios",
  "Salud",
  "Educación",
  "Entretenimiento",
  "Compras",
  "Suscripciones",
  "Mascotas",
  "Otros",
] as const;

export const INCOME_CATEGORIES = [
  "Sueldo",
  "Freelance",
  "Ventas",
  "Intereses",
  "Reembolsos",
  "Otros ingresos",
] as const;

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export const CATEGORY_COLORS: Record<string, string> = {
  Alimentación: "#2fe0a4",
  Transporte: "#60a5fa",
  Vivienda: "#a78bfa",
  Servicios: "#fbbf24",
  Salud: "#f87171",
  Educación: "#22d3ee",
  Entretenimiento: "#f472b6",
  Compras: "#fb923c",
  Suscripciones: "#c084fc",
  Mascotas: "#facc15",
  Otros: "#94a3b8",
  Sueldo: "#2fe0a4",
  Freelance: "#38bdf8",
  Ventas: "#a3e635",
  Intereses: "#fbbf24",
  Reembolsos: "#94a3b8",
  "Otros ingresos": "#cbd5e1",
};

export const ACCOUNT_TYPES = [
  { id: "bank", label: "Cuenta bancaria" },
  { id: "wallet", label: "Billetera digital" },
  { id: "cash", label: "Efectivo" },
  { id: "credit", label: "Tarjeta de crédito" },
] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number]["id"];

export const INVESTMENT_TYPES = [
  "Fondo mutuo",
  "Acciones",
  "ETF",
  "Criptomonedas",
  "Depósito a plazo",
  "Bonos",
  "Otros",
] as const;

export const ACCOUNT_COLORS = [
  "#2fe0a4",
  "#60a5fa",
  "#a78bfa",
  "#fbbf24",
  "#f472b6",
  "#fb923c",
  "#22d3ee",
];
