'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function MyOrdersPage() {
  const { data: session } = useSession();
  const [myOrders, setMyOrders] = useState<any[]>([]);

  const userKey = session?.user?.email ? `orders_${session.user.email}` : 'lownose_orders';

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem(userKey) || '[]');
    setMyOrders(savedOrders);
  }, [userKey]);

  const clearHistory = () => {
    localStorage.removeItem(userKey);
    setMyOrders([]);
  };

  // 1. Nueva función para eliminar un pedido específico
  const deleteOrder = (orderId: number) => {
    const updatedOrders = myOrders.filter((order) => order.id !== orderId);
    setMyOrders(updatedOrders);
    localStorage.setItem(userKey, JSON.stringify(updatedOrders));
  };

  const formatPrice = (value: any) => {
    const numericValue = Number(value);
    return isNaN(numericValue) ? '0' : numericValue.toLocaleString('es-CL');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-24">
      <div className="flex justify-between items-center mb-12">
        <h2 className="text-3xl font-black uppercase tracking-wider">Mis Pedidos</h2>
        
        {myOrders.length > 0 && (
          <button 
            onClick={clearHistory}
            className="text-xs text-red-600 underline uppercase font-bold hover:text-red-800 transition-colors"
          >
            Eliminar historial
          </button>
        )}
      </div>
      
      {myOrders.length === 0 ? (
        <p className="text-sm font-bold uppercase text-gray-500">No se encontraron pedidos.</p>
      ) : (
        <div className="space-y-8">
          {myOrders.map((order: any) => (
            <div key={order.id} className="border border-gray-100 dark:border-neutral-900 p-6 bg-neutral-50 dark:bg-neutral-950">
              {/* Encabezado con ID, Fecha, Hora y botón de eliminar individual */}
              <div className="flex justify-between border-b border-gray-200 dark:border-neutral-800 pb-4 mb-4 font-bold text-sm">
                <div>
                  <span>Orden #{order.id?.toString().slice(-4) || 'N/A'}</span>
                  <span className="ml-4 text-gray-500 text-xs">{order.date} | {order.time}</span>
                </div>
                <button 
                  onClick={() => deleteOrder(order.id)}
                  className="text-[10px] text-red-500 hover:text-red-700 uppercase underline"
                >
                  Eliminar pedido
                </button>
              </div>
              
              {/* Lista de productos con imágenes estilo AliExpress */}
              <div className="space-y-4">
                {order.items?.map((item: any, i: number) => (
                  <div key={i} className="flex items-center space-x-4">
                    <img 
                      src={item.image} 
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
              
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-neutral-800 flex justify-between items-center">
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