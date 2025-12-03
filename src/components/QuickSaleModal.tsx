"use client";

import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext'; // Caminho corrigido
import { X, ShoppingBag, User, DollarSign, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { Appointment, SaleItem, UnitType, Sale } from '../types';

interface QuickSaleModalProps {
  appointment: Appointment;
  onClose: () => void;
  onSaleComplete: (appointmentId: string) => void;
}

export const QuickSaleModal: React.FC<QuickSaleModalProps> = ({ appointment, onClose, onSaleComplete }) => {
  const { services, products, staff, clients, addSale, currentAdmin } = useData();

  const [cart, setCart] = useState<SaleItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'dinheiro' | 'cartao' | 'pix'>('dinheiro');
  const [error, setError] = useState('');

  // Add Item Form State
  const [addItemType, setAddItemType] = useState<'service' | 'product'>('service');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedItemStaffId, setSelectedItemStaffId] = useState('');
  const [manualPrice, setManualPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [selectedUnit, setSelectedUnit] = useState<UnitType>('un');

  // Initialize cart with services from the appointment
  useEffect(() => {
    const initialCart: SaleItem[] = appointment.serviceIds.map(serviceId => {
      const service = services.find(s => s.id === serviceId);
      // Assign first staff from appointment to all services by default, or 'system' if none
      const defaultStaffId = appointment.staffId.length > 0 ? appointment.staffId[0] : 'system';
      const defaultStaffName = staff.find(s => s.id === defaultStaffId)?.name || 'Sistema';

      return {
        type: 'service',
        id: service?.id || `unknown-service-${Date.now()}`,
        name: service?.name || 'Serviço Desconhecido',
        price: service?.price || 0,
        quantity: 1,
        staffId: defaultStaffId,
        staffName: defaultStaffName,
        category: service?.category || 'Serviço'
      };
    });
    setCart(initialCart);
    // Pre-select the first staff member from the appointment for the 'add item' form
    if (appointment.staffId.length > 0) {
        setSelectedItemStaffId(appointment.staffId[0]);
    }
  }, [appointment, services, staff]);

  const getProductDetails = () => products.find(p => p.id === selectedItemId);
  const getServiceDetails = () => services.find(s => s.id === selectedItemId);

  const calculateProductTotal = () => {
    const prod = getProductDetails();
    if (!prod) return 0;

    const qty = parseFloat(quantity) || 0;
    
    let conversionFactor = 1;
    if (prod.unit === 'kg') {
      if (selectedUnit === 'g') conversionFactor = 0.001;
    } else if (prod.unit === 'g') {
      if (selectedUnit === 'kg') conversionFactor = 1000;
    }
    
    return prod.price * qty * conversionFactor;
  };

  const handleItemSelect = (id: string) => {
    setSelectedItemId(id);
    if (!id) {
      setManualPrice('');
      return;
    }

    if (addItemType === 'service') {
      const srv = services.find(s => s.id === id);
      if (srv) {
        setManualPrice(srv.price.toString());
        setQuantity('1');
      }
    } else {
      const prod = products.find(p => p.id === id);
      if (prod) {
        setQuantity('1');
        setSelectedUnit(prod.unit); 
      }
    }
  };

  const handleAddItem = () => {
    setError('');
    if (!selectedItemId) {
        setError(`Selecione um ${addItemType === 'service' ? 'Serviço' : 'Produto'} para adicionar.`);
        return;
    }
    if (!selectedItemStaffId) {
        setError("Selecione o profissional responsável pelo item.");
        return;
    }
    
    let newItem: SaleItem | null = null;
    const qtyVal = parseFloat(quantity) || 0;
    const staffMember = staff.find(s => s.id === selectedItemStaffId);
    
    if (qtyVal <= 0 || !staffMember) {
        setError("Quantidade inválida ou profissional não selecionado.");
        return;
    }

    if (addItemType === 'service') {
      const totalPrice = parseFloat(manualPrice) || 0;
      const srv = getServiceDetails();
      
      if (srv) {
        newItem = { 
          type: 'service', 
          id: srv.id, 
          name: srv.name, 
          price: totalPrice, 
          quantity: 1,
          staffId: staffMember.id,
          staffName: staffMember.name,
          category: srv.category
        };
      }
    } else {
      const prod = getProductDetails();
      if (prod) {
        let requestedBaseQty = qtyVal;
        if (prod.unit === 'kg' && selectedUnit === 'g') requestedBaseQty /= 1000;
        else if (prod.unit === 'g' && selectedUnit === 'kg') requestedBaseQty *= 1000;

        const inCartBaseQty = cart
          .filter(item => item.id === prod.id && item.type === 'product')
          .reduce((acc, item) => {
            let itemQty = item.quantity;
            if (prod.unit === 'kg' && item.unit === 'g') itemQty /= 1000;
            else if (prod.unit === 'g' && item.unit === 'kg') itemQty *= 1000;
            return acc + itemQty;
          }, 0);

        if (inCartBaseQty + requestedBaseQty > prod.stock) {
          setError(`Estoque insuficiente! Você tem ${prod.stock} ${prod.unit} disponíveis.`);
          return;
        }

        const totalCalculated = calculateProductTotal();
        const unitPriceForSale = totalCalculated / qtyVal;

        newItem = { 
          type: 'product', 
          id: prod.id, 
          name: prod.name, 
          price: unitPriceForSale, 
          quantity: qtyVal,
          unit: selectedUnit,
          staffId: staffMember.id,
          staffName: staffMember.name,
          origin: prod.origin || 'store',
          category: prod.category
        };
      }
    }

    if (newItem) {
      setCart(prev => [...prev, newItem!]);
      setSelectedItemId('');
      setManualPrice('');
      setQuantity('1');
      // Keep selectedItemStaffId as it might be the same for next item
    }
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleFinishSale = () => {
    setError('');
    if (cart.length === 0) {
        setError("Adicione itens ao carrinho antes de finalizar.");
        return;
    }

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      date: new Date().toISOString(),
      clientId: appointment.clientId,
      clientName: appointment.clientName,
      items: cart,
      total,
      paymentMethod,
      createdBy: currentAdmin?.id,
      createdByName: currentAdmin?.name || 'Sistema'
    };

    addSale(newSale);
    onSaleComplete(appointment.id); // Callback to update appointment status
  };

  const currentProductTotal = addItemType === 'product' ? calculateProductTotal() : 0;
  const currentProduct = getProductDetails();

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-green-600 p-4 flex justify-between items-center text-white">
          <h3 className="font-bold flex items-center">
            <DollarSign size={18} className="mr-2"/> Venda Rápida (Agendamento)
          </h3>
          <button onClick={onClose} className="hover:bg-green-500 rounded-full p-1"><X size={20}/></button>
        </div>
        
        <div className="p-6 space-y-4 overflow-y-auto">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                <h4 className="font-bold text-gray-800 flex items-center"><User size={16} className="mr-2"/> Cliente: {appointment.clientName}</h4>
                <p className="text-sm text-gray-500 ml-6">{appointment.clientPhone}</p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center text-sm font-bold">
                    <AlertCircle size={18} className="mr-2"/> {error}
                </div>
            )}

            {/* Add Item Section */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-4">
                <h4 className="font-bold text-gray-700 flex items-center"><Plus size={16} className="mr-2"/> Adicionar Item</h4>
                <div className="flex space-x-2 mb-4">
                    <button 
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${addItemType === 'service' ? 'bg-green-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        onClick={() => { setAddItemType('service'); setSelectedItemId(''); setManualPrice(''); setError(''); }}
                    >
                        Serviço
                    </button>
                    <button 
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${addItemType === 'product' ? 'bg-green-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        onClick={() => { setAddItemType('product'); setSelectedItemId(''); setManualPrice(''); setError(''); }}
                    >
                        Produto
                    </button>
                </div>

                <div className="space-y-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">
                                {addItemType === 'service' ? 'Selecione o Serviço' : 'Selecione o Produto'}
                            </label>
                            {addItemType === 'product' && currentProduct && (
                                <span className={`text-xs font-bold ${currentProduct.stock <= 5 ? 'text-red-600' : 'text-green-600'}`}>
                                    Estoque: {currentProduct.stock} {currentProduct.unit}
                                </span>
                            )}
                        </div>
                        <select 
                            className="w-full p-2 border rounded-lg bg-white" 
                            value={selectedItemId} 
                            onChange={e => handleItemSelect(e.target.value)}
                        >
                            <option value="">Selecione...</option>
                            {addItemType === 'service' 
                                ? services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
                                : products.map(p => <option key={p.id} value={p.id}>{p.name} (R$ {p.price}/{p.unit})</option>)
                            }
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">
                            Profissional Responsável
                        </label>
                        <select 
                            className="w-full p-2 border rounded-lg bg-white" 
                            value={selectedItemStaffId} 
                            onChange={e => setSelectedItemStaffId(e.target.value)}
                        >
                            <option value="">Selecione quem realizou...</option>
                            {staff.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
                        </select>
                    </div>

                    {selectedItemId && (
                        <div className="flex flex-col md:flex-row gap-3 items-end">
                            {addItemType === 'service' && (
                                <div className="flex-1 w-full">
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Valor Total (Editável)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-gray-500">R$</span>
                                        <input 
                                            type="number" 
                                            step="0.01" 
                                            className="w-full p-2 pl-9 border rounded-lg font-bold text-gray-800 bg-white" 
                                            value={manualPrice} 
                                            onChange={e => setManualPrice(e.target.value)} 
                                        />
                                    </div>
                                </div>
                            )}

                            {addItemType === 'product' && (
                                <>
                                    <div className="flex-1 grid grid-cols-2 gap-2 w-full">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1">Quantidade</label>
                                            <input 
                                                type="number" 
                                                step="0.01" 
                                                className="w-full p-2 border rounded-lg text-center bg-white" 
                                                value={quantity} 
                                                onChange={e => setQuantity(e.target.value)} 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1">Unidade</label>
                                            <select 
                                                className="w-full p-2 border rounded-lg bg-white" 
                                                value={selectedUnit} 
                                                onChange={e => setSelectedUnit(e.target.value as UnitType)}
                                            >
                                                <option value="un">Unidade</option>
                                                <option value="kg">Kg</option>
                                                <option value="g">Gramas</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex-1 w-full md:w-auto bg-green-50 rounded-lg p-2 border border-green-100 flex items-center justify-between md:justify-center">
                                        <div className="text-xs text-green-600 font-semibold mr-2">Total Calculado:</div>
                                        <div className="text-lg font-bold text-green-800">
                                            R$ {currentProductTotal.toFixed(2)}
                                        </div>
                                    </div>
                                </>
                            )}

                            <button 
                                onClick={handleAddItem} 
                                className="w-full md:w-auto bg-green-600 text-white p-2.5 rounded-lg hover:bg-green-700 transition-colors shadow-sm flex justify-center items-center"
                                title="Adicionar ao carrinho"
                            >
                                <Plus size={24} /> <span className="md:hidden ml-2 font-bold">Adicionar</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Cart Display */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="bg-green-50 p-3 font-semibold text-green-900 border-b border-green-100 flex justify-between items-center">
                    <span>Itens da Venda</span>
                    <span className="text-xs bg-white px-2 py-0.5 rounded-full text-green-600 border border-green-200">{cart.length} itens</span>
                </div>
                
                {cart.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">Nenhum item adicionado</div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {cart.map((item, idx) => (
                            <div key={idx} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                                <div>
                                    <div className="font-semibold text-gray-800">{item.name}</div>
                                    <div className="text-xs text-gray-500 flex items-center mt-0.5 flex-wrap gap-1">
                                        {item.type === 'service' ? (
                                            <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded mr-2">Serviço</span>
                                        ) : (
                                            <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded mr-2">Produto</span>
                                        )}
                                        {item.category && (
                                            <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                                {item.category}
                                            </span>
                                        )}
                                        {item.type === 'product' && (
                                            <span className="font-medium mr-2">
                                                {item.quantity} {item.unit}
                                            </span>
                                        )}
                                        <span className="flex items-center bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                            <User size={10} className="mr-1"/> {item.staffName}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="font-bold text-green-700 text-lg">
                                        R$ {(item.price * item.quantity).toFixed(2)}
                                    </div>
                                    <button onClick={() => removeFromCart(idx)} className="text-gray-300 hover:text-red-500 transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                <div className="p-4 bg-gray-50 flex justify-between items-center border-t border-gray-100">
                    <span className="font-bold text-gray-700 uppercase tracking-wide text-sm">Total a Pagar</span>
                    <span className="font-bold text-2xl text-green-700">R$ {total.toFixed(2)}</span>
                </div>
            </div>

            {/* Payment Method */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Forma de Pagamento</label>
                <div className="grid grid-cols-3 gap-3">
                    {(['dinheiro', 'cartao', 'pix'] as const).map(method => (
                        <button
                            key={method}
                            onClick={() => setPaymentMethod(method)}
                            className={`py-3 rounded-xl border capitalize font-medium transition-all ${
                                paymentMethod === method 
                                ? 'bg-green-600 text-white border-green-600 shadow-md transform scale-[1.02]' 
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {method}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        <div className="p-4 border-t bg-white shrink-0">
            <button 
                onClick={handleFinishSale}
                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-green-700 transition-all active:scale-[0.98]"
            >
                <CheckCircle size={20} className="mr-2"/> Confirmar Venda
            </button>
        </div>
      </div>
    </div>
  );
};