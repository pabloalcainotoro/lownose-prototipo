'use client';

import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react"; 
import { supabase } from "@/lib/supabaseClient";

// --- 1. DEFINICIÓN DEL CONTEXTO (El "Contrato") ---
// Aquí creamos el canal vacío por donde viajarán los datos.
const CartContext = createContext<any>(null);

// --- 2. EL PROVIDER (El "Trabajador" que gestiona la lógica) ---
export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession(); 
  const [cart, setCart] = useState<any[]>([]);

  // Lógica para obtener datos de Supabase
  const refreshCart = async () => {
    if (!session?.user?.email) {
      setCart([]);
      return;
    }
    const { data } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_email', session.user.email);
    
    setCart(data || []);
  };

  useEffect(() => {
    refreshCart();
  }, [session?.user?.email]);

  // Cálculo del contador total (reactivo)
  const cartCount = cart.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);

  // Funciones de control
  const addToCart = async (product: any) => {
    if (!session?.user?.email) return;

    const targetSize = product.size || "M";
    const existing = cart.find(
      (item) => item.product_id === product.id && item.size === targetSize
    );

    if (existing) {
      await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + (product.quantity || 1) })
        .eq('id', existing.id);
    } else {
      await supabase.from('cart_items').insert([{ 
        user_email: session.user.email, 
        product_id: product.id, 
        size: targetSize, 
        quantity: product.quantity || 1,
        name: product.name.replace(/\s*\([^)]*\)$/, "").trim(),
        price: product.price,
        image: product.image // <--- Se envía la propiedad de la imagen a la DB
      }]);
    }
    await refreshCart();
  };

  const removeFromCart = async (id: string) => {
    await supabase.from('cart_items').delete().eq('id', id);
    await refreshCart();
  };

  const updateItem = async (updatedItem: any) => {
    await supabase.from('cart_items').update({ quantity: updatedItem.quantity }).eq('id', updatedItem.id);
    await refreshCart();
  };

  const clearCart = async () => {
    await supabase.from('cart_items').delete().eq('user_email', session?.user?.email);
    setCart([]);
  };

  return (
    // Aquí es donde "inyectamos" los datos al contexto para que estén disponibles globalmente
    <CartContext.Provider value={{ cart, cartCount, addToCart, removeFromCart, clearCart, updateItem }}>
      {children}
    </CartContext.Provider>
  );
}

// --- 3. EL HOOK (El "Atajo" para acceder a los datos) ---
export const useCart = () => useContext(CartContext);