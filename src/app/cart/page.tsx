'use client';

import { useCart } from '@/context/CartContext';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CHILE_DATA } from '@/utils/chile';
import { createClient } from '@supabase/supabase-js';

// Inicialización segura de Supabase para evitar errores de build
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default function CartPage() {
  const { data: session } = useSession();
  const { cart, cartCount, removeFromCart, clearCart, updateItem } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerRegion, setCustomerRegion] = useState('');
  const [customerComuna, setCustomerComuna] = useState('');

  const [showRegionList, setShowRegionList] = useState(false);
  const [showComunaList, setShowComunaList] = useState(false);
  const [openSizeIndex, setOpenSizeIndex] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    if (session) {
      setCustomerName(session.user?.name || '');
      const savedProfile = localStorage.getItem(`profile_${session.user?.email}`);
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        setCustomerAddress(profile.address || '');
        setCustomerRegion(profile.region || '');
        setCustomerComuna(profile.comuna || '');
      }
    }
  }, [session]);

  const subtotal = cart.reduce((total: number, item: any) => total + (Number(item.price) * Number(item.quantity)), 0);

  const shippingCost = customerRegion
    ? (customerRegion.toLowerCase().includes('metropolitana') ? 3000 : 6000)
    : 0;

  const totalWithShipping = subtotal + shippingCost;

  const updateQuantity = (item: any, delta: number) => {
    const newQty = item.quantity + delta;
    const limit = item.maxStock || 99;
    if (newQty >= 1 && newQty <= limit) {
      updateItem({ ...item, quantity: newQty, originalSize: item.size });
    }
  };

  const updateSize = (item: any, newSize: string) => {
    if (item.size === newSize) {
      setOpenSizeIndex(null);
      return;
    }

    const existingTargetItem = cart.find((i: any) => i.id === item.id && i.size === newSize);

    if (existingTargetItem) {
      updateItem({
        ...existingTargetItem,
        quantity: existingTargetItem.quantity + item.quantity,
        originalSize: newSize
      });
      removeFromCart(item.id, item.size);
    } else {
      updateItem({ ...item, size: newSize, originalSize: item.size });
    }

    setOpenSizeIndex(null);
  };

  const handleFinalize = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // --- LÓGICA DE PERSISTENCIA EN SUPABASE ---
    if (session?.user?.email && supabase) {
      try {
        await supabase.from('orders').insert({
          user_id: session.user.id,
          items: cart,
          total: totalWithShipping,
          customer_name: customerName,
          address: customerAddress
        });
      } catch (err) {
        console.error("Error al guardar en Supabase:", err);
      }
    }
    // ------------------------------------------

    // --- LÓGICA DE PRODUCTOS ---
    const allProducts = JSON.parse(localStorage.getItem('lownose_products') || '[]');
    const updatedProducts = allProducts.map((p: any) => {
      const itemInCart = cart.find((i: any) => i.id === p.id);
      if (itemInCart) {
        return { ...p, maxStock: Math.max(0, p.maxStock - itemInCart.quantity) };
      }
      return p;
    });
    localStorage.setItem('lownose_products', JSON.stringify(updatedProducts));

    // Clave dinámica por usuario
    const userKey = session?.user?.email ? `orders_${session.user.email}` : 'lownose_orders';
    
    // --- LÓGICA DE FECHA, HORA E IMÁGENES ---
    const now = new Date();
    const order = {
      id: Date.now(),
      date: now.toLocaleDateString('es-CL'),
      time: now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
      items: cart.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        size: item.size,
        price: item.price,
        image: item.image
      })),
      total: totalWithShipping,
      customer: { name: customerName, address: customerAddress, region: customerRegion, comuna: customerComuna }
    };

    const orders = JSON.parse(localStorage.getItem(userKey) || '[]');
    orders.push(order);
    localStorage.setItem(userKey, JSON.stringify(orders));

    clearCart();
    setOrderConfirmed(true);
    setIsProcessing(false);
  };

  if (orderConfirmed) {
    return (
      <div className="max-w-md mx-auto text-center py-24 px-4">
        <h2 className="text-3xl font-black uppercase tracking-wider mb-4">Pedido Recibido</h2>
        <p className="text-gray-500 mb-8">Gracias, {customerName}. Tu pedido ha sido registrado con éxito.</p>
        <Link href="/shop" className="bg-black text-white dark:bg-white dark:text-black px-8 py-3 font-bold uppercase tracking-widest hover:opacity-80">
          Volver a la tienda
        </Link>
      </div>
    );
  }

  if (cartCount === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-24 px-4">
        <h2 className="text-3xl font-black uppercase tracking-wider mb-4">Carrito vacío</h2>
        <Link href="/shop" className="underline font-bold uppercase text-xs">Ver Productos</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-black uppercase tracking-wider mb-8">Checkout</h2>

      {showReview ? (
        <div className="bg-neutral-50 dark:bg-neutral-950 p-8 border border-gray-100 dark:border-neutral-900 max-w-lg mx-auto">
          <h3 className="font-bold uppercase mb-4">Confirmar envío a:</h3>
          <div className="text-sm space-y-2 mb-6 uppercase font-bold">
            <p>Nombre: {customerName}</p>
            <p>Dirección: {customerAddress}</p>
            <p>Región: {customerRegion}</p>
            <p>Comuna: {customerComuna}</p>
            <div className="pt-4 border-t border-gray-200 dark:border-neutral-800">
              <p>Total a pagar: ${totalWithShipping.toLocaleString('es-CL')}</p>
            </div>
          </div>
          <div className="flex space-x-4">
            <button onClick={() => setShowReview(false)} className="underline text-xs uppercase font-bold">Editar</button>
            <button onClick={handleFinalize} className="bg-black text-white dark:bg-white dark:text-black px-6 py-2 text-xs uppercase font-bold">
              {isProcessing ? 'Procesando...' : 'Confirmar y Pagar'}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item: any, index: number) => (
              <div key={`${item.id}-${item.size}`} className="flex border-b border-gray-100 dark:border-neutral-900 pb-6 items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img src={item.image} alt={item.name} className="w-20 h-24 object-cover bg-gray-100" />
                  <div>
                    <h3 className="font-bold uppercase text-sm">{item.name}</h3>
                    <div className="relative my-2">
                      <div
                        onClick={() => setOpenSizeIndex(openSizeIndex === index ? null : index)}
                        className="cursor-pointer border p-1 text-[10px] font-bold text-500 uppercase flex justify-between items-center w-20 bg-white dark:bg-black"
                      >
                        {item.size} <span>▾</span>
                      </div>
                      {openSizeIndex === index && (
                        <div className="absolute z-50 w-20 bg-white dark:bg-neutral-900 border shadow-lg max-h-40 overflow-y-auto">
                          {(item.availableSizes || ['S', 'M', 'L', 'XL']).map((s: string) => (
                            <div
                              key={s}
                              className="p-2 text-[10px] uppercase cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800"
                              onClick={() => updateSize(item, s)}
                            >
                              {s}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <button
                        onClick={() => updateQuantity(item, -1)}
                        className="px-2 border text-[10px] hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={item.maxStock || 99}
                        value={item.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          const limit = item.maxStock || 99;
                          if (!isNaN(val) && val >= 1 && val <= limit) {
                            updateItem({ ...item, quantity: val, originalSize: item.size });
                          } else if (e.target.value === '') {
                            updateItem({ ...item, quantity: '', originalSize: item.size });
                          }
                        }}
                        onBlur={(e) => {
                          const val = parseInt(e.target.value);
                          const limit = item.maxStock || 99;
                          if (isNaN(val) || val < 1) {
                            updateItem({ ...item, quantity: 1, originalSize: item.size });
                          } else if (val > limit) {
                            updateItem({ ...item, quantity: limit, originalSize: item.size });
                          }
                        }}
                        className="w-10 text-center text-[10px] font-bold border-b border-black dark:border-white bg-transparent focus:outline-none"
                      />
                      <button
                        onClick={() => updateQuantity(item, 1)}
                        className="px-2 border text-[10px] hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        +
                      </button>
                    </div>
                    <button onClick={() => removeFromCart(item.id, item.size)} className="text-[10px] font-bold text-red-500 uppercase underline">Eliminar</button>
                  </div>
                </div>
                <p className="font-bold">${(Number(item.price) * Number(item.quantity)).toLocaleString('es-CL')}</p>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 dark:bg-neutral-950 p-6 border border-gray-100 dark:border-neutral-900 h-fit space-y-4">
            <input placeholder="Nombre" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full border p-2 text-sm bg-white dark:bg-black" />
            <input placeholder="Dirección" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} className="w-full border p-2 text-sm bg-white dark:bg-black" />

            <div className="relative">
              <input readOnly placeholder="Región" value={customerRegion} onClick={() => setShowRegionList(!showRegionList)} className="w-full border p-2 text-sm bg-white dark:bg-black cursor-pointer" />
              {showRegionList && (
                <div className="absolute z-50 w-full bg-white dark:bg-neutral-900 border max-h-40 overflow-y-auto">
                  <div className="p-2 text-xs uppercase cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 text-gray-400 font-bold" onClick={() => { setCustomerRegion(''); setCustomerComuna(''); setShowRegionList(false); }}>-- Limpiar selección --</div>
                  {Object.keys(CHILE_DATA).sort((a, b) => a.localeCompare(b)).map(r => (
                    <div key={r} className="p-2 text-xs uppercase cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => { setCustomerRegion(r); setCustomerComuna(''); setShowRegionList(false); }}>{r}</div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <input readOnly placeholder="Comuna" value={customerComuna} onClick={() => customerRegion && setShowComunaList(!showComunaList)} className="w-full border p-2 text-sm bg-white dark:bg-black cursor-pointer" />
              {showComunaList && (
                <div className="absolute z-50 w-full bg-white dark:bg-neutral-900 border max-h-40 overflow-y-auto">
                  <div className="p-2 text-xs uppercase cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 text-gray-400 font-bold" onClick={() => { setCustomerComuna(''); setShowComunaList(false); }}>-- Limpiar selección --</div>
                  {(CHILE_DATA[customerRegion] || []).sort((a: string, b: string) => a.localeCompare(b)).map((c: string) => (
                    <div key={c} className="p-2 text-xs uppercase cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => { setCustomerComuna(c); setShowComunaList(false); }}>{c}</div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-neutral-800 space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span> <span>${subtotal.toLocaleString('es-CL')}</span></div>
              <div className="flex justify-between"><span>Envío</span> <span>${shippingCost.toLocaleString('es-CL')}</span></div>
              <div className="flex justify-between font-black text-lg pt-2"><span>Total</span> <span>${totalWithShipping.toLocaleString('es-CL')}</span></div>
            </div>

            <button onClick={() => setShowReview(true)} className="w-full bg-black text-white dark:bg-white dark:text-black py-4 font-black uppercase tracking-widest hover:opacity-80">
              Revisar Envío
            </button>
          </div>
        </div>
      )}
    </div>
  );
}