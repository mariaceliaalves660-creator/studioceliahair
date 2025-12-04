"use client";

import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { ShoppingBag, Clock, CheckCircle, MapPin, Phone, Truck, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Order } from '../types';

export const OrdersScreen: React.FC = () => {
  const { orders, updateOrder, currentAdmin } = useData(); // Obter currentAdmin
  const [filter, setFilter] = useState<'pending' | 'completed' | 'all'>('pending');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const filteredOrders = orders.filter(o => {
    if (filter === 'pending') return o.status === 'pending' || o.status === 'processing';
    if (filter === 'completed') return o.status === 'completed' || o.status === 'cancelled';
    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleStatusChange = (order: Order, newStatus: Order['status']) => {
    // Passar o ID e nome do administrador logado ao atualizar o status para 'completed'
    const adminId = currentAdmin?.id;
    const adminName = currentAdmin?.name;
    updateOrder({ ...order, status: newStatus }, adminId, adminName);
  };

  return (
    <div className="p-4 pb-20">
      <div className="flex justify-between items-center mb-6">
         <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <ShoppingBag className="mr-2 text-rose-600" /> Pedidos Online
         </h2>
         <div className="flex bg-white rounded-lg p-1 border border-gray-200">
            <button 
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 text-sm font-bold rounded ${filter === 'pending' ? 'bg-rose-100 text-rose-700' : 'text-gray-500'}`}
            >
              Pendentes
            </button>
            <button 
              onClick={() => setFilter('completed')}
              className={`px-3 py-1 text-sm font-bold rounded ${filter === 'completed' ? 'bg-green-100 text-green-700' : 'text-gray-500'}`}
            >
              Histórico
            </button>
         </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-gray-100">
            <ShoppingBag size={48} className="mx-auto mb-2 opacity-20" />
            <p>Nenhum pedido encontrado nesta categoria.</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
               {/* Header */}
               <div 
                 className={`p-4 flex justify-between items-center cursor-pointer ${order.status === 'pending' ? 'bg-yellow-50' : 'bg-white'}`}
                 onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
               >
                 <div className="flex items-center">
                    <div className={`p-2 rounded-full mr-3 ${order.deliveryType === 'delivery' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                       {order.deliveryType === 'delivery' ? <Truck size={20} /> : <MapPin size={20} />}
                    </div>
                    <div>
                       <h3 className="font-bold text-gray-800">{order.customerName}</h3>
                       <p className="text-xs text-gray-500">{new Date(order.date).toLocaleString('pt-BR')}</p>
                    </div>
                 </div>
                 <div className="flex items-center">
                    <span className={`text-xs font-bold px-2 py-1 rounded uppercase mr-2 
                       ${order.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : 
                         order.status === 'processing' ? 'bg-blue-200 text-blue-800' :
                         order.status === 'completed' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`
                    }>
                       {order.status === 'pending' ? 'Novo' : order.status === 'processing' ? 'Preparando' : order.status === 'completed' ? 'Concluído' : 'Cancelado'}
                    </span>
                    {expandedOrder === order.id ? <ChevronUp size={20} className="text-gray-400"/> : <ChevronDown size={20} className="text-gray-400"/>}
                 </div>
               </div>

               {/* Details */}
               {expandedOrder === order.id && (
                 <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                       <div>
                          <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Contato</h4>
                          <div className="flex items-center text-gray-700 mb-1">
                             <Phone size={14} className="mr-2" /> 
                             <a href={`https://wa.me/55${order.customerWhatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="hover:text-green-600 underline">
                                {order.customerWhatsapp}
                             </a>
                          </div>
                          {order.deliveryType === 'delivery' && (
                             <div className="flex items-start text-gray-700">
                                <MapPin size={14} className="mr-2 mt-1 min-w-[14px]" /> 
                                <span className="text-sm">{order.address}</span>
                             </div>
                          )}
                          {order.deliveryType === 'pickup' && (
                             <div className="text-sm text-orange-600 font-medium">Cliente irá retirar na loja.</div>
                          )}
                       </div>
                       
                       <div>
                          <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Itens do Pedido</h4>
                          <ul className="space-y-1">
                             {order.items.map((item, idx) => (
                                <li key={idx} className="text-sm text-gray-700 flex justify-between">
                                   <span>{item.quantity}x {item.productName} <span className="text-xs text-gray-400">({item.unit})</span></span>
                                   <span className="font-bold">R$ {(item.price * item.quantity).toFixed(2)}</span>
                                </li>
                             ))}
                          </ul>
                          <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between font-bold text-lg text-rose-700">
                             <span>Total</span>
                             <span>R$ {order.total.toFixed(2)}</span>
                          </div>
                       </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                       {order.status === 'pending' && (
                          <button 
                             onClick={(e) => { e.stopPropagation(); handleStatusChange(order, 'processing'); }}
                             className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center"
                          >
                             <Clock size={16} className="mr-2" /> Aceitar / Preparar
                          </button>
                       )}
                       {(order.status === 'pending' || order.status === 'processing') && (
                          <button 
                             onClick={(e) => { e.stopPropagation(); handleStatusChange(order, 'completed'); }}
                             className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 flex items-center justify-center"
                          >
                             <CheckCircle size={16} className="mr-2" /> Concluir Pedido
                          </button>
                       )}
                       {order.status !== 'cancelled' && order.status !== 'completed' && (
                          <button 
                             onClick={(e) => { e.stopPropagation(); handleStatusChange(order, 'cancelled'); }}
                             className="px-4 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200"
                          >
                             <XCircle size={20} />
                          </button>
                       )}
                    </div>
                 </div>
               )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};