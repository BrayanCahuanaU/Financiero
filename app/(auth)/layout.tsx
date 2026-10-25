import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, LockKeyhole, PiggyBank, Smartphone, Wallet } from "lucide-react";
import { Logo } from "@/components/Logo";
import { getSessionUser } from "@/lib/auth";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.02fr_1fr]">
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-line/70 p-10 lg:flex xl:p-14">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-1/3 h-[420px] w-[420px] rounded-full bg-mint/[0.07] blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 top-0 h-[360px] w-[360px] rounded-full bg-sky-500/[0.06] blur-3xl"
        />

        <Logo href="/" />

        <div className="relative max-w-md">
          <span className="chip mb-5 !border-mint/20 !bg-mint/[0.07] !text-mint">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-mint" /> Finanzas personales en orden
          </span>
          <h2 className="text-4xl font-semibold leading-[1.1] tracking-tight text-white xl:text-[2.7rem]">
            Tus cuentas, metas e inversiones.{" "}
            <span className="bg-gradient-to-r from-mint via-mint-bright to-sky-300 bg-clip-text text-transparent">
              Todo en un solo lugar.
            </span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-mist">
            Un panel claro para decidir mejor: registra tus gastos e ingresos, planifica tus ahorros
            y mira cómo crece tu patrimonio.
          </p>

          <div className="mt-8 space-y-3.5">
            {[
              { icon: Wallet, text: "Cuentas y saldos actualizados al día" },
              { icon: PiggyBank, text: "Metas de ahorro con aportes y progreso" },
              { icon: Smartphone, text: "Tu información sincronizada en celular y laptop" },
              { icon: LockKeyhole, text: "Acceso privado con sesión persistente y segura" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.text} className="flex items-center gap-3 text-[13px] text-slate-300">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-ink-850 text-mint">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  {item.text}
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative flex items-center justify-between text-[11px] text-slate-500">
          <span>Hecho para Perú · Moneda PEN</span>
          <Link href="/" className="inline-flex items-center gap-1 transition hover:text-mint">
            Conoce más <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      <div className="relative flex flex-col">
        <div className="flex items-center justify-between px-5 pb-2 pt-5 lg:hidden">
          <Logo href="/" />
          <Link href="/" className="text-xs text-mist transition hover:text-white">
            Inicio
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8 lg:py-14">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>
      </div>
    </div>
  );
}
