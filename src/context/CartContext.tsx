'use client';

import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext<any>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('lownose_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        setCart([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('lownose_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: any) => {
    const cleanName = product.name.replace(/\s*\([^)]*\)$/, "").trim();
    const targetSize = product.size || "M";
    
    // Verificamos si ya existe el mismo producto con la misma talla
    const existingIndex = cart.findIndex(
      (item) => item.id === product.id && item.size === targetSize
    );

    if (existingIndex >= 0) {
      // Si ya existe, sumamos la cantidad
      const newCart = [...cart];
      newCart[existingIndex].quantity += (product.quantity || 1);
      setCart(newCart);
    } else {
      // Si no existe, creamos el nuevo objeto
      const productWithData = { 
        ...product, 
        name: cleanName, 
        size: targetSize,
        availableSizes: product.availableSizes || product.sizes || ["S", "M", "L", "XL"],
        price: Number(product.price) || 0,
        quantity: Number(product.quantity) || 1 
      };
      setCart((prev) => [...prev, productWithData]);
    }
  };

  const removeFromCart = (id: string, size?: string) => {
    // Si se pasa el size, eliminamos esa combinación, sino solo por ID
    setCart((prev) => prev.filter((item) => 
      size ? !(item.id === id && item.size === size) : item.id !== id
    ));
  };

  const updateItem = (updatedItem: any) => {
    setCart((prevCart) =>
      prevCart.map((item) => 
        // Identificamos el ítem por ID Y por su talla original
        (item.id === updatedItem.id && item.size === updatedItem.originalSize 
          ? { ...item, ...updatedItem } 
          : item)
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('lownose_cart');
  };

  return (
    <CartContext.Provider value={{ cart, cartCount: cart.length, addToCart, removeFromCart, clearCart, updateItem }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);