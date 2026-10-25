import Link from "next/link";
import {
  Download,
  KeyRound,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";
import { LogoutButton, PasswordForm, ProfileForm, ResetDataButton } from "@/components/SettingsForms";
import { PageHeader } from "@/components/PageHeader";
import { requireSessionUser } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireSessionUser();
  const isDemo = user.email === "demo@yupay.pe";

  return (
    <>
      <PageHeader
        eyebrow="Sistema"
        title="Ajustes"
        subtitle="Tu perfil, la seguridad de tu cuenta y el control de tus datos."
      />

      {isDemo && (
        <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-sky-400/20 bg-sky-500/[0.05] p-4">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
          <p className="text-[11px] leading-relaxed text-sky-100/70">
            Estás usando la <span className="font-semibold text-sky-100">cuenta de demostración</span>.
            Puedes explorar todo sin miedo. Si borras los datos, recuerda que esta cuenta se comparte
            con quien use la demo en este servidor.
          </p>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-mint/10 text-mint">
              <UserRound className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-white">Perfil</h2>
              <p className="text-[11px] text-slate-500">Cómo te llamas y cómo ves tus montos</p>
            </div>
          </div>
          <div className="mb-4 rounded-xl border border-line bg-ink-950/40 p-3">
            <p className="text-[10px] text-slate-500">Correo de acceso</p>
            <p className="mt-0.5 truncate text-xs font-medium text-slate-200">{user.email}</p>
            <p className="mt-2 text-[10px] text-slate-500">
              Miembro desde {formatDate(user.created_at.slice(0, 10))}
            </p>
          </div>
          <ProfileForm name={user.name} currency={user.currency} />
        </section>

        <section className="card p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-400/10 text-sky-300">
              <KeyRound className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-white">Seguridad</h2>
              <p className="text-[11px] text-slate-500">Contraseña y sesión</p>
            </div>
          </div>
          <PasswordForm />
          <div className="mt-5 rounded-xl border border-line bg-ink-950/40 p-3">
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mint" />
              <div>
                <p className="text-[11px] font-medium text-slate-200">Sesión persistente</p>
                <p className="mt-0.5 text-[10px] leading-relaxed text-slate-500">
                  Tu sesión se guarda en una cookie privada de este navegador. Si marcaste “mantener
                  mi sesión”, dura hasta 180 días. Puedes cerrarla cuando quieras.
                </p>
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <LogoutButton />
            </div>
          </div>
        </section>

        <section className="card p-4 sm:p-5 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
              <Download className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-white">Tus datos</h2>
              <p className="text-[11px] text-slate-500">Exporta una copia o empieza de cero</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-line bg-ink-950/40 p-3">
              <p className="text-[11px] font-medium text-slate-200">Exportar movimientos</p>
              <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                Descarga todo tu historial en CSV, compatible con Excel y Google Sheets.
              </p>
              <a href="/api/transactions/export" download className="btn btn-secondary mt-3">
                <Download className="h-3.5 w-3.5" /> Descargar CSV
              </a>
            </div>

            <div className="rounded-xl border border-rose-400/20 bg-rose-500/[0.04] p-3">
              <p className="text-[11px] font-medium text-rose-200">Borrar datos financieros</p>
              <p className="mt-1 text-[10px] leading-relaxed text-rose-100/50">
                Elimina cuentas, movimientos, metas, inversiones y presupuestos. Tu cuenta sigue
                activa.
              </p>
              <div className="mt-3">
                <ResetDataButton />
              </div>
            </div>
          </div>
        </section>

        <section className="card p-4 sm:p-5 lg:col-span-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mint/10 text-mint">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">Yupay · Finanzas personales</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-mist">
                  Versión 1.0 · Hecho para Perú. Tus datos se guardan en tu propia base de datos
                  SQLite, en el servidor donde corre esta app.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/bancos" className="btn btn-secondary">
                Conexiones
              </Link>
              <Link href="/dashboard" className="btn btn-secondary">
                Ir al resumen
              </Link>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-xl border border-line bg-ink-950/40 p-3">
            <Trash2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
            <p className="text-[10px] leading-relaxed text-slate-500">
              ¿Necesitas eliminar tu cuenta por completo? Esta versión no incluye esa acción desde la
              interfaz. Puedes borrar tus datos financieros y dejar de usar el servicio; los
              administradores del servidor pueden eliminar el usuario de la base de datos.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
