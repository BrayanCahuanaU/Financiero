import type { Metadata } from "next";
import { LoginForm } from "@/components/AuthForms";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Entra a tu panel de finanzas personales Yupay.",
};

export default function LoginPage() {
  return <LoginForm />;
}
