import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { ShoppingBag, Plus, Trash2, CheckCircle, Calculator, User, AlertCircle } from 'lucide-react';
import { SaleItem, Sale, UnitType } from '../types';

export const SalesScreen: React.FC = () => {
  const { services, products, staff, clients, addSale, currentAdmin } = useData();
  
  const [selectedClientId, setSelectedClientId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'dinheiro' | 'cartao' | 'pix'>('dinheiro');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [successMsg, setSuccessMsg] = useState('');

  // Add Item Logic
  const [addItemType, setAddItemType] = useState<'service' | 'product'>('service');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedItemStaffId, setSelectedItemStaffId] = useState(''); // Staff for specific item
  
  // Inputs
  const [manualPrice, setManualPrice] = useState(''); // Only for Services
  const [quantity, setQuantity] = useState('1');
  const [selectedUnit, setSelectedUnit] = useState<UnitType>('un');

  // Derived state for product calculation
  const getProductDetails = () => products.find(p => p.id === selectedItemId);
  const getServiceDetails = () => services.find(s => s.id === selectedItemId);

  const calculateProductTotal = () => {
    const prod = getProductDetails();
    if (!prod) return 0;

    const qty = parseFloat(quantity) || 0;
    
    // Logic: Convert everything to the Product's base unit to find the ratio
    let conversionFactor = 1;

    // Case 1: Product is KG
    if (prod.unit === 'kg') {
      if (selectedUnit === 'g') conversionFactor = 0.001; // selling in grams, price is per kg
      if (selectedUnit === 'un') conversionFactor = 1; // assume 1 unit = 1 base unit if undefined, or keep 1
    }
    // Case 2: Product is G
    else if (prod.unit === 'g') {
      if (selectedUnit === 'kg') conversionFactor = 1000; // selling in kg, price is per g
    }
    
    // Total = (Price Per Base Unit) * (Quantity in Sale Units) * Conversion
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
        // Default the sale unit to the product unit
        setSelectedUnit(prod.unit); 
      }
    }
  };

  const handleAddItem = () => {
    // 1. Validate Client
    if (!selectedClientId) {
        alert("Por favor, selecione o Cliente no topo do formulário antes de adicionar itens.");
        return;
    }

    // 2. Validate Item
    if (!selectedItemId) {
        alert(`Selecione um ${addItemType === 'service' ? 'Serviço' : 'Produto'} para adicionar.`);
        return;
    }

    // 3. Validate Staff
    if (!selectedItemStaffId) {
        alert("Selecione o profissional responsável pelo item.");
        return;
    }
    
    let newItem: SaleItem | null = null;
    const qtyVal = parseFloat(quantity) || 0;
    const staffMember = staff.find(s => s.id === selectedItemStaffId);
    
    if (qtyVal <= 0 || !staffMember) return;

    if (addItemType === 'service') {
      // Service Logic
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
          category: srv.category // NEW: Add service category
        };
      }
    } else {
      // Product Logic with STOCK CHECK
      const prod = getProductDetails();
      if (prod) {
        // 1. Calculate requested quantity in product's base unit
        let requestedBaseQty = qtyVal;
        if (prod.unit === 'kg' && selectedUnit === 'g') requestedBaseQty /= 1000;
        else if (prod.unit === 'g' && selectedUnit === 'kg') requestedBaseQty *= 1000;

        // 2. Calculate quantity already in cart for this product
        const inCartBaseQty = cart
          .filter(item => item.id === prod.id && item.type === 'product')
          .reduce((acc, item) => {
            let itemQty = item.quantity;
            if (prod.unit === 'kg' && item.unit === 'g') itemQty /= 1000;
            else if (prod.unit === 'g' && item.unit === 'kg') itemQty *= 1000;
            return acc + itemQty;
          }, 0);

        // 3. Validation
        if (inCartBaseQty + requestedBaseQty > prod.stock) {
          alert(`Estoque insuficiente! Você tem ${prod.stock} ${prod.unit} disponíveis.`);
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
          origin: prod.origin || 'store', // IMPORTANT: Save origin for split reporting
          category: prod.category // NEW: Add product category
        };
      }
    }

    if (newItem) {
      setCart(prev => [...prev, newItem!]);
      setSelectedItemId('');
      setManualPrice('');
      setQuantity('1');
      setSelectedItemStaffId('');
    }
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleFinishSale = () => {
    if (!selectedClientId) {
        alert("Selecione o Cliente para finalizar a venda.");
        return;
    }
    
    if (cart.length === 0) {
        alert("Adicione itens ao carrinho antes de finalizar.");
        return;
    }

    const client = clients.find(c => c.id === selectedClientId);
    
    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      date: new Date().toISOString(),
      clientId: selectedClientId,
      clientName: client?.name || 'Unknown',
      items: cart,
      total,
      paymentMethod,
      createdBy: currentAdmin?.id,
      createdByName: currentAdmin?.name || 'Sistema'
    };

    addSale(newSale);
    setSuccessMsg('Venda realizada com sucesso!');
    setCart([]);
    setSelectedClientId('');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const currentProductTotal = addItemType === 'product' ? calculateProductTotal() : 0;
  const currentProduct = getProductDetails();

  return (
    <div className="p-4 pb-20">
      <h2 className="text-2xl font-bold text-emerald-900 mb-6 flex items-center">
        <ShoppingBag className="mr-2" /> Nova Venda
      </h2>

      {successMsg && (
        <div className="bg-emerald-100 text-emerald-800 p-3 rounded-lg mb-4 flex items-center">
          <CheckCircle className="mr-2" size={20} /> {successMsg}
        </div>
      )}

      {/* Main Form */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-emerald-100 mb-6 space-y-4">
        {/* Header Selections */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente (Obrigatório)</label>
            <select className="w-full p-2 border rounded-lg bg-gray-50" value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)}>
              <option value="">Selecione o Cliente</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
        </div>

        <div className="border-t pt-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">Adicionar Item</label>
          
          {/* Type Toggle */}
          <div className="flex space-x-2 mb-4">
            <button 
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${addItemType === 'service' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              onClick={() => { setAddItemType('service'); setSelectedItemId(''); setManualPrice(''); }}
            >
              Serviço
            </button>
            <button 
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${addItemType === 'product' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              onClick={() => { setAddItemType('product'); setSelectedItemId(''); setManualPrice(''); }}
            >
              Produto
            </button>
          </div>

          <div className="space-y-3 bg-gray-50 p-3 rounded-lg border border-gray-100 animate-fade-in">
            {/* 1. Select Item */}
            <div>
               <div className="flex justify-between items-center mb-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase">
                   {addItemType === 'service' ? 'Selecione o Serviço' : 'Selecione o Produto'}
                 </label>
                 {addItemType === 'product' && currentProduct && (
                   <span className={`text-xs font-bold ${currentProduct.stock <= 5 ? 'text-red-600' : 'text-emerald-600'}`}>
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

            {/* 2. Select Staff for this Item */}
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

            {/* 3. Inputs based on Type */}
            {selectedItemId && (
              <div className="flex flex-col md:flex-row gap-3 items-end">
                
                {/* --- SERVICE INPUTS --- */}
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

                {/* --- PRODUCT INPUTS --- */}
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

                    <div className="flex-1 w-full md:w-auto bg-emerald-50 rounded-lg p-2 border border-emerald-100 flex items-center justify-between md:justify-center">
                       <div className="text-xs text-emerald-600 font-semibold mr-2">Total Calculado:</div>
                       <div className="text-lg font-bold text-emerald-800">
                         R$ {currentProductTotal.toFixed(2)}
                       </div>
                    </div>
                  </>
                )}

                <button 
                  onClick={handleAddItem} 
                  className="w-full md:w-auto bg-emerald-600 text-white p-2.5 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm flex justify-center items-center"
                  title="Adicionar ao carrinho"
                >
                  <Plus size={24} /> <span className="md:hidden ml-2 font-bold">Adicionar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cart */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 border border-gray-100">
        <div className="bg-emerald-50 p-3 font-semibold text-emerald-900 border-b border-emerald-100 flex justify-between items-center">
          <span>Itens do Pedido</span>
          <span className="text-xs bg-white px-2 py-0.5 rounded-full text-emerald-600 border border-emerald-200">{cart.length} itens</span>
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
                    {item.category && ( // NEW: Display category if available
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
                    {item.origin === 'hair_business' && (
                        <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200">
                           Cabelo
                        </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="font-bold text-emerald-700 text-lg">
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
          <span className="font-bold text-2xl text-emerald-700">R$ {total.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment */}
      <div className="mb-20">
        <label className="block text-sm font-medium text-gray-700 mb-3">Forma de Pagamento</label>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {(['dinheiro', 'cartao', 'pix'] as const).map(method => (
            <button
              key={method}
              onClick={() => setPaymentMethod(method)}
              className={`py-3 rounded-xl border capitalize font-medium transition-all ${
                paymentMethod === method 
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md transform scale-[1.02]' 
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {method}
            </button>
          ))}
        </div>

        <button 
          onClick={handleFinishSale}
          className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-emerald-700 transition-all active:scale-[0.98]"
        >
          Finalizar Venda
        </button>
      </div>
    </div>
  );
};