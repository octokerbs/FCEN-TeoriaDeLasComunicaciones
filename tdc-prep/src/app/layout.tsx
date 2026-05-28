import type { Metadata } from "next";
import "@/styles/globals.css";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "TdC · Centro de estudio",
  description:
    "Centro interactivo para preparar el final de Teoría de las Comunicaciones (FCEN-UBA): Shannon, OSI, TCP/IP, DNS, criptografía.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-bg text-fg">
        <div className="flex min-h-screen">
          <Nav />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </body>
    </html>
  );
}
