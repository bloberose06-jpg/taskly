

// Agregá estas líneas a tu layout.tsx existente:
// 1. Importar NextSSRPlugin y extractRouterConfig
// 2. Importar ourFileRouter
// 3. Agregar <NextSSRPlugin> dentro del <body>

import type { Metadata } from "next";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { Analytics } from "@vercel/analytics/next";
// import { Geist, Geist_Mono } from "next/font/google";  // ← mantené tus fuentes
import "./globals.css";


export const metadata: Metadata = {
  title: "Taskly",
  description: "Plataforma de trabajos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        {/* Plugin de SSR para UploadThing — evita el estado de carga */}
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
