import type { Metadata } from "next";
import "./globals.css";
import "../styles/themes.css";

export const metadata: Metadata = {
  title: "MemoFlip Neo - No es un Memory cualquiera",
  description: "Un juego de memoria único con 1000 niveles, mecánicas especiales y múltiples temas",
  keywords: "juego, memoria, memory, cartas, niveles, puzzle",
  authors: [{ name: "Intocables 13" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#0b132b",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}