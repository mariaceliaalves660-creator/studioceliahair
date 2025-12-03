

import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Users, Trash2, X, DollarSign, Calendar, TrendingUp, History, CheckCircle, UserCircle } from 'lucide-react';
import { Staff } from '../types';

export const StaffScreen: React.FC = () => {
  const { staff, removeStaff, sales, staffPayments, addStaffPayment, addExpense } = useData();
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  
  // Helpers
  const parseDate = (dateStr: string) => new Date(dateStr);
  const now = new Date();
  const isToday = (d: Date) => d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  const isWeek = (d: Date) => {
    const start = new Date(now); start.setDate(now.getDate() - now.getDay()); start.setHours(0,0,0,0);
    return d >= start;
  };
  const isMonth = (d: Date) => d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  const isYear = (d: Date) => d.getFullYear() === now.getFullYear();

  const getStaffMetrics = (staffId: string) => {
    const memberPayments = staffPayments.filter(p => p.staffId === staffId);
    
    let commDay = 0, commWeek = 0, commMonth = 0, commYear = 0, commTotal = 0;
    
    const history: any[] = [];

    // Calculate Commissions from SALES ITEMS (changed from Sales)
    sales.forEach(sale => {
      // Find items in this sale performed by this staff member
      const memberItems = sale.items.filter(item => item.staffId === staffId);

      memberItems.forEach(item => {
        // Commission mostly applies to services, but let's calculate for everything if assigned
        const itemTotal = item.price * item.quantity;
        const member = staff.find(s => s.id === staffId);
        const commission = itemTotal * ((member?.commissionRate || 0) / 100);
        
        const d = parseDate(sale.date);
        if (isToday(d)) commDay += commission;
        if (isWeek(d)) commWeek += commission;
        if (isMonth(d)) commMonth += commission;
        if (isYear(d)) commYear += commission;
        commTotal += commission;

        history.push({
          type: 'service',
          date: sale.date,
          description: `${item.name} (Venda #${sale.id.slice(-4)})`,
          value: commission,
          recordedBy: sale.createdByName || 'Sistema' // Added recorder info
        });
      });
    });

    // Calculate Payments
    const totalPaid = memberPayments.reduce((acc, p) => acc + p.amount, 0);
    
    const paymentHistory = memberPayments.map(p => ({
      type: 'payment',
      date: p.date,
      description: 'Pagamento Realizado',
      value: -p.amount,
      recordedBy: 'Admin'
    }));

    // Merge and sort history
    const combinedHistory = [...history, ...paymentHistory].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const balance = commTotal - totalPaid;

    return { 
      commDay, commWeek, commMonth, commYear, 
      commTotal, totalPaid, balance, 
      combinedHistory 
    };
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff || !paymentAmount) return;
    
    const amount = parseFloat(paymentAmount);
    
    // 1. Record Staff Payment (for staff history)
    addStaffPayment({
      id: `pay-${Date.now()}`,
      staffId: selectedStaff.id,
      amount: amount,
      date: new Date().toISOString(),
      notes: 'Pagamento de comissão'
    });

    // 2. Record Company Expense (for cashier flow)
    addExpense({
      id: `exp-pay-${Date.now()}`,
      description: `Pagamento: ${selectedStaff.name}`,
      amount: amount,
      category: 'Salários/Comissões',
      date: new Date().toISOString()
    });

    setPaymentAmount('');
    setShowPayModal(false);
  };

  const getRoleLabel = (role: Staff['role']) => {
    return role || 'Colaborador';
  };

  return (
    <div className="p-4 pb-20">
      <h2 className="text-2xl font-bold text-indigo-900 mb-6 flex items-center">
        <Users className="mr-2" /> Equipe e Comissões
      </h2>

      {/* Staff List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {staff.map((member) => {
           const metrics = getStaffMetrics(member.id);
           return (
            <div 
              key={member.id} 
              onClick={() => setSelectedStaff(member)}
              className="bg-white p-5 rounded-xl shadow-sm border border-indigo-50 flex items-center justify-between cursor-pointer hover:bg-indigo-50/50 transition-colors group"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl mr-4 group-hover:bg-indigo-200 transition">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 group-hover:text-indigo-700">{member.name}</h3>
                  <span className="text-sm text-indigo-500 font-medium capitalize">{getRoleLabel(member.role)}</span>
                  <div className="text-xs text-gray-400 mt-1">Comissão: {member.commissionRate}%</div>
                </div>
              </div>
              <div className="text-right">
                 <div className="text-[10px] uppercase text-gray-400 font-bold">Saldo a Pagar</div>
                 <div className={`font-bold ${metrics.balance > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                    R$ {metrics.balance.toFixed(2)}
                 </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selectedStaff && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
           <div className="bg-white w-full max-w-lg h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
              
              {/* Header */}
              <div className="bg-indigo-700 p-6 text-white shrink-0 relative">
                 <button 
                  onClick={() => setSelectedStaff(null)}
                  className="absolute top-4 right-4 p-1 hover:bg-indigo-600 rounded-full transition"
                 >
                    <X size={24} />
                 </button>
                 <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-2xl">{selectedStaff.name}</h3>
                      <p className="text-indigo-200 text-sm uppercase">{getRoleLabel(selectedStaff.role)}</p>
                    </div>
                    <div className="bg-indigo-800/50 p-3 rounded-lg text-right backdrop-blur-md">
                        <div className="text-xs text-indigo-200 uppercase font-bold">Saldo Atual</div>
                        <div className="text-2xl font-bold">R$ {getStaffMetrics(selectedStaff.id).balance.toFixed(2)}</div>
                    </div>
                 </div>
                 
                 <button 
                    onClick={() => setShowPayModal(true)}
                    className="mt-6 w-full bg-white text-indigo-700 py-3 rounded-lg font-bold shadow-lg hover:bg-indigo-50 transition flex justify-center items-center"
                 >
                    <DollarSign size={18} className="mr-2" /> Realizar Pagamento
                 </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto bg-gray-50">
                 
                 {/* Dashboard Cards */}
                 <div className="p-4 grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-indigo-100 shadow-sm">
                       <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Ganho Hoje</div>
                       <div className="text-lg font-bold text-gray-800">R$ {getStaffMetrics(selectedStaff.id).commDay.toFixed(2)}</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-indigo-100 shadow-sm">
                       <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Ganho Semana</div>
                       <div className="text-lg font-bold text-gray-800">R$ {getStaffMetrics(selectedStaff.id).commWeek.toFixed(2)}</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-indigo-100 shadow-sm">
                       <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Ganho Mês</div>
                       <div className="text-lg font-bold text-gray-800">R$ {getStaffMetrics(selectedStaff.id).commMonth.toFixed(2)}</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-indigo-100 shadow-sm">
                       <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Ganho Ano</div>
                       <div className="text-lg font-bold text-gray-800">R$ {getStaffMetrics(selectedStaff.id).commYear.toFixed(2)}</div>
                    </div>
                 </div>

                 {/* Timeline History */}
                 <div className="px-4 pb-4">
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center">
                       <History size={14} className="mr-1" /> Histórico Financeiro
                    </h4>
                    <div className="space-y-3">
                       {getStaffMetrics(selectedStaff.id).combinedHistory.length === 0 ? (
                          <p className="text-center text-gray-400 py-4 text-sm">Nenhum registro encontrado.</p>
                       ) : (
                          getStaffMetrics(selectedStaff.id).combinedHistory.map((item, idx) => (
                             <div key={idx} className={`p-3 rounded-lg border flex justify-between items-center ${item.type === 'payment' ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100'}`}>
                                <div>
                                   <div className={`text-sm font-bold ${item.type === 'payment' ? 'text-red-700' : 'text-gray-700'}`}>
                                      {item.description}
                                   </div>
                                   <div className="text-xs text-gray-400">
                                      {new Date(item.date).toLocaleString('pt-BR')}
                                   </div>
                                   {/* Show who recorded the entry */}
                                   {item.recordedBy && (
                                       <div className="text-[10px] text-indigo-400 flex items-center mt-1">
                                           <UserCircle size={10} className="mr-1"/> Registrado por: {item.recordedBy}
                                       </div>
                                   )}
                                </div>
                                <div className={`font-mono font-bold ${item.type === 'payment' ? 'text-red-600' : 'text-emerald-600'}`}>
                                   {item.value > 0 ? '+' : ''}R$ {item.value.toFixed(2).replace('-', '')}
                                </div>
                             </div>
                          ))
                       )}
                    </div>
                 </div>
              </div>

              {/* Footer with Close Button */}
              <div className="p-4 border-t bg-white shrink-0">
                <button 
                  onClick={() => setSelectedStaff(null)} 
                  className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition shadow-sm"
                >
                  Fechar
                </button>
              </div>

           </div>
        </div>
      )}

      {/* Payment Form Modal */}
      {showPayModal && (
         <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-xl p-6 shadow-2xl animate-fade-in">
               <h3 className="font-bold text-lg text-gray-800 mb-4">Confirmar Pagamento</h3>
               <p className="text-sm text-gray-600 mb-4">
                  Isso irá registrar um pagamento para <strong>{selectedStaff?.name}</strong> e lançar uma saída no caixa da empresa.
               </p>
               <input 
                  type="number" 
                  step="0.01" 
                  autoFocus
                  placeholder="Valor (R$)" 
                  className="w-full p-3 border rounded-lg mb-4 text-lg font-bold"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
               />
               <div className="flex gap-3">
                  <button onClick={() => setShowPayModal(false)} className="flex-1 py-3 bg-gray-100 rounded-lg font-bold text-gray-600">Cancelar</button>
                  <button onClick={handlePayment} className="flex-1 py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700">Confirmar</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};