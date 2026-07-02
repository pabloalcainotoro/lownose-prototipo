'use client';

import { useState } from 'react';
import Link from 'next/link';
import { NavbarCounter } from "@/components/NavbarCounter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useSession } from "next-auth/react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-50 bg-[var(--background)] text-[var(--foreground)] border-b border-gray-100 dark:border-neutral-900 px-4 md:px-6 py-4 w-full overflow-x-hidden transition-colors duration-300">
      <div className="flex justify-between items-center max-w-7xl mx-auto w-full">

        {/* LOGO */}
        <Link href="/" className="text-xl md:text-2xl font-black tracking-widest uppercase flex-shrink-0">
          LowNose
        </Link>

        {/* CONTENEDOR DERECHO */}
        <div className="flex items-center space-x-3 md:space-x-6 font-medium text-sm flex-shrink-0">

          {/* Enlaces para PC */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/shop" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              Tienda
            </Link>
            <Link href="/orders" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              Mis Pedidos
            </Link>
            <Link href="/login" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              {session ? 'Mi Cuenta' : 'Iniciar Sesión'}
            </Link>
          </div>

          {/* Utilidades fijas */}
          <NavbarCounter />
          <ThemeToggle />

          {/* BOTÓN 3 LÍNEAS (Móvil) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            type="button"
            className="md:hidden p-1 cursor-pointer focus:outline-none flex items-center justify-center"
            aria-label="Menú"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* MENÚ DESPLEGABLE MÓVIL */}
      {isOpen && (
        <div className="md:hidden flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8 pt-4 pb-2 text-center text-xs font-bold uppercase tracking-wider border-t border-gray-100 dark:border-neutral-900 mt-3">
          <Link href="/shop" onClick={() => setIsOpen(false)} className="hover:text-gray-600 dark:hover:text-gray-300 py-1">
            Tienda
          </Link>
          <Link href="/orders" onClick={() => setIsOpen(false)} className="hover:text-gray-600 dark:hover:text-gray-300 py-1">
            Mis Pedidos
          </Link>
          <Link href="/login" onClick={() => setIsOpen(false)} className="hover:text-gray-600 dark:hover:text-gray-300 py-1">
            Mi Cuenta
          </Link>
        </div>
      )}
    </nav>
  );
}