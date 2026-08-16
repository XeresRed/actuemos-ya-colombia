import type { Metadata } from "next";
import "./globals.css";
import { EmergencyBanner } from "@/components/layout/EmergencyBanner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "ActuemosYaColombia — Plataforma de Respuesta Humanitaria",
  description: "Punto neurálgico de respuesta rápida ciudadana y técnica ante emergencias y desastres naturales en Colombia.",
  openGraph: {
    title: "ActuemosYaColombia — Respuesta Humanitaria Inmediata",
    description: "Centralización de ayuda ciudadana, voluntariado profesional y búsqueda humanitaria ante desastres naturales.",
    type: "website",
    locale: "es_CO",
  },
  icons: {
    icon: "/favicon-actuemos-ya-colombia-asterisco.ico",
    shortcut: "/favicon-actuemos-ya-colombia-asterisco.ico",
    apple: "/favicon-actuemos-ya-colombia-asterisco.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="light">
      <head>
        <link rel="icon" href="/favicon-actuemos-ya-colombia-asterisco.ico" sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@600;700;800&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-background min-h-screen flex flex-col antialiased">
        <EmergencyBanner />
        <Navbar />
        <main className="flex-1 w-full flex flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
