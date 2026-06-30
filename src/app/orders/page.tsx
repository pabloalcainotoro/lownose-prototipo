'use client';

import { useState, useEffect } from 'react';

export default function MyOrdersPage() {
  const [myOrders, setMyOrders] = useState<any[]>([]);

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem('lownose_orders') || '[]');
    setMyOrders(savedOrders);
  }, []);

  // Función auxiliar para formatear números de forma segura
  const formatPrice = (value: any) => {
    const numericValue = Number(value);
    return isNaN(numericValue) ? '0' : numericValue.toLocaleString('es-CL');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-24">
      <h2 className="text-3xl font-black uppercase tracking-wider mb-12">My Orders</h2>
      
      {myOrders.length === 0 ? (
        <p className="text-sm font-bold uppercase text-gray-500">No orders found.</p>
      ) : (
        <div className="space-y-8">
          {myOrders.map((order: any) => (
            <div key={order.id} className="border border-gray-100 dark:border-neutral-900 p-6 bg-neutral-50 dark:bg-neutral-950">
              <div className="flex justify-between border-b border-gray-200 dark:border-neutral-800 pb-4 mb-4 font-bold text-sm">
                <span>Order #{order.id?.toString().slice(-4) || 'N/A'}</span>
                <span>{order.date || 'Sin fecha'}</span>
              </div>
              
              <div className="space-y-2">
                {order.items?.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span>{item.name || 'Producto'} x {item.quantity || 0} (Size: {item.size || 'N/A'})</span>
                    {/* Usamos la función segura aquí */}
                    <span>${formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-neutral-800 flex justify-between items-center">
                <span className="text-xs uppercase font-bold">Total Paid:</span>
                {/* Usamos la función segura aquí */}
                <span className="font-black text-lg">${formatPrice(order.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}