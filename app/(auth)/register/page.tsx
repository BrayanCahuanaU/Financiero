import type { Metadata } from "next";
import { RegisterForm } from "@/components/AuthForms";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Crea tu cuenta gratuita en Yupay y empieza a ordenar tus finanzas.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
