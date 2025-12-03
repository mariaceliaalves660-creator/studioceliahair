

import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { DollarSign, TrendingUp, TrendingDown, Wallet, Calendar, Users, PieChart, X, BarChart2, Lock, Unlock, Clock, UserCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const CashierScreen: React.FC = () => {
  const { sales, expenses, staff, addExpense, getCurrentSession, openRegister, closeRegister } = useData();
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [showChartModal, setShowChartModal] = useState(false);
  
  // Register Open Form
  const [openingAmount, setOpeningAmount] = useState('');

  // Register Closing State
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const currentSession = getCurrentSession();

  // If Register is Closed, show Open Form
  if (!currentSession) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-purple-100 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 text-purple-600">
            <Lock size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Caixa Fechado</h2>
          <p className="text-gray-500 mb-6">Insira o valor inicial (fundo de troco) para abrir o caixa e começar as operações do dia.</p>
          
          <form onSubmit={(e) => { e.preventDefault(); openRegister(parseFloat(openingAmount) || 0); }}>
            <div className="mb-6 relative">
               <span className="absolute left-3 top-3 text-gray-400 font-bold">R$</span>
               <input 
                 type="number" 
                 step="0.01" 
                 autoFocus
                 required
                 className="w-full pl-10 p-3 border-2 border-purple-100 rounded-xl text-2xl font-bold text-center text-gray-800 focus:border-purple-500 outline-none"
                 placeholder="0.00"
                 value={openingAmount}
                 onChange={e => setOpeningAmount(e.target.value)}
               />
            </div>
            <button className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-purple-700 transition shadow-lg flex items-center justify-center">
              <Unlock className="mr-2" /> Abrir Caixa
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- Logic when Register is Open ---
  const now = new Date();
  
  // Helper functions for dates
  const parseDate = (dateStr: string) => new Date(dateStr);
  
  const isToday = (date: Date) => {
    return date.getDate() === now.getDate() &&
           date.getMonth() === now.getMonth() &&
           date.getFullYear() === now.getFullYear();
  };

  const isThisWeek = (date: Date) => {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    return date >= startOfWeek;
  };

  const isThisMonth = (date: Date) => {
    return date.getMonth() === now.getMonth() &&
           date.getFullYear() === now.getFullYear();
  };

  const isThisYear = (date: Date) => {
    return date.getFullYear() === now.getFullYear();
  };

  // Helper to calculate only Store/General revenue (exclude Hair Business items)
  const calculateGeneralRevenue = (saleList: typeof sales) => {
    return saleList.reduce((acc, sale) => {
        const generalItemsTotal = sale.items.reduce((itemAcc, item) => {
            // Include Service OR Products that are NOT hair business
            if (item.type === 'service' || (item.type === 'product' && item.origin !== 'hair_business')) {
                return itemAcc + (item.price * item.quantity);
            }
            return itemAcc;
        }, 0);
        return acc + generalItemsTotal;
    }, 0);
  };

  // --- Calculate Totals by Period (Global - Filtered for General Cashier) ---
  let dailyTotal = 0;
  let weeklyTotal = 0;
  let monthlyTotal = 0;
  let annualTotal = 0;

  // Filter lists first for performance then calculate
  dailyTotal = calculateGeneralRevenue(sales.filter(s => isToday(parseDate(s.date))));
  weeklyTotal = calculateGeneralRevenue(sales.filter(s => isThisWeek(parseDate(s.date))));
  monthlyTotal = calculateGeneralRevenue(sales.filter(s => isThisMonth(parseDate(s.date))));
  annualTotal = calculateGeneralRevenue(sales.filter(s => isThisYear(parseDate(s.date))));

  // --- Balance Calculations respecting Session ---
  const sessionStart = new Date(currentSession.openedAt).getTime();
  
  const salesInSession = sales.filter(s => new Date(s.date).getTime() >= sessionStart);
  
  // Expenses should also be filtered to exclude Hair Business expenses
  const expensesInSession = expenses.filter(e => 
      new Date(e.date).getTime() >= sessionStart && e.businessUnit !== 'hair_business'
  );
  
  const totalIncomeInSession = calculateGeneralRevenue(salesInSession);
  const totalExpensesInSession = expensesInSession.reduce((acc, exp) => acc + exp.amount, 0);
  
  const currentBalance = currentSession.openingBalance + totalIncomeInSession - totalExpensesInSession;

  // --- Staff Performance Ranking (Updated for Item-based attribution) ---
  const staffPerformance = staff.map(member => {
    let memberTotal = 0;

    // Filter sales from today
    const todaysSales = sales.filter(s => isToday(parseDate(s.date)));
    
    // Iterate sales, then items to find items belonging to this staff member
    todaysSales.forEach(sale => {
        sale.items.forEach(item => {
            if (item.staffId === member.id) {
                // Include all sales in staff ranking? Or exclude hair business?
                // Usually staff commission applies to everything they sell, regardless of business unit.
                // Keeping it total for now unless specified otherwise.
                memberTotal += item.price * item.quantity;
            }
        });
    });

    return { ...member, totalSales: memberTotal };
  }).sort((a, b) => b.totalSales - a.totalSales);

  // --- Chart Data ---
  const totalServices = salesInSession.reduce((acc, sale) => acc + sale.items.filter(i => i.type === 'service').reduce((s, i) => s + i.price, 0), 0);
  // Only normal products
  const totalProducts = salesInSession.reduce((acc, sale) => acc + sale.items.filter(i => i.type === 'product' && i.origin !== 'hair_business').reduce((s, i) => s + i.price * i.quantity, 0), 0);

  const chartData = [
    { name: 'Serviços', value: totalServices },
    { name: 'Produtos (Loja)', value: totalProducts },
    { name: 'Despesas', value: totalExpensesInSession },
  ];

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    addExpense({
      id: `exp-${Date.now()}`,
      description: desc,
      amount: parseFloat(amount),
      date: new Date().toISOString(),
      category: 'Geral',
      businessUnit: 'salon' // Explicitly mark as Salon expense
    });
    setDesc('');
    setAmount('');
    setShowExpenseForm(false);
  };

  // --- Closing Logic ---
  const calculateClosingValues = () => {
    return {
      totalIn: totalIncomeInSession,
      totalOut: totalExpensesInSession,
      currentBalance: currentBalance
    };
  };

  const handleConfirmClose = () => {
    const withdraw = parseFloat(withdrawAmount) || 0;
    
    if (withdraw > currentBalance) {
      alert("Atenção: O valor de retirada é maior que o saldo em caixa.");
    }

    closeRegister(withdraw);
    setShowCloseModal(false);
    setWithdrawAmount('');
    alert("Caixa fechado com sucesso!");
  };

  const closingValues = calculateClosingValues();
  const remainingAfterWithdraw = closingValues.currentBalance - (parseFloat(withdrawAmount) || 0);


  return (
    <div className="p-4 pb-20 relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-purple-900 flex items-center">
            <DollarSign className="mr-2" /> Fluxo de Caixa (Geral)
          </h2>
          <p className="text-xs text-purple-600 ml-8">Aberto em: {new Date(currentSession.openedAt).toLocaleString('pt-BR')}</p>
        </div>
        <div className="flex space-x-2">
            <button 
                onClick={() => setShowChartModal(true)}
                className="bg-purple-100 text-purple-700 p-2 rounded-lg flex items-center text-sm font-bold hover:bg-purple-200"
                title="Gráficos"
            >
                <BarChart2 size={18} />
            </button>
            <button 
                onClick={() => setShowCloseModal(true)}
                className="bg-red-100 text-red-700 p-2 rounded-lg flex items-center text-sm font-bold hover:bg-red-200"
                title="Fechar Caixa"
            >
                <Lock size={18} className="mr-1" /> Fechar
            </button>
        </div>
      </div>

      {/* General Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-100 font-medium">Entradas (Sessão)</span>
            <TrendingUp className="text-green-200" />
          </div>
          <div className="text-3xl font-bold">R$ {totalIncomeInSession.toFixed(2)}</div>
          <p className="text-xs text-green-200 mt-1">* Apenas Serviços e Produtos Loja</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-red-100 font-medium">Saídas (Sessão)</span>
            <TrendingDown className="text-red-200" />
          </div>
          <div className="text-3xl font-bold">R$ {totalExpensesInSession.toFixed(2)}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-5 text-white shadow-lg border-2 border-white/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-100 font-medium">Saldo em Caixa</span>
            <Wallet className="text-purple-200" />
          </div>
          <div className="text-3xl font-bold">R$ {currentBalance.toFixed(2)}</div>
          <div className="text-xs text-purple-200 mt-1">Iniciado com: R$ {currentSession.openingBalance.toFixed(2)}</div>
        </div>
      </div>

      {/* Period Reports */}
      <div className="mb-8">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center">
          <Calendar className="mr-2 text-purple-600" size={20} /> Resumo Operacional (Loja)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm">
            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Hoje</div>
            <div className="text-xl font-bold text-gray-800">R$ {dailyTotal.toFixed(2)}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm">
            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Esta Semana</div>
            <div className="text-xl font-bold text-gray-800">R$ {weeklyTotal.toFixed(2)}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm">
            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Este Mês</div>
            <div className="text-xl font-bold text-gray-800">R$ {monthlyTotal.toFixed(2)}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm">
            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Este Ano</div>
            <div className="text-xl font-bold text-gray-800">R$ {annualTotal.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Staff Ranking (Simplified) */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-gray-800 flex items-center">
                <Users className="mr-2 text-indigo-600" size={20} /> Ranking Diário
             </h3>
          </div>
          
          <div className="space-y-4">
            {staffPerformance.map((member, idx) => (
              <div 
                key={member.id} 
                className="w-full flex items-center justify-between border-b border-gray-50 last:border-0 pb-2 last:pb-0 p-2 rounded-lg"
              >
                <div className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3
                    ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}
                  `}>
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">{member.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{member.role}</div>
                  </div>
                </div>
                <div className="text-right">
                    <div className="font-bold text-indigo-700">
                      R$ {member.totalSales.toFixed(2)}
                    </div>
                </div>
              </div>
            ))}
            {staffPerformance.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-4">Nenhuma venda registrada hoje.</div>
            )}
          </div>
      </div>

      {/* Sales History Log (Added for audit) */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center">
             <Clock className="mr-2 text-purple-600" size={20} /> Histórico de Vendas (Sessão Atual)
          </h3>
          <div className="overflow-x-auto">
             <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase">
                   <tr>
                      <th className="p-3 text-left">Data/Hora</th>
                      <th className="p-3 text-left">Itens Vendidos</th>
                      <th className="p-3 text-right">Valor</th>
                      <th className="p-3 text-right">Operador</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                   {salesInSession.length === 0 ? (
                      <tr><td colSpan={4} className="p-4 text-center text-gray-400">Nenhuma venda nesta sessão.</td></tr>
                   ) : (
                      salesInSession
                        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map(sale => (
                          <tr key={sale.id} className="hover:bg-gray-50">
                             <td className="p-3 text-gray-500">
                                <div className="text-xs font-bold">{new Date(sale.date).toLocaleDateString()}</div>
                                <div>{new Date(sale.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                             </td>
                             <td className="p-3">
                                <div className="flex flex-col">
                                    {sale.items.map((item, idx) => (
                                        <span key={idx} className="text-gray-800 font-medium text-xs border-b border-dashed border-gray-100 last:border-0 py-0.5">
                                            {item.quantity}x {item.name}
                                        </span>
                                    ))}
                                    <span className="text-gray-400 text-[10px] mt-1">Cliente: {sale.clientName}</span>
                                </div>
                             </td>
                             <td className="p-3 text-right font-bold text-green-600">R$ {sale.total.toFixed(2)}</td>
                             <td className="p-3 text-right">
                                <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded border border-purple-100 font-bold flex items-center justify-end w-fit ml-auto">
                                   <UserCheck size={10} className="mr-1"/> {sale.createdByName || 'Sistema'}
                                </span>
                             </td>
                          </tr>
                      ))
                   )}
                </tbody>
             </table>
          </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button 
          onClick={() => setShowExpenseForm(!showExpenseForm)}
          className="w-full bg-red-50 text-red-700 py-3 rounded-xl font-bold border border-red-100 hover:bg-red-100 transition shadow-sm"
        >
          {showExpenseForm ? 'Cancelar' : 'Adicionar Despesa (Saída)'}
        </button>
      </div>

      {/* Expense Form */}
      {showExpenseForm && (
        <form onSubmit={handleAddExpense} className="mt-6 bg-white p-5 rounded-xl shadow-lg border border-red-100 animate-fade-in">
          <h4 className="font-bold text-red-800 mb-4">Nova Despesa</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Descrição</label>
              <input 
                required 
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-200 outline-none" 
                value={desc} 
                onChange={e => setDesc(e.target.value)} 
                placeholder="Ex: Conta de Luz, Material de Limpeza..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Valor (R$)</label>
              <input 
                required 
                type="number" 
                step="0.01" 
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-200 outline-none" 
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                placeholder="0,00"
              />
            </div>
            <button type="submit" className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition">
              Salvar Despesa
            </button>
          </div>
        </form>
      )}

      {/* Chart Modal */}
      {showChartModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden p-6 relative">
            <button 
              onClick={() => setShowChartModal(false)}
              className="absolute top-4 right-4 p-1 bg-gray-100 rounded-full hover:bg-gray-200 transition"
            >
              <X size={20} />
            </button>
            
            <h3 className="font-bold text-gray-800 mb-6 flex items-center">
              <PieChart className="mr-2 text-blue-600" size={20} /> Composição Financeira (Sessão Atual)
            </h3>
            
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val}`} />
                  <Tooltip 
                    cursor={{fill: '#f3f4f6'}} 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center text-xs text-gray-400 mt-4">Visão da sessão aberta atualmente (Excluindo Vendas de Cabelo).</p>
          </div>
        </div>
      )}

      {/* Close Register Modal */}
      {showCloseModal && currentSession && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
           <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
              <div className="bg-gray-900 p-6 text-white relative">
                 <button onClick={() => setShowCloseModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
                 <h3 className="text-xl font-bold flex items-center"><Lock className="mr-2" size={20}/> Fechamento de Caixa</h3>
                 <p className="text-gray-400 text-sm mt-1">Conferência de valores e retirada.</p>
              </div>
              
              <div className="p-6 space-y-4 bg-gray-50">
                 {/* Summary */}
                 <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-2">
                    <div className="flex justify-between text-sm">
                       <span className="text-gray-500">Saldo Inicial (Fundo)</span>
                       <span className="font-bold text-gray-800">R$ {currentSession.openingBalance.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="text-gray-500">Entradas (Loja)</span>
                       <span className="font-bold text-green-600">+ R$ {closingValues.totalIn.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="text-gray-500">Saídas (Loja)</span>
                       <span className="font-bold text-red-600">- R$ {closingValues.totalOut.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between items-center text-lg">
                       <span className="font-bold text-gray-800">Saldo Atual em Caixa</span>
                       <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">R$ {closingValues.currentBalance.toFixed(2)}</span>
                    </div>
                 </div>

                 {/* Withdrawal Input */}
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Valor de Retirada (Sangria)</label>
                    <div className="relative">
                       <span className="absolute left-3 top-3 text-gray-400 font-bold">R$</span>
                       <input 
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="w-full pl-10 p-3 border rounded-lg font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                          value={withdrawAmount}
                          onChange={e => setWithdrawAmount(e.target.value)}
                       />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                       Este valor será retirado fisicamente do caixa.
                    </p>
                 </div>

                 {/* Result Preview */}
                 <div className="bg-gray-200 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-600 uppercase">Fica em Caixa (Troco)</span>
                    <span className="font-bold text-gray-800 text-lg">R$ {remainingAfterWithdraw.toFixed(2)}</span>
                 </div>
              </div>

              <div className="p-6 bg-white border-t border-gray-100">
                 <button 
                   onClick={handleConfirmClose}
                   className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition shadow-lg"
                   disabled={remainingAfterWithdraw < 0}
                 >
                   Confirmar Fechamento
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
