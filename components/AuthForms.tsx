"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/client";

const DEMO_EMAIL = "demo@yupay.pe";
const DEMO_PASSWORD = "demo1234";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  async function login(emailValue: string, passwordValue: string) {
    await apiRequest("/api/auth/login", {
      method: "POST",
      body: { email: emailValue, password: passwordValue, remember },
    });
    router.replace("/dashboard");
    router.refresh();
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo iniciar sesión.");
      setLoading(false);
    }
  }

  async function demo() {
    setError("");
    setDemoLoading(true);
    try {
      await login(DEMO_EMAIL, DEMO_PASSWORD);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo iniciar la demo.");
      setDemoLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Bienvenido de vuelta
        </h1>
        <p className="mt-2 text-sm text-mist">
          Entra para ver cómo están tus cuentas hoy.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="email">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tu@correo.com"
            className="field !py-3"
          />
        </div>

        <div>
          <label className="label" htmlFor="password">
            Contraseña
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="field !py-3 pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-300"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-line bg-ink-950/40 p-3">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-line bg-ink-900 accent-[#2fe0a4]"
          />
          <span className="text-[11px] leading-relaxed text-slate-400">
            <span className="font-medium text-slate-200">Mantener mi sesión iniciada</span> en este
            navegador por 180 días. No tendrás que ingresar tus datos cada vez.
          </span>
        </label>

        {error && (
          <p className="rounded-lg border border-rose-400/25 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {error}
          </p>
        )}

        <button type="submit" className="btn btn-primary w-full !py-3" disabled={loading || demoLoading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          Iniciar sesión
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">o prueba</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <button
        type="button"
        onClick={demo}
        disabled={loading || demoLoading}
        className="btn btn-secondary w-full !py-2.5"
      >
        {demoLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4 text-mint" />
        )}
        Entrar con la cuenta demo
      </button>
      <p className="mt-2 text-center text-[10px] text-slate-500">
        Demo: {DEMO_EMAIL} · contraseña {DEMO_PASSWORD}
      </p>

      <p className="mt-6 text-center text-xs text-mist">
        ¿Aún no tienes cuenta?{" "}
        <Link href="/register" className="font-semibold text-mint hover:text-mint-bright">
          Crear una gratis
        </Link>
      </p>
    </div>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Usa una contraseña de al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    try {
      await apiRequest("/api/auth/register", {
        method: "POST",
        body: { name: name.trim(), email: email.trim(), password },
      });
      router.replace("/dashboard");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo crear la cuenta.");
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Crea tu cuenta
        </h1>
        <p className="mt-2 text-sm text-mist">
          Empieza a ordenar tus gastos, ahorros e inversiones en minutos.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="name">
            Nombre completo
          </label>
          <input
            id="name"
            autoComplete="name"
            required
            maxLength={80}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Valeria Quispe"
            className="field !py-3"
          />
        </div>

        <div>
          <label className="label" htmlFor="register-email">
            Correo electrónico
          </label>
          <input
            id="register-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tu@correo.com"
            className="field !py-3"
          />
        </div>

        <div>
          <label className="label" htmlFor="register-password">
            Contraseña
          </label>
          <div className="relative">
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="field !py-3 pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-300"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="register-confirm">
            Repite la contraseña
          </label>
          <input
            id="register-confirm"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={8}
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            placeholder="••••••••"
            className="field !py-3"
          />
        </div>

        {error && (
          <p className="rounded-lg border border-rose-400/25 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {error}
          </p>
        )}

        <button type="submit" className="btn btn-primary w-full !py-3" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          Crear mi cuenta
        </button>

        <p className="text-center text-[10px] leading-relaxed text-slate-500">
          Al crear tu cuenta aceptas que tus datos financieros se guarden en este servidor para
          sincronizarlos entre tu celular y laptop. Puedes borrarlos cuando quieras.
        </p>
      </form>

      <p className="mt-5 text-center text-xs text-mist">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-semibold text-mint hover:text-mint-bright">
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}
