// src/components/Breadcrumbs.tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Breadcrumbs() {
  const pathname = usePathname();
  
  // Diccionario para traducir los segmentos de la URL
  const labels: { [key: string]: string } = {
    'shop': 'Tienda',
    'login': 'Mi Cuenta',
    'cart': 'Carrito',
    'profile': 'Perfil',

  };

  if (pathname === '/') return null;

  const pathSegments = pathname.split('/').filter(segment => segment !== '');

  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-[10px] uppercase tracking-widest font-bold text-neutral-400">
      <ol className="flex items-center space-x-2">
        <li>
          <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">Inicio</Link>
        </li>
        {pathSegments.map((segment, index) => {
          const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
          const isLast = index === pathSegments.length - 1;
          
          // Traducimos el segmento si existe en el diccionario, sino dejamos el nombre original capitalizado
          const label = labels[segment.toLowerCase()] || segment.charAt(0).toUpperCase() + segment.slice(1);

          return (
            <li key={href} className="flex items-center space-x-2">
              <span>/</span>
              {isLast ? (
                <span className="text-black dark:text-white">{label}</span>
              ) : (
                <Link href={href} className="hover:text-black dark:hover:text-white transition-colors">
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}