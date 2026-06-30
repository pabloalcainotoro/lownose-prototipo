// src/app/page.tsx (Sección 2 y 4 modificadas para heredar el fondo correctamente)
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative flex items-center justify-center h-[85vh] bg-neutral-950 text-white text-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1509281373149-e957c6296406?w=1200" 
          alt="LowNose Apparel" 
          className="absolute inset-0 w-full h-full object-cover opacity-70 scale-105 select-none"
        />
        <div className="relative z-20 max-w-2xl">
          <span className="text-xs font-bold tracking-widest uppercase text-gray-400 block mb-3">Drop 2026 / Edición Limitada</span>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-6 uppercase">LOWNOSE</h1>
          <p className="text-base md:text-lg text-gray-300 mb-8 max-w-md mx-auto font-light tracking-wide">
            Estilo urbano, cortes oversized y diseño sin pretensiones.
          </p>
          <Link href="/shop" className="inline-block bg-white text-black px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors rounded-none">
            Explorar Colección
          </Link>
        </div>
      </section>

      {/* 2. Pilares de Marca - Cambiado a fondo transparente con texto adaptativo */}
      <section className="py-16 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center border-b border-gray-100 dark:border-neutral-900 bg-transparent">
        <div>
          <h3 className="font-bold uppercase tracking-wider text-sm mb-2">Envíos a todo Chile</h3>
          <p className="text-xs text-gray-500 dark:text-neutral-400">Coordinación directa vía Starken o Chilexpress por pagar.</p>
        </div>
        <div>
          <h3 className="font-bold uppercase tracking-wider text-sm mb-2">Calidad Heavyweight</h3>
          <p className="text-xs text-gray-500 dark:text-neutral-400">Algodón de alto gramaje para máxima durabilidad.</p>
        </div>
        <div>
          <h3 className="font-bold uppercase tracking-wider text-sm mb-2">Drops Exclusivos</h3>
          <p className="text-xs text-gray-500 dark:text-neutral-400">Unidades limitadas por prenda. No hacemos re-stock masivo.</p>
        </div>
      </section>

      {/* 3. Categorías */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative group h-96 bg-neutral-900 overflow-hidden">
            <div className="absolute inset-0 bg-black/40 z-10" />
            <img src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600" alt="Hoodies" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute bottom-8 left-8 z-20">
              <h4 className="text-2xl font-black text-white uppercase tracking-wide mb-2">Hoodies & Polerones</h4>
              <Link href="/shop" className="text-xs text-white font-bold uppercase tracking-widest underline underline-offset-4">Ver prendas →</Link>
            </div>
          </div>
          <div className="relative group h-96 bg-neutral-900 overflow-hidden">
            <div className="absolute inset-0 bg-black/40 z-10" />
            <img src="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600" alt="Tees" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute bottom-8 left-8 z-20">
              <h4 className="text-2xl font-black text-white uppercase tracking-wide mb-2">Essentials & Tees</h4>
              <Link href="/shop" className="text-xs text-white font-bold uppercase tracking-widest underline underline-offset-4">Ver prendas →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Footer - Cambiado de bg-neutral-50 fijo a bg-transparent */}
      <footer className="py-8 bg-transparent text-center border-t border-gray-100 dark:border-neutral-900">
        <p className="text-xs text-gray-400 tracking-widest uppercase">© 2026 LowNose Apparel. Hecho en Chile.</p>
      </footer>
    </div>
  );
}