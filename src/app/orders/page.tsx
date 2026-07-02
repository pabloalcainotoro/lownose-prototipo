'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { createClient } from '@supabase/supabase-js';

// Inicialización segura de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default function MyOrdersPage() {
  const { data: session } = useSession();
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!session?.user?.email || !supabase) {
        setLoading(false);
        return;
      }

      try {
        // Consultamos directamente a la tabla 'orders' de Supabase filtrando por el email del usuario
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_email', session.user.email)
          .order('created_at', { ascending: false }); // Las más recientes primero

        if (error) throw error;

        if (data) {
          // Adaptamos la estructura de Supabase a la que ya usa tu diseño
          const formattedOrders = data.map((order: any) => {
            const dateObj = new Date(order.created_at);
            return {
              id: order.id,
              date: dateObj.toLocaleDateString('es-CL'),
              time: dateObj.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
              items: order.items, // JSONB directo de la DB
              total: order.total_price, // Usamos la columna real total_price
              customer: {
                name: order.customer_name,
                address: order.address // Viene la dirección completa formateada
              }
            };
          });
          setMyOrders(formattedOrders);
        }
      } catch (err) {
        console.error("Error al obtener las órdenes desde Supabase:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [session]);

  const formatPrice = (value: any) => {
    const numericValue = Number(value);
    return isNaN(numericValue) ? '0' : numericValue.toLocaleString('es-CL');
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <p className="text-xs uppercase font-bold tracking-widest animate-pulse">Sincronizando con la base de datos...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-24">
      <div className="flex justify-between items-center mb-12">
        <h2 className="text-3xl font-black uppercase tracking-wider">Mis Pedidos</h2>
      </div>
      
      {myOrders.length === 0 ? (
        <p className="text-sm font-bold uppercase text-gray-500">No se encontraron pedidos en la base de datos.</p>
      ) : (
        <div className="space-y-8">
          {myOrders.map((order: any) => (
            <div key={order.id} className="border border-gray-100 dark:border-neutral-900 p-6 bg-neutral-50 dark:bg-neutral-950">
              
              <div className="flex justify-between border-b border-gray-200 dark:border-neutral-800 pb-4 mb-4 font-bold text-sm">
                <div>
                  <span>Orden #{order.id}</span>
                  <span className="ml-4 text-gray-500 text-xs">{order.date} | {order.time}</span>
                </div>
              </div>
              
              {/* Lista de productos */}
              <div className="space-y-4">
                {order.items?.map((item: any, i: number) => (
                  <div key={i} className="flex items-center space-x-4">
                    <img 
                      src={item.image || "/placeholder.png"} 
                      alt={item.name} 
                      className="w-16 h-16 object-cover bg-gray-100" 
                    />
                    <div className="flex-1 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold uppercase">{item.name}</p>
                        <p className="text-gray-500">Talla: {item.size} | Cant: {item.quantity}</p>
                      </div>
                      <span className="font-bold">${formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Datos de envío */}
              <div className="mt-4 pt-2 text-[10px] text-gray-400 uppercase font-mono">
                <p>Destinatario: {order.customer?.name}</p>
                <p>Despacho: {order.customer?.address}</p>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-800 flex justify-between items-center">
                <span className="text-xs uppercase font-bold">Total pagado:</span>
                <span className="font-black text-lg">${formatPrice(order.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}