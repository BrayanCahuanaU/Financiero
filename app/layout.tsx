import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: {
    default: "Yupay · Finanzas personales en orden",
    template: "%s · Yupay",
  },
  description:
    "Administra tus gastos, ahorros, inversiones e ingresos. Conecta tus cuentas de BCP, Banco de la Nación y Yape, y mantén tus finanzas claras desde tu celular o laptop.",
  applicationName: "Yupay",
  keywords: ["finanzas personales", "gastos", "ahorros", "inversiones", "Perú", "Yape", "BCP"],
};

export const viewport: Viewport = {
  themeColor: "#05080c",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
