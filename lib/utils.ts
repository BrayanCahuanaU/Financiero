import { CATEGORY_COLORS } from "./constants";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function uid(prefix = "") {
  return `${prefix}${crypto.randomUUID()}`;
}

/** Fecha de hoy (America/Lima) en formato YYYY-MM-DD. */
export function todayISO() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function addDays(dateISO: string, days: number) {
  const d = new Date(`${dateISO}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function currentMonthKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
  })
    .format(date)
    .replace("/", "-");
}

export function monthRange(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return {
    start: `${monthKey}-01`,
    end: `${monthKey}-${String(lastDay).padStart(2, "0")}`,
  };
}

export function monthLabel(monthKey: string, opts: { long?: boolean } = {}) {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, 1));
  return new Intl.DateTimeFormat("es-PE", {
    month: opts.long ? "long" : "short",
    year: "numeric",
    timeZone: "UTC",
  })
    .format(date)
    .replace(".", "");
}

export function shortMonth(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Intl.DateTimeFormat("es-PE", {
    month: "short",
    timeZone: "UTC",
  })
    .format(new Date(Date.UTC(year, month - 1, 1)))
    .replace(".", "");
}

export function formatCurrency(
  value: number,
  currency = "PEN",
  opts: { compact?: boolean; decimals?: boolean } = {},
) {
  const formatter = new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency,
    notation: opts.compact ? "compact" : "standard",
    minimumFractionDigits: opts.compact || opts.decimals === false ? 0 : 2,
    maximumFractionDigits: opts.compact ? 1 : 2,
  });
  return formatter.format(Number.isFinite(value) ? value : 0).replace(/\s/g, " ");
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("es-PE", {
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(dateISO: string, opts: { withYear?: boolean } = {}) {
  const date = new Date(`${dateISO}T12:00:00Z`);
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: opts.withYear === false ? undefined : "numeric",
    timeZone: "UTC",
  })
    .format(date)
    .replace(".", "");
}

export function relativeDate(dateISO: string) {
  const today = todayISO();
  if (dateISO === today) return "Hoy";
  if (dateISO === addDays(today, -1)) return "Ayer";
  return formatDate(dateISO, { withYear: false });
}

export function categoryColor(category: string) {
  return CATEGORY_COLORS[category] ?? "#94a3b8";
}

export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function parseAmount(value: FormDataEntryValue | null): number {
  const clean = String(value ?? "")
    .replace(/[^\d,.-]/g, "")
    .replace(",", ".");
  return Number.parseFloat(clean);
}

export function monthOptions(count = 12, from = new Date()) {
  const options: Array<{ value: string; label: string }> = [];
  for (let i = 0; i < count; i += 1) {
    const d = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() - i, 1));
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    options.push({ value: key, label: monthLabel(key, { long: true }) });
  }
  return options;
}
