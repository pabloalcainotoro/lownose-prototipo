// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext"; 
import { SessionProvider } from "@/context/SessionProvider"; 
import Navbar from "@/components/Navbar"; 
import Breadcrumbs from "@/components/Breadcrumbs"; // Componente nuevo

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LowNose Apparel | Tienda Oficial",
  description: "Estilo urbano, minimalista y sin pretensiones.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <SessionProvider>
          <CartProvider> 
            
            {/* Navbar interactivo */}
            <Navbar />
            
            {/* Contenedor principal con Breadcrumbs integrado */}
            <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
              <Breadcrumbs />
              {children}
            </main>

          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}