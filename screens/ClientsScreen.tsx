import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { User, Phone, Cake, CalendarClock, X, History, TrendingUp, Crown, Shield, Trophy, Medal, Star, Filter, Scissors, Package, Layers, Infinity, GraduationCap, Gift, CheckCircle, ShoppingBag, Box, Tag, Copy } from 'lucide-react'; // Importar Gift

// Loyalty Tiers Configuration
const TIERS = [
  { name: 'Platinum', min: 40000, color: 'text-cyan-700 bg-cyan-50 border-cyan-200', icon: Crown, label: 'Platinum' },
  { name: 'Black', min: 30000, color: 'text-gray-900 bg-gray-100 border-gray-300', icon: Shield, label: 'Black' },
  { name: 'Ouro', min: 20000, color: 'text-yellow-700 bg-yellow-50 border-yellow-200', icon: Trophy, label: 'Ouro' },
  { name: 'Prata', min: 10000, color: 'text-slate-600 bg-slate-100 border-slate-300', icon: Medal, label: 'Prata' },
  { name: 'Bronze', min: 5000, color: 'text-orange-700 bg-orange-50 border-orange-200', icon: Medal, label: 'Bronze' },
  { name: 'Iniciante', min: 2000, color: 'text-blue-600 bg-blue-50 border-blue-200', icon: Star, label: 'Iniciante' },
];

const BASE_TIER = { name: 'Novo', min: 0, color: 'text-gray-500 bg-white border-gray-100', icon: User, label: 'Novo' };

// Extended Client Interface to handle computed properties and hydrated history
interface ExtendedClient extends Omit<Client, 'history'> {
  history: (Sale | StoredHair)[]; // Overrides history to include StoredHair
  totalSpent: number;
  spentServices: number; // NEW: Specific spend on services
  spentProducts: number; // NEW: Specific spend on products
  spentCourses: number;  // NEW: Specific spend on courses
  visits: number;
  currentTier: typeof TIERS[0];
  points: number; // Available Points
  totalPointsAccrued: number; // Lifetime Points
  isBirthdayMonth: boolean; // NEW: Flag for birthday month
}

export const ClientsScreen: React.FC = () => {
  const { clients, sales, loyaltyRewards, pointRedemptions, redeemPoints, storedHair } = useData(); // Get storedHair
  const [selectedClient, setSelectedClient] = useState<ExtendedClient | null>(null);
  const [filterTier, setFilterTier] = useState<string>('todos');
  const [rankingMode, setRankingMode] = useState<'general' | 'services' | 'products' | 'courses'>('general');
  const [modalTab, setModalTab] = useState<'history' | 'shop'>('history');

  // Helper to check if it's the client's birthday month
  const isClientBirthdayMonth = (birthday?: string): boolean => {
    if (!birthday) return false;
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // getMonth() is 0-indexed
    const [day, month] = birthday.split('/').map(Number);
    return month === currentMonth;
  };

  // Helper to get all sales and stored hair for a client
  const getClientHistory = (clientId: string) => {
    const clientSales = sales
      .filter(s => s.clientId === clientId)
      .map(s => ({ ...s, type: 'sale' as const })); // Tag sales with type
    
    const clientStoredHair = storedHair
      .filter(h => h.clientId === clientId)
      .map(h => ({ ...h, type: 'storedHair' as const })); // Tag stored hair with type

    // Combine and sort by date
    return [...clientSales, ...clientStoredHair].sort((a, b) => 
      new Date(b.dateStored || b.date).getTime() - new Date(a.dateStored || a.date).getTime()
    );
  };

  const getClientStats = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    const history = getClientHistory(clientId);
    let totalSpent = 0;
    let spentServices = 0;
    let spentProducts = 0;
    let spentCourses = 0;

    history.forEach(entry => {
        if ('total' in entry) { // It's a Sale
            totalSpent += entry.total;
            
            // Calculate breakdown based on items
            entry.items.forEach(item => {
                const itemTotal = item.price * item.quantity;
                if (item.type === 'service') {
                    spentServices += itemTotal;
                } else if (item.type === 'product') {
                    spentProducts += itemTotal;
                } else if (item.type === 'course') {
                    spentCourses += itemTotal;
                }
            });
        }
    });

    const visits = history.filter(entry => 'total' in entry).length; // Only count sales as visits
    
    // Calculate Redeemed Points
    const redeemed = pointRedemptions.filter(r => r.clientId === clientId).reduce((acc, r) => acc + r.pointsCost, 0);
    const availablePoints = Math.floor(totalSpent - redeemed);

    // Calculate Tier based on TOTAL spent (Loyalty usually considers everything)
    let currentTier = TIERS.find(t => totalSpent >= t.min) || BASE_TIER;

    return { 
        totalSpent, 
        spentServices, 
        spentProducts, 
        spentCourses,
        visits, 
        history, 
        currentTier, 
        points: availablePoints,
        totalPointsAccrued: Math.floor(totalSpent),
        isBirthdayMonth: isClientBirthdayMonth(client?.birthday) // NEW: Add birthday month flag
    };
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const renderHistoryItem = (entry: Sale | StoredHair) => {
    if ('total' in entry) { // It's a Sale
        const sale = entry as Sale;
        return (
            <div key={sale.id} className="border-l-2 border-pink-300 pl-4 py-2 mb-4 relative">
                <div className="absolute -left-[9px] top-3 w-4 h-4 rounded-full bg-pink-100 border-2 border-pink-400"></div>
                <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-bold text-gray-700">{formatDate(sale.date)}</span>
                    <span className="text-sm font-bold text-pink-700 bg-pink-50 px-2 rounded">R$ {sale.total.toFixed(2)}</span>
                </div>
                <div className="space-y-1">
                    {sale.items.map((item, idx) => (
                        <div key={idx} className="text-xs text-gray-600 flex items-center justify-between">
                            <div className="flex items-center">
                                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-2"></span>
                                {item.name} 
                                {item.category && <span className="text-gray-400 ml-1">({item.category})</span>}
                                {item.type === 'product' && <span className="text-gray-400 ml-1">({item.quantity} {item.unit})</span>}
                                {item.type === 'course' && <span className="text-blue-500 ml-1 font-bold">(Curso)</span>}
                            </div>
                            {item.staffName && (
                                <span className="text-[10px] bg-gray-100 px-1 rounded text-gray-500">{item.staffName}</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    } else { // It's StoredHair
        const hair = entry as StoredHair;
        return (
            <div key={hair.id} className={`border-l-2 ${hair.status === 'delivered' ? 'border-green-300' : 'border-purple-300'} pl-4 py-2 mb-4 relative`}>
                <div className={`absolute -left-[9px] top-3 w-4 h-4 rounded-full ${hair.status === 'delivered' ? 'bg-green-100 border-2 border-green-400' : 'bg-purple-100 border-2 border-purple-400'}`}></div>
                <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-bold text-gray-700 flex items-center">
                        <Box size={14} className="mr-1"/> Cabelo Guardado
                    </span>
                    <span className={`text-xs font-bold px-2 rounded ${hair.status === 'delivered' ? 'bg-green-50 text-green-700' : 'bg-purple-50 text-purple-700'}`}>
                        {hair.status === 'delivered' ? 'Entregue' : 'Guardado'}
                    </span>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                    <p>Deixado em: {new Date(hair.dateStored).toLocaleDateString('pt-BR')}</p>
                    {hair.dateDelivered && <p>Entregue em: {new Date(hair.dateDelivered).toLocaleDateString('pt-BR')}</p>}
                    <p>{hair.weight} {hair.weightUnit} • {hair.length} cm</p>
                    {hair.notes && <p className="italic">Obs: {hair.notes}</p>}
                </div>
            </div>
        );
    }
  };

  // Prepare and Sort Clients based on Ranking Mode
  const processedClients = clients.map(client => {
    return { ...client, ...getClientStats(client.id) } as ExtendedClient;
  }).sort((a, b) => {
    if (rankingMode === 'services') return b.spentServices - a.spentServices;
    if (rankingMode === 'products') return b.spentProducts - a.spentProducts;
    if (rankingMode === 'courses') return b.spentCourses - a.spentCourses;
    return b.totalSpent - a.totalSpent; // Default General
  });

  // Filter Clients by Tier (always active)
  const filteredClients = filterTier === 'todos' 
    ? processedClients 
    : processedClients.filter(c => c.currentTier.name === filterTier);

  const handleRedeem = (reward: LoyaltyReward) => {
      if (!selectedClient) return;
      if (selectedClient.points < reward.pointsCost) {
          alert("Pontos insuficientes para este prêmio.");
          return;
      }
      if (confirm(`Resgatar "${reward.title}" por ${reward.pointsCost} pontos?`)) {
          redeemPoints(selectedClient.id, reward);
          // Refresh local selected client to show updated points
          const updatedStats = getClientStats(selectedClient.id);
          // We need to re-calculate stats after redemption which happens in context
          // Since context updates, we can just re-read the client data if we were reactive, 
          // but here we might need to manually update local state or wait for re-render.
          // For simplicity, close and reopen or just force update via state.
          // Better: The 'selectedClient' is a snapshot. We should update it.
          setSelectedClient(prev => prev ? { ...prev, points: prev.points - reward.pointsCost } : null);
          alert("Resgate realizado com sucesso!");
      }
  };

  return (
    <div className="p-4 pb-20 relative">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-pink-900 flex items-center mb-1">
          <User className="mr-2" /> Clientes & Fidelidade
        </h2>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
           <p className="text-sm text-pink-600">
             Gerencie o ranking e visualize quem são seus melhores clientes.
           </p>
           <div className="bg-pink-50 border border-pink-100 px-3 py-1.5 rounded-lg inline-flex items-center self-start">
              <Infinity size={14} className="text-pink-700 mr-2" />
              <span className="text-xs font-bold text-pink-800">
                 Pontos Acumulados: Não expiram.
              </span>
           </div>
        </div>
      </div>

      {/* Ranking Mode Tabs */}
      <div className="flex bg-white p-1 rounded-xl shadow-sm border border-pink-100 mb-4 overflow-x-auto">
        <button 
            onClick={() => setRankingMode('general')}
            className={`flex-1 min-w-[80px] py-2 text-sm font-bold rounded-lg flex items-center justify-center transition-colors whitespace-nowrap ${rankingMode === 'general' ? 'bg-pink-100 text-pink-800' : 'text-gray-500 hover:bg-gray-50'}`}
        >
            <Layers size={16} className="mr-2"/> Geral
        </button>
        <button 
            onClick={() => setRankingMode('services')}
            className={`flex-1 min-w-[80px] py-2 text-sm font-bold rounded-lg flex items-center justify-center transition-colors whitespace-nowrap ${rankingMode === 'services' ? 'bg-blue-100 text-blue-800' : 'text-gray-500 hover:bg-gray-50'}`}
        >
            <Scissors size={16} className="mr-2"/> Serviços
        </button>
        <button 
            onClick={() => setRankingMode('products')}
            className={`flex-1 min-w-[80px] py-2 text-sm font-bold rounded-lg flex items-center justify-center transition-colors whitespace-nowrap ${rankingMode === 'products' ? 'bg-amber-100 text-amber-800' : 'text-gray-500 hover:bg-gray-50'}`}
        >
            <Package size={16} className="mr-2"/> Produtos
        </button>
        <button 
            onClick={() => setRankingMode('courses')}
            className={`flex-1 min-w-[80px] py-2 text-sm font-bold rounded-lg flex items-center justify-center transition-colors whitespace-nowrap ${rankingMode === 'courses' ? 'bg-indigo-100 text-indigo-800' : 'text-gray-500 hover:bg-gray-50'}`}
        >
            <GraduationCap size={16} className="mr-2"/> Cursos
        </button>
      </div>

      {/* Tier Filter */}
      <div className="mb-6 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilterTier('todos')}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
              filterTier === 'todos' 
                ? 'bg-pink-600 text-white shadow-md' 
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            Todos
          </button>
          {TIERS.map(tier => (
             <button
              key={tier.name}
              onClick={() => setFilterTier(tier.name)}
              className={`px-3 py-2 rounded-full text-xs font-bold whitespace-nowrap flex items-center transition-all border ${
                filterTier === tier.name
                  ? `${tier.color} ring-2 ring-offset-1 ring-pink-100 shadow-sm`
                  : 'bg-white text-gray-500 border-gray-200 opacity-70 hover:opacity-100'
              }`}
            >
              <tier.icon size={12} className="mr-1" />
              {tier.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredClients.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Filter size={40} className="mx-auto mb-2 opacity-20"/>
            <p>Nenhum cliente nesta categoria.</p>
          </div>
        ) : (
          filteredClients.map((client, index) => {
            const TierIcon = client.currentTier.icon;
            
            // Determine value to display based on ranking mode
            let displayLabel = 'Pontos Acumulados';
            let displayValue = client.totalPointsAccrued;
            let displayColor = 'text-pink-700';

            if (rankingMode === 'services') {
                displayLabel = 'Gasto em Serviços';
                displayValue = client.spentServices;
                displayColor = 'text-blue-700';
            } else if (rankingMode === 'products') {
                displayLabel = 'Gasto em Produtos';
                displayValue = client.spentProducts;
                displayColor = 'text-amber-700';
            } else if (rankingMode === 'courses') {
                displayLabel = 'Investido em Cursos';
                displayValue = client.spentCourses;
                displayColor = 'text-indigo-700';
            }

            return (
              <div 
                key={client.id} 
                onClick={() => { setSelectedClient(client); setModalTab('history'); }}
                className={`bg-white p-4 rounded-xl shadow-sm border hover:bg-pink-50/30 transition-all cursor-pointer relative overflow-hidden group ${client.currentTier.name === 'Platinum' ? 'border-cyan-100' : 'border-pink-50'}`}
              >
                {/* Rank Badge for top 3 */}
                {filterTier === 'todos' && index < 3 && (
                  <div className={`absolute -right-6 top-3 w-20 text-center transform rotate-45 text-[10px] font-bold text-white shadow-sm
                    ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'}
                  `}>
                    #{index + 1}
                  </div>
                )}

                <div className="flex justify-between items-start">
                  <div className="flex items-start">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 border-2 ${client.currentTier.color.replace('text-', 'border-').split(' ')[2] || 'border-gray-100'} bg-white`}>
                       <TierIcon size={20} className={client.currentTier.color.split(' ')[0]} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg leading-tight flex items-center">
                        {client.name}
                        {client.isBirthdayMonth && (
                            <Gift size={18} className="ml-2 text-pink-500" title="Mês de Aniversário!"/>
                        )}
                      </h3>
                      <div className="flex items-center text-gray-500 mt-1 text-xs">
                        <Phone size={12} className="mr-1" />
                        <span>{client.phone}</span>
                      </div>
                      <div className={`mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${client.currentTier.color}`}>
                         {client.currentTier.name}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1 mt-1 pr-6">
                    <div className="text-right">
                      <div className="text-[10px] text-gray-400 uppercase font-bold">{displayLabel}</div>
                      <div className={`font-bold text-lg ${displayColor}`}>
                         {rankingMode === 'general' ? client.totalPointsAccrued.toLocaleString('pt-BR') + ' pts' : 'R$ ' + displayValue.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detail Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center animate-fade-in backdrop-blur-sm">
          <div className="bg-white w-full md:max-w-xl h-[90vh] md:h-auto md:max-h-[85vh] rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className={`p-6 text-white shrink-0 relative ${selectedClient.currentTier.name === 'Platinum' ? 'bg-cyan-700' : selectedClient.currentTier.name === 'Black' ? 'bg-gray-900' : 'bg-pink-600'}`}>
               <button 
                onClick={() => setSelectedClient(null)}
                className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition"
               >
                 <X size={24} />
               </button>
               <div className="flex items-center mb-2">
                  <selectedClient.currentTier.icon size={24} className="mr-2 text-white/90" />
                  <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">{selectedClient.currentTier.name}</span>
               </div>
               <h2 className="text-2xl font-bold flex items-center">
                 {selectedClient.name}
                 {selectedClient.isBirthdayMonth && (
                    <Gift size={24} className="ml-3 text-yellow-300" title="Mês de Aniversário!"/>
                 )}
               </h2>
               <div className="flex items-center mt-2 space-x-4 text-white/80 text-sm">
                  {selectedClient.birthday ? (
                    <div className="flex items-center bg-black/10 px-2 py-1 rounded">
                      <Cake size={14} className="mr-1" /> 
                      {selectedClient.birthday}
                    </div>
                  ) : (
                    <div className="flex items-center opacity-70">
                      <Cake size={14} className="mr-1" /> N/A
                    </div>
                  )}
                  <div className="flex items-center">
                    <Phone size={14} className="mr-1" /> {selectedClient.phone}
                  </div>
               </div>
            </div>

            {/* Stats Bar */}
            <div className="bg-gray-50 p-4 shrink-0 border-b border-gray-100 overflow-x-auto">
               <div className="flex justify-between min-w-[320px] gap-2">
                  <div className="text-center flex-1 border-r border-gray-200">
                    <div className="text-xs text-gray-500 font-bold uppercase flex justify-center items-center mb-1">
                      <TrendingUp size={12} className="mr-1"/> Pontos Disp.
                    </div>
                    <div className="text-lg font-bold text-green-600">{selectedClient.points}</div>
                  </div>
                  <div className="text-center flex-1 border-r border-gray-200">
                      <div className="text-xs text-blue-500 font-bold uppercase flex justify-center items-center mb-1">
                          <Scissors size={12} className="mr-1"/> Serviços
                      </div>
                      <div className="text-sm font-bold text-gray-800">R$ {selectedClient.spentServices.toFixed(0)}</div>
                  </div>
                  <div className="text-center flex-1 border-r border-gray-200">
                    <div className="text-xs text-amber-500 font-bold uppercase flex justify-center items-center mb-1">
                       <Package size={12} className="mr-1"/> Produtos
                    </div>
                    <div className="text-sm font-bold text-gray-800">R$ {selectedClient.spentProducts.toFixed(0)}</div>
                  </div>
                  <div className="text-center flex-1">
                    <div className="text-xs text-indigo-500 font-bold uppercase flex justify-center items-center mb-1">
                       <GraduationCap size={12} className="mr-1"/> Cursos
                    </div>
                    <div className="text-sm font-bold text-gray-800">R$ {selectedClient.spentCourses.toFixed(0)}</div>
                  </div>
               </div>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-gray-100">
               <button 
                 onClick={() => setModalTab('history')}
                 className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition ${modalTab === 'history' ? 'border-pink-500 text-pink-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
               >
                 <History size={16} className="inline mr-1"/> Histórico
               </button>
               <button 
                 onClick={() => setModalTab('shop')}
                 className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition ${modalTab === 'shop' ? 'border-pink-500 text-pink-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
               >
                 <ShoppingBag size={16} className="inline mr-1"/> Lojinha de Pontos
               </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-white space-y-6">
               
               {/* Rewards Shop Section */}
               {modalTab === 'shop' && (
                 <div className="animate-fade-in">
                    <div className="bg-pink-50 p-4 rounded-xl border border-pink-100 mb-4 flex justify-between items-center">
                        <h3 className="font-bold text-pink-800 text-xs uppercase tracking-widest flex items-center">
                            <Gift size={14} className="mr-2"/> Resgatar Recompensas
                        </h3>
                        <span className="text-xs font-bold text-pink-600 bg-white px-2 py-1 rounded shadow-sm">
                            Saldo: {selectedClient.points} pts
                        </span>
                    </div>
                    
                    <div className="space-y-3">
                        {loyaltyRewards.length === 0 ? (
                            <p className="text-center text-gray-400 py-8 text-sm italic">Nenhum prêmio configurado.</p>
                        ) : (
                            loyaltyRewards.map(reward => {
                                const canRedeem = selectedClient.points >= reward.pointsCost;
                                const hasStock = reward.stock === undefined || reward.stock > 0;
                                
                                let limitReached = false;
                                if (reward.limitPerClient) {
                                    const redemptions = pointRedemptions.filter(r => r.clientId === selectedClient.id && r.rewardId === reward.id).length;
                                    if (redemptions >= reward.limitPerClient) limitReached = true;
                                }

                                return (
                                    <div key={reward.id} className={`flex justify-between items-center p-4 rounded-xl border transition ${!hasStock || limitReached ? 'opacity-60 border-red-100 bg-red-50' : canRedeem ? 'bg-white border-green-200 hover:shadow-md' : 'bg-gray-50 border-gray-100'}`}>
                                        <div className="flex items-center">
                                            <div className={`p-3 rounded-full mr-3 ${canRedeem && hasStock && !limitReached ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
                                                <Gift size={20}/>
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-gray-800">{reward.title}</div>
                                                <div className="text-xs text-gray-500">{reward.description}</div>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end">
                                            <div className="text-sm font-bold text-gray-600 mb-1">{reward.pointsCost} pts</div>
                                            <button 
                                                onClick={() => handleRedeem(reward)}
                                                disabled={!canRedeem || !hasStock || limitReached}
                                                className={`text-xs px-3 py-1.5 rounded font-bold transition ${canRedeem && hasStock && !limitReached ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                                            >
                                                {limitReached ? 'Limite Atingido' : !hasStock ? 'Esgotado' : 'Resgatar'}
                                            </button>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>

                    <div className="mt-8 border-t pt-4">
                          <h4 className="font-bold text-gray-600 text-sm uppercase mb-4 flex items-center"><Tag size={16} className="mr-2"/> Meus Resgates</h4>
                          <div className="space-y-2">
                              {pointRedemptions.filter(r => r.clientId === selectedClient.id).length === 0 ? (
                                  <p className="text-xs text-gray-400 text-center">Você ainda não comprou prêmios.</p>
                              ) : (
                                  pointRedemptions
                                    .filter(r => r.clientId === selectedClient.id)
                                    .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                    .map((redemption, idx) => (
                                      <div key={idx} className="flex justify-between items-center text-xs p-3 bg-white rounded border border-gray-100">
                                          <div>
                                              <span className="font-bold text-gray-700 block">{redemption.rewardTitle}</span>
                                              <span className="text-gray-400 flex items-center mt-1"><History size={10} className="mr-1"/> {new Date(redemption.date).toLocaleDateString()}</span>
                                          </div>
                                          {redemption.code && (
                                              <div className="bg-rose-50 text-rose-700 px-2 py-1 rounded font-mono font-bold border border-rose-100 flex items-center">
                                                  <Tag size={10} className="mr-1"/>
                                                  {redemption.code}
                                              </div>
                                          )}
                                      </div>
                                  ))
                              )}
                          </div>
                      </div>
                 </div>
               )}

               {/* History Section */}
               {modalTab === 'history' && (
                 <div className="animate-fade-in">
                    <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest mb-4">Últimas Atividades</h3>
                    
                    {selectedClient.history.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                        <CalendarClock size={48} className="mx-auto mb-2 opacity-30" />
                        <p>Nenhuma visita registrada ainda.</p>
                        </div>
                    ) : (
                        <div className="pl-2">
                        {selectedClient.history.map(entry => renderHistoryItem(entry))}
                        </div>
                    )}
                 </div>
               )}
            </div>

            <div className="p-4 border-t bg-white shrink-0 md:hidden">
              <button onClick={() => setSelectedClient(null)} className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl">
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};