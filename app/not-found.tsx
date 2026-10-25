import Link from "next/link";
import { LogoMark } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <LogoMark className="h-12 w-12" />
      <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-mint">Error 404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        No encontramos esta página
      </h1>
      <p className="mt-2 max-w-sm text-sm text-mist">
        Puede que el enlace esté roto o que la página se haya movido. Vuelve a tu resumen para
        seguir con tus finanzas.
      </p>
      <div className="mt-6 flex gap-2">
        <Link href="/dashboard" className="btn btn-primary">
          Ir al resumen
        </Link>
        <Link href="/login" className="btn btn-secondary">
          Iniciar sesión
        </Link>
      </div>
    </div>
  );
}
