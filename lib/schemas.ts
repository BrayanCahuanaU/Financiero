import { z } from "zod";

const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Indica una fecha válida.");
const amount = z.coerce
  .number()
  .finite("Indica un monto válido.")
  .min(0, "El monto no puede ser negativo.")
  .max(99_999_999, "El monto es demasiado grande.");
const positiveAmount = amount.refine((value) => value > 0, "El monto debe ser mayor a cero.");
const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color inválido.");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre.").max(80, "El nombre es muy largo."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(160)
    .refine((value) => /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(value), "Ingresa un correo válido."),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .max(128, "La contraseña es demasiado larga."),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, "Ingresa tu correo."),
  password: z.string().min(1, "Ingresa tu contraseña."),
  remember: z.boolean().optional().default(true),
});

export const transactionSchema = z.object({
  account_id: z.string().min(1, "Selecciona una cuenta."),
  type: z.enum(["income", "expense"]),
  category: z.string().trim().min(1, "Selecciona una categoría.").max(40),
  description: z.string().trim().min(3, "Describe el movimiento.").max(120),
  amount: positiveAmount,
  date,
});

export const accountSchema = z.object({
  name: z.string().trim().min(2, "Ponle un nombre a la cuenta.").max(60),
  type: z.enum(["bank", "wallet", "cash", "credit"]),
  initial_balance: z.coerce
    .number()
    .finite("Indica un saldo válido.")
    .min(-99_999_999)
    .max(99_999_999),
  color: hexColor,
  currency: z.enum(["PEN", "USD", "EUR"]).default("PEN"),
});

export const goalSchema = z.object({
  name: z.string().trim().min(2, "Ponle un nombre a la meta.").max(60),
  target_amount: positiveAmount,
  saved_amount: amount.optional().default(0),
  deadline: z.string().optional().nullable(),
  color: hexColor,
  note: z.string().trim().max(160).optional().nullable(),
});

export const contributionSchema = z.object({
  amount: positiveAmount,
  date,
  note: z.string().trim().max(120).optional().nullable(),
});

export const investmentSchema = z.object({
  name: z.string().trim().min(2, "Ponle un nombre a la inversión.").max(80),
  type: z.string().trim().min(2, "Selecciona un tipo.").max(40),
  institution: z.string().trim().max(60).optional().nullable(),
  invested_amount: amount,
  current_value: amount,
  start_date: date,
  notes: z.string().trim().max(200).optional().nullable(),
});

export const investmentUpdateSchema = z.object({
  current_value: amount,
});

export const budgetSchema = z.object({
  category: z.string().trim().min(1, "Selecciona una categoría.").max(40),
  monthly_limit: positiveAmount,
});

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre.").max(80),
  currency: z.enum(["PEN", "USD", "EUR"]),
});

export const passwordSchema = z.object({
  current_password: z.string().min(1, "Ingresa tu contraseña actual."),
  new_password: z
    .string()
    .min(8, "La nueva contraseña debe tener al menos 8 caracteres.")
    .max(128),
});

export const bankConnectSchema = z.object({
  provider: z.enum(["bcp", "bn", "yape"]),
  document: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().optional(),
  code: z.string().optional(),
});

export const bankProviderSchema = z.object({
  provider: z.enum(["bcp", "bn", "yape"]),
});
