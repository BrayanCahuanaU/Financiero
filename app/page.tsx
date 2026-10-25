import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  LockKeyhole,
  PiggyBank,
  ShieldCheck,
  Smartphone,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const FEATURES = [
  {
    icon: ArrowLeftRight,
    title: "Controla tus gastos",
    description:
      "Registra cada movimiento en segundos, clasifícalo y entiende en qué se te va el dinero.",
  },
  {
    icon: PiggyBank,
    title: "Ahorra con propósito",
    description:
      "Crea metas, define fechas y registra aportes. Mira tu progreso crecer sin hojas de cálculo.",
  },
  {
    icon: TrendingUp,
    title: "Sigue tus inversiones",
    description:
      "Fondos, acciones, cripto o depósitos: conoce tu rendimiento real en un solo portafolio.",
  },
  {
    icon: Target,
    title: "Planifica tu mes",
    description:
      "Pon límites por categoría y recibe una señal clara cuando estás por pasarte del presupuesto.",
  },
  {
    icon: Wallet,
    title: "Cuentas y saldos",
    description:
      "Agrupa tus cuentas bancarias, billeteras y efectivo; cada movimiento actualiza tu saldo automáticamente.",
  },
  {
    icon: Smartphone,
    title: "En tu celular y laptop",
    description:
      "Tu cuenta vive en el servidor: entra desde cualquier dispositivo y encuentra los mismos datos.",
  },
];

export default async function LandingPage() {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-line/50 bg-ink-950/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-7 text-xs font-medium text-mist sm:flex">
            <a href="#funciones" className="transition hover:text-white">
              Funciones
            </a>
            <a href="#seguridad" className="transition hover:text-white">
              Seguridad
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn btn-ghost">
              Iniciar sesión
            </Link>
            <Link href="/register" className="btn btn-primary">
              <span className="hidden sm:inline">Crear cuenta</span>
              <span className="sm:hidden">Empezar</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-40 top-10 h-[420px] w-[420px] rounded-full bg-mint/[0.06] blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-28 top-0 h-[380px] w-[380px] rounded-full bg-sky-500/[0.05] blur-3xl"
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-[1.02fr_1fr] lg:gap-10 lg:pb-24 lg:pt-20">
            <div>
              <span className="chip !border-mint/20 !bg-mint/[0.06] !text-mint">
                <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-mint" />
                Finanzas personales · Hecho para Perú
              </span>
              <h1 className="mt-5 text-[2.6rem] font-semibold leading-[1.03] tracking-tight text-white sm:text-6xl">
                Tus finanzas,
                <br />
                <span className="bg-gradient-to-r from-mint via-mint-bright to-sky-300 bg-clip-text text-transparent">
                  por fin claras.
                </span>
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-relaxed text-mist sm:text-base">
                Gastos, ahorros, inversiones y cuentas en un solo panel. Registra tus movimientos y
                toma mejores decisiones desde tu celular o laptop.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link href="/register" className="btn btn-primary !px-5 !py-3">
                  Empezar gratis <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/login" className="btn btn-secondary !px-5 !py-3">
                  <Wallet className="h-4 w-4" /> Ver la demo
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-mint" /> Sin tarjetas ni costos
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <LockKeyhole className="h-3.5 w-3.5 text-mint" /> Sesión persistente y privada
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Smartphone className="h-3.5 w-3.5 text-mint" /> Celular y laptop
                </span>
              </div>
            </div>

            {/* Mockup del panel */}
            <div className="relative mx-auto w-full max-w-[430px] lg:mx-0 lg:ml-auto">
              <div
                aria-hidden
                className="absolute -inset-6 rounded-[2rem] bg-gradient-to-tr from-mint/10 via-transparent to-sky-400/10 blur-2xl"
              />
              <div className="card relative overflow-hidden p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-mint/15 text-[10px] font-bold text-mint">
                      V
                    </span>
                    <div>
                      <p className="text-[11px] font-semibold text-white">Hola, Valeria</p>
                      <p className="text-[9px] text-slate-500">Resumen de octubre</p>
                    </div>
                  </div>
                  <span className="chip !border-mint/20 !bg-mint/[0.06] !py-0.5 !text-[9px] !text-mint">
                    <span className="h-1 w-1 rounded-full bg-mint" /> Al día
                  </span>
                </div>

                <div className="mt-5">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                    Patrimonio neto
                  </p>
                  <p className="mt-1 text-3xl font-semibold tracking-tight text-white tnum">
                    S/ 18,472.50
                  </p>
                  <p className="mt-1 text-[10px] text-mint">+8.4% este mes</p>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    { label: "Ingresos", value: "4,150", tone: "text-mint" },
                    { label: "Gastos", value: "2,340", tone: "text-rose-300" },
                    { label: "Ahorro", value: "1,810", tone: "text-amber-300" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-line bg-ink-950/50 p-2.5">
                      <p className="text-[8px] uppercase tracking-wider text-slate-500">{item.label}</p>
                      <p className={`mt-1 text-[12px] font-semibold tnum ${item.tone}`}>S/ {item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-xl border border-line bg-ink-950/40 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-medium text-slate-300">Flujo de caja</p>
                    <p className="text-[8px] text-slate-500">Últimos 6 meses</p>
                  </div>
                  <svg viewBox="0 0 300 86" className="mt-2 h-[76px] w-full" aria-hidden="true">
                    <defs>
                      <linearGradient id="landing-area" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2fe0a4" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#2fe0a4" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {[16, 38, 60].map((y) => (
                      <line key={y} x1="0" x2="300" y1={y} y2={y} stroke="#1a2634" strokeDasharray="2 6" />
                    ))}
                    <path
                      d="M4 62 C 30 58, 45 44, 68 48 C 90 52, 105 30, 128 34 C 150 38, 165 22, 188 26 C 210 30, 228 14, 252 18 C 270 21, 284 12, 296 14 L 296 86 L 4 86 Z"
                      fill="url(#landing-area)"
                    />
                    <path
                      d="M4 62 C 30 58, 45 44, 68 48 C 90 52, 105 30, 128 34 C 150 38, 165 22, 188 26 C 210 30, 228 14, 252 18 C 270 21, 284 12, 296 14"
                      fill="none"
                      stroke="#2fe0a4"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M4 74 C 34 70, 46 64, 70 66 C 96 68, 110 58, 132 60 C 154 62, 172 52, 194 55 C 216 58, 232 46, 254 50 C 272 53, 284 46, 296 48"
                      fill="none"
                      stroke="#fb7185"
                      strokeWidth="1.5"
                      strokeOpacity="0.65"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <div className="mt-3 rounded-xl border border-line bg-ink-950/40 p-2.5">
                  <div className="flex items-center justify-between text-[9px]">
                    <span className="text-slate-400">Meta · Viaje a Cusco</span>
                    <span className="font-semibold text-mint">61%</span>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-ink-700">
                    <div className="h-full w-[61%] rounded-full bg-mint" />
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  {[
                    { name: "Wong · compra semanal", category: "Alimentación", value: "− S/ 124.90", tone: "text-slate-200" },
                    { name: "Yape recibido", category: "Ventas", value: "+ S/ 85.00", tone: "text-mint" },
                  ].map((tx) => (
                    <div key={tx.name} className="flex items-center justify-between gap-2 text-[9px]">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/[0.04] text-slate-500">
                          <ArrowUpRight className="h-2.5 w-2.5" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-slate-300">{tx.name}</p>
                          <p className="text-[8px] text-slate-600">{tx.category}</p>
                        </div>
                      </div>
                      <span className={`shrink-0 font-medium tnum ${tx.tone}`}>{tx.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card absolute -bottom-5 -left-3 hidden items-center gap-2.5 p-3 sm:flex lg:-left-8">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-mint/10 text-mint">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold text-white">Sesión segura</p>
                  <p className="text-[9px] text-slate-500">Protegida en tu navegador</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="funciones" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mint/80">
              Todo lo que necesitas
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Menos planillas. Más claridad para decidir.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-mist">
              Yupay reúne el día a día de tu dinero y la planificación de tus metas en una sola
              experiencia simple, rápida y pensada para Perú.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="card p-5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-mint/10 text-mint">
                    <Icon className="h-4 w-4" />
                  </span>
                  <h3 className="mt-3.5 text-sm font-semibold text-white">{feature.title}</h3>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-mist">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section id="seguridad" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mint/80">
                Privacidad por diseño
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Tu información es tuya. Y solo tuya.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-mist">
                Cada cuenta tiene su propio espacio en la base de datos. Tu contraseña se guarda
                cifrada y tu sesión se mantiene de forma segura para que no tengas que iniciar sesión
                a cada rato.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  { title: "Sesión persistente", text: "Hasta 180 días en tu navegador." },
                  { title: "Contraseñas cifradas", text: "Hash scrypt con sal única." },
                  { title: "Datos aislados", text: "Cada usuario ve solo lo suyo." },
                  { title: "Control total", text: "Exporta o borra tus datos cuando quieras." },
                ].map((item) => (
                  <div key={item.title} className="card-flat p-3.5">
                    <p className="text-[11px] font-semibold text-slate-200">{item.title}</p>
                    <p className="mt-1 text-[10px] leading-relaxed text-slate-500">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card relative overflow-hidden p-6 sm:p-8">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-mint/[0.08] blur-3xl"
              />
              <div className="relative">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mint/10 text-mint">
                  <LockKeyhole className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-white">Tu sesión, sin fricción</h3>
                <p className="mt-2 text-xs leading-relaxed text-mist">
                  Marca “mantener mi sesión” al entrar y Yupay recordará tu acceso de forma segura.
                  Así puedes revisar tus finanzas en el celular camino al trabajo y continuar en tu
                  laptop por la noche.
                </p>
                <div className="mt-5 space-y-2.5">
                  {[
                    "Cookie privada HttpOnly y SameSite",
                    "Duración de 30 días, o 180 si la recuerdas",
                    "Cierre de sesión inmediato cuando lo pidas",
                  ].map((item) => (
                    <p key={item} className="flex items-center gap-2 text-[11px] text-slate-300">
                      <CheckCircle2 className="h-3.5 w-3.5 text-mint" /> {item}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:pb-24">
          <div className="card relative overflow-hidden p-6 text-center sm:p-10">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 -bottom-24 h-48 bg-gradient-to-t from-mint/10 to-transparent blur-2xl"
            />
            <div className="relative">
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Empieza hoy a ordenar tu dinero.
              </h2>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-mist">
                Crea tu cuenta gratis o entra a la demo para explorar con datos de ejemplo. En menos
                de dos minutos ya tendrás tu primer resumen.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link href="/register" className="btn btn-primary !px-5 !py-3">
                  Crear mi cuenta <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/login" className="btn btn-secondary !px-5 !py-3">
                  Entrar con la demo
                </Link>
              </div>
              <p className="mt-3 text-[10px] text-slate-500">
                Demo: demo@yupay.pe · contraseña demo1234
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <Logo href="/" showWordmark={false} />
            <div>
              <p className="text-xs font-medium text-slate-300">Yupay · Finanzas personales</p>
              <p className="text-[10px] text-slate-500">
                Hecho para Perú. Tus datos, bajo tu control.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-slate-500">
            <Link href="/login" className="transition hover:text-white">
              Iniciar sesión
            </Link>
            <Link href="/register" className="transition hover:text-white">
              Crear cuenta
            </Link>
            <span>© {new Date().getFullYear()} Yupay</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
