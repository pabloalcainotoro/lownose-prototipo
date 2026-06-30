'use client';

import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import ProductSkeleton from "@/components/ProductSkeleton";

const initialProducts = [
  { id: 1, name: "Oversized Heavy Weight Hoodie", price: 45000, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600", sizes: ["S", "M", "L", "XL"] },
  { id: 2, name: "LowNose Box Logo Tee", price: 22000, image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600", sizes: ["M", "L", "XL", "XXL"] },
  { id: 3, name: "Acid Wash Street Sweatshirt", price: 38000, image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600", sizes: ["S", "M", "L"] }
];

export default function ShopPage() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSizes, setSelectedSizes] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const timer = setTimeout(() => {
      const localData = localStorage.getItem('lownose_products');
      if (localData) {
        setProducts(JSON.parse(localData));
      } else {
        setProducts(initialProducts);
        localStorage.setItem('lownose_products', JSON.stringify(initialProducts));
      }
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
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
    
    // AQUÍ ESTÁ EL CAMBIO: Pasamos el array 'sizes' al contexto
    addToCart({
      ...product,
      size: size,
      availableSizes: product.sizes, // Pasamos las tallas disponibles
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
                  ${product.price.toLocaleString('es-CL')}
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
                          className={`w-9 h-9 text-xs font-mono font-bold border transition-colors cursor-pointer flex items-center justify-center ${
                            isSelected 
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