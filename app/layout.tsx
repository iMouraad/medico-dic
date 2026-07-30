import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "NEOSDOC | El directorio médico que conecta a Ecuador con la salud",
  description: "Conectamos médicos, impulsamos soluciones. Encuentra al médico ideal cerca de ti, verificado ante SENESCYT. Perfil 100% gratuito para médicos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50/50 text-slate-900">{children}</body>
    </html>
  );
}
