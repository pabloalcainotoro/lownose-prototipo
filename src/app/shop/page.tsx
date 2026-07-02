'use client';

import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import ProductSkeleton from "@/components/ProductSkeleton";
import { createClient } from '@supabase/supabase-js';

// Inicialización de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function ShopPage() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSizes, setSelectedSizes] = useState<{ [key: number]: string }>({});

  // Carga de productos desde Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.error("Error al cargar productos:", error);
      } else if (data) {
        setProducts(data);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  const handleSizeSelect = (productId: number, size: string) => {
    setSelectedSizes(prev => ({ ...prev, [productId]: size }));
  };

  const handleAddToCartClick = (product: any) => {
    const size = selectedSizes[product.id];
    if (!size) {
      alert("Por favor, selecciona una talla antes de añadir al carrito.");
      return;
    }

    // Ahora esta función llama al CartProvider conectado a la BD
    addToCart({
      ...product,
      size: size,
      availableSizes: product.sizes,
      maxStock: product.maxStock || 99,
      quantity: 1
    });

    alert(`¡${product.name} (Talla ${size}) añadido al carrito!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="mb-12 border-b border-neutral-100 dark:border-neutral-900 pb-6">
        <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Colección Oficial</h1>
        <p className="text-xs text-neutral-400 uppercase tracking-widest font-medium">Estilo urbano y cortes heavyweight esenciales</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
        {loading ? (
          [1, 2, 3].map((i) => <ProductSkeleton key={i} />)
        ) : products.length === 0 ? (
          <p className="col-span-3 text-center text-neutral-400 font-bold uppercase tracking-widest text-xs">No hay productos disponibles actualmente.</p>
        ) : (
          products.map((product) => (
            <div key={product.id} className="flex flex-col justify-between group">
              <div className="relative aspect-square bg-neutral-50 dark:bg-neutral-950 overflow-hidden mb-4 border border-neutral-100 dark:border-neutral-900">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 ease-out"
                />
              </div>

              <div>
                <h3 className="font-bold uppercase tracking-tight text-md text-black dark:text-white mb-1">
                  {product.name}
                </h3>
                <p className="font-mono text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  ${product.price?.toLocaleString('es-CL')}
                </p>
                <p className="text-[10px] font-bold uppercase text-neutral-400 tracking-widest mb-4">
                  Stock disponible: {product.maxStock || 0}
                </p>

                <div className="mb-5">
                  <span className="block text-[10px] font-black uppercase text-neutral-400 tracking-wider mb-2">
                    Talla:
                  </span>
                  <div className="flex gap-2">
                    {product.sizes && product.sizes.map((size: string) => {
                      const isSelected = selectedSizes[product.id] === size;
                      return (
                        <button
                          key={size}
                          onClick={() => handleSizeSelect(product.id, size)}
                          className={`w-9 h-9 text-xs font-mono font-bold border transition-colors cursor-pointer flex items-center justify-center ${isSelected
                            ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                            : 'border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:border-neutral-400 dark:hover:border-neutral-600'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => handleAddToCartClick(product)}
                  className="w-full bg-black text-white dark:bg-white dark:text-black py-3 text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity cursor-pointer border border-transparent"
                >
                  Añadir al Carrito
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}