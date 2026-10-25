"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeftRight,
  ChevronRight,
  LayoutDashboard,
  LineChart,
  LogOut,
  Menu,
  PiggyBank,
  Plus,
  Settings,
  Target,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { Logo, LogoMark } from "@/components/Logo";
import { cn, initials } from "@/lib/utils";
import type { SessionUser } from "@/lib/auth";

type NavItem = { href: string; label: string; icon: LucideIcon; badge?: string };

const GROUPS: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "General",
    items: [
      { href: "/dashboard", label: "Resumen", icon: LayoutDashboard },
      { href: "/movimientos", label: "Movimientos", icon: ArrowLeftRight },
      { href: "/presupuestos", label: "Presupuestos", icon: Target },
    ],
  },
  {
    label: "Patrimonio",
    items: [
      { href: "/cuentas", label: "Cuentas", icon: Wallet },
      { href: "/ahorros", label: "Ahorros", icon: PiggyBank },
      { href: "/inversiones", label: "Inversiones", icon: LineChart },
    ],
  },
  {
    label: "Sistema",
    items: [{ href: "/ajustes", label: "Ajustes", icon: Settings }],
  },
];

const MOBILE_NAV: NavItem[] = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/movimientos", label: "Movs.", icon: ArrowLeftRight },
  { href: "/ahorros", label: "Ahorros", icon: PiggyBank },
  { href: "/cuentas", label: "Cuentas", icon: Wallet },
];

function active(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  const userCard = (
    <div className="rounded-2xl border border-line/80 bg-ink-800/50 p-3">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mint/15 text-xs font-bold text-mint">
          {initials(user.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-white">{user.name}</p>
          <p className="truncate text-[11px] text-mist">{user.email}</p>
        </div>
        <span className="chip !px-1.5 !py-0.5 !text-[10px]">{user.currency}</span>
      </div>
      <button
        type="button"
        onClick={logout}
        disabled={loggingOut}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-line px-2 py-1.5 text-[11px] font-medium text-mist transition hover:border-rose-400/30 hover:text-rose-300 disabled:opacity-50"
      >
        <LogOut className="h-3 w-3" />
        {loggingOut ? "Cerrando sesión…" : "Cerrar sesión"}
      </button>
    </div>
  );

  return (
    <div className="min-h-dvh">
      {/* Sidebar de escritorio */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col border-r border-line/70 bg-ink-950/60 px-4 py-5 backdrop-blur-xl lg:flex">
        <div className="px-1">
          <Logo href="/dashboard" />
        </div>

        <Link
          href="/movimientos?nuevo=1"
          className="btn btn-primary mt-6 w-full !py-2.5"
        >
          <Plus className="h-4 w-4" strokeWidth={2.4} />
          Nuevo movimiento
        </Link>

        <nav className="scrollbar-none mt-6 flex-1 space-y-5 overflow-y-auto pb-4">
          {GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = active(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-medium transition",
                          isActive
                            ? "border border-mint/15 bg-mint/10 text-mint"
                            : "border border-transparent text-mist hover:bg-white/[0.035] hover:text-white",
                        )}
                      >
                        <Icon className="h-4 w-4" strokeWidth={isActive ? 2.3 : 1.9} />
                        <span className="flex-1">{item.label}</span>
                        {isActive && <span className="h-1 w-1 rounded-full bg-mint" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {userCard}
        <p className="mt-3 px-1 text-[10px] leading-relaxed text-slate-600">
          Sesión guardada de forma segura en este navegador.
        </p>
      </aside>

      {/* Contenido */}
      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line/60 bg-ink-950/85 px-4 backdrop-blur-xl lg:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="-ml-1 rounded-xl p-2 text-slate-300 transition hover:bg-white/5"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Logo href="/dashboard" />
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-mint/20 bg-mint/10 text-[11px] font-bold text-mint"
            aria-label="Ver mi cuenta"
          >
            {initials(user.name)}
          </button>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 pb-32 pt-5 sm:px-6 lg:px-10 lg:pb-16 lg:pt-8">
          <div className="page-enter">{children}</div>
        </main>
      </div>

      {/* Barra inferior móvil */}
      <nav className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-md rounded-2xl border border-line/90 bg-ink-900/90 px-2 py-2 shadow-2xl backdrop-blur-xl lg:hidden">
        <ul className="flex items-center justify-between">
          {MOBILE_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = active(pathname, item.href);
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-medium transition",
                    isActive ? "text-mint" : "text-slate-500",
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.3 : 1.8} />
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li className="flex-1">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex w-full flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-medium text-slate-500"
            >
              <Menu className="h-[18px] w-[18px]" strokeWidth={1.8} />
              Menú
            </button>
          </li>
        </ul>
      </nav>

      {/* Drawer móvil */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <div className="page-enter absolute inset-y-0 left-0 flex w-[86%] max-w-[320px] flex-col border-r border-line bg-ink-950 px-4 py-5">
            <div className="flex items-center justify-between">
              <Logo href="/dashboard" />
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/5"
                aria-label="Cerrar menú"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <Link
              href="/movimientos?nuevo=1"
              className="btn btn-primary mt-5 w-full"
            >
              <Plus className="h-4 w-4" />
              Nuevo movimiento
            </Link>

            <nav className="scrollbar-none mt-5 flex-1 space-y-5 overflow-y-auto pb-4">
              {GROUPS.map((group) => (
                <div key={group.label}>
                  <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {group.label}
                  </p>
                  <ul className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = active(pathname, item.href);
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-sm font-medium transition",
                              isActive
                                ? "bg-mint/10 text-mint"
                                : "text-mist hover:bg-white/5 hover:text-white",
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="flex-1">{item.label}</span>
                            <ChevronRight className="h-3.5 w-3.5 opacity-40" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>

            {userCard}
          </div>
        </div>
      )}
    </div>
  );
}
