import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { Scissors, Calendar, MapPin, Filter, TrendingUp, Clock, User, Download, X, Settings, Users, Edit2, Trash2, Save, CheckSquare, Square, DollarSign, PackagePlus, PieChart, ArrowUpRight, ArrowDownRight, Globe, Scale, Copy, PackageCheck, ShoppingBag, BarChart3, Trophy, Medal, Star, CheckCircle, Camera, Ruler, Activity, Palette, Award, AlertTriangle } from 'lucide-react';
import { SocialUser, HairOption, HairCalcConfig, HairQuote, UnitType } from '../types';
import { BRAZIL_STATES, AGE_GROUPS } from '../constants';

export const HairBusinessScreen: React.FC = () => {
  const { hairQuotes, socialUsers, addSocialUser, updateSocialUser, removeSocialUser, hairConfig, updateHairConfig, addProduct, sales, expenses, updateHairQuote, products, approveHairQuote } = useData();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'finance' | 'evaluators' | 'rules'>('dashboard');

  // Dashboard State
  const [hairFilter, setHairFilter] = useState<'all' | 'purchased' | 'quoted' | 'awaiting_approval'>('awaiting_approval');
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);
  
  // Product Conversion State
  const [quoteToConvert, setQuoteToConvert] = useState<HairQuote | null>(null);
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductUnit, setNewProductUnit] = useState<UnitType>('un');
  const [newProductStock, setNewProductStock] = useState('1');
  const [newProductIsOnline, setNewProductIsOnline] = useState(true);

  // Evaluators Form State
  const [editingEvaluator, setEditingEvaluator] = useState<SocialUser | null>(null);
  const [evalName, setEvalName] = useState('');
  const [evalCpf, setEvalCpf] = useState('');
  const [evalAddr, setEvalAddr] = useState('');
  const [evalUnit, setEvalUnit] = useState('');
  const [evalUser, setEvalUser] = useState('');
  const [evalPass, setEvalPass] = useState('');

  // --- Rules Editor State ---
  const [selectedRuleContext, setSelectedRuleContext] = useState<string>('global');
  const [localConfig, setLocalConfig] = useState<HairCalcConfig>(hairConfig);
  const [hasChanges, setHasChanges] = useState(false);

  // --- Goal & Ranking State ---
  const [goalAmount, setGoalAmount] = useState(hairConfig.monthlyGoal?.toString() || '');
  const [goalReward, setGoalReward] = useState(hairConfig.monthlyReward || '');

  // --- Edit Hair Quote Modal State ---
  const [showEditQuoteModal, setShowEditQuoteModal] = useState(false);
  const [editingQuoteData, setEditingQuoteData] = useState<HairQuote | null>(null);
  const [editQuoteError, setEditQuoteError] = useState('');

  // Refs for photo uploads in Edit Quote Modal
  const editFrontRef = useRef<HTMLInputElement>(null);
  const editSideRef = useRef<HTMLInputElement>(null);
  const editBackRef = useRef<HTMLInputElement>(null);

  // Sync state when entering the screen OR changing the rule context
  useEffect(() => {
    if (selectedRuleContext === 'global') {
        setLocalConfig(hairConfig);
        setGoalAmount(hairConfig.monthlyGoal?.toString() || '');
        setGoalReward(hairConfig.monthlyReward || '');
    } else {
        const user = socialUsers.find(u => u.id === selectedRuleContext);
        if (user && user.customConfig) {
            setLocalConfig(user.customConfig);
        } else {
            // If user has no custom config, start with the global default
            setLocalConfig(hairConfig);
        }
    }
  }, [hairConfig, selectedRuleContext, socialUsers]);

  // --- Hair Statistics Logic (Stats) ---
  const now = new Date();
  const parseDate = (dateStr: string) => new Date(dateStr);
  const isToday = (d: Date) => d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  const isWeek = (d: Date) => {
    const start = new Date(now); start.setDate(now.getDate() - now.getDay()); start.setHours(0,0,0,0);
    return d >= start;
  };
  const isMonth = (d: Date) => d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  const isYear = (d: Date) => d.getFullYear() === now.getFullYear();

  let hairStats = { day: 0, week: 0, month: 0, year: 0, countDay: 0, countWeek: 0, countMonth: 0, countYear: 0 };
  
  hairQuotes.filter(q => q.status === 'stock' || q.status === 'sold').forEach(q => { 
    const d = parseDate(q.date);
    const val = q.totalValue;
    if (isToday(d)) { hairStats.day += val; hairStats.countDay++; }
    if (isWeek(d)) { hairStats.week += val; hairStats.countWeek++; }
    if (isMonth(d)) { hairStats.month += val; hairStats.countMonth++; }
    if (isYear(d)) { hairStats.year += val; hairStats.countYear++; }
  });

  // --- NEW FINANCIAL LOGIC (Separate Cash Flow) ---
  let financialStats = {
    income: 0,
    expenses: 0,
    balance: 0
  };

  financialStats.expenses = expenses
    .filter(e => e.businessUnit === 'hair_business')
    .reduce((acc, e) => acc + e.amount, 0);

  const hairSalesItems: any[] = [];
  
  sales.forEach(sale => {
     sale.items.forEach(item => {
        if (item.origin === 'hair_business') {
            const val = item.price * item.quantity;
            financialStats.income += val;
            hairSalesItems.push({
                saleDate: sale.date,
                item,
                value: val
            });
        } else {
             const originalProduct = products.find(p => p.id === item.id);
             if (originalProduct && originalProduct.origin === 'hair_business') {
                 const val = item.price * item.quantity;
                 financialStats.income += val;
                 hairSalesItems.push({
                    saleDate: sale.date,
                    item,
                    value: val
                });
             }
        }
     });
  });

  financialStats.balance = financialStats.income - financialStats.expenses;


  const getEvaluatorDetails = (id: string) => {
    return socialUsers.find(u => u.id === id);
  };

  // --- Evaluator Handlers ---
  const handleSaveEvaluator = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEvaluator) {
      updateSocialUser({ ...editingEvaluator, fullName: evalName, cpf: evalCpf, address: evalAddr, unit: evalUnit, username: evalUser, password: evalPass });
      setEditingEvaluator(null);
      alert('Avaliador atualizado!');
    } else {
      addSocialUser({ id: `soc-${Date.now()}`, fullName: evalName, cpf: evalCpf, address: evalAddr, unit: evalUnit, username: evalUser, password: evalPass });
      alert('Avaliador cadastrado!');
    }
    setEvalName(''); setEvalCpf(''); setEvalAddr(''); setEvalUnit(''); setEvalUser(''); setEvalPass('');
  };

  const startEditingEvaluator = (user: SocialUser) => {
    setEditingEvaluator(user);
    setEvalName(user.fullName); setEvalCpf(user.cpf); setEvalAddr(user.address); setEvalUnit(user.unit); setEvalUser(user.username); setEvalPass(user.password);
  };

  const cancelEditing = () => {
    setEditingEvaluator(null);
    setEvalName(''); setEvalCpf(''); setEvalAddr(''); setEvalUnit(''); setEvalUser(''); setEvalPass('');
  };

  // --- Goals Handlers ---
  const handleSaveGoal = () => {
      const newGoal = parseFloat(goalAmount);
      updateHairConfig({
          ...hairConfig,
          monthlyGoal: newGoal,
          monthlyReward: goalReward
      });
      alert('Metas e Premiação atualizadas!');
  };

  // --- Product Conversion Handler ---
  const openConversionModal = (quote: HairQuote) => {
    setQuoteToConvert(quote);
    setNewProductPrice(quote.totalValue.toFixed(2)); // Pre-fill with purchase price
    setNewProductUnit(quote.weightUnit || 'un'); // Pre-fill with quote weight unit
    setNewProductStock(quote.weight?.toString() || '1'); // Pre-fill with quote weight
    setNewProductIsOnline(true);
  };

  const handleConvertQuoteToProduct = () => {
    if (!quoteToConvert || !newProductPrice || !newProductStock) {
        alert("Preencha o valor de venda e estoque.");
        return;
    }

    const firstName = (quoteToConvert.sellerName || 'Vendedor').split(' ')[0];
    const cpfPart = (quoteToConvert.sellerCpf || '000').replace(/\D/g, '').substring(0, 3);
    const productName = `${firstName} ${cpfPart}### ${quoteToConvert.sellerState || ''} ${quoteToConvert.sellerAgeGroup || ''}`;
    
    const description = `Cabelo Humano: ${quoteToConvert.hairType} ${quoteToConvert.color}, ${quoteToConvert.length}cm, ${quoteToConvert.circumference}cm, ${quoteToConvert.condition}`;

    const images: string[] = [];
    if (quoteToConvert.photos?.front) images.push(quoteToConvert.photos.front);
    if (quoteToConvert.photos?.side) images.push(quoteToConvert.photos.side);
    if (quoteToConvert.photos?.back) images.push(quoteToConvert.photos.back);

    addProduct({
      id: `p-hair-${Date.now()}`,
      name: productName,
      category: description, 
      price: parseFloat(newProductPrice),
      stock: parseFloat(newProductStock), 
      unit: newProductUnit,
      imageUrl: images[0] || 'https://picsum.photos/200/200',
      images: images, 
      origin: 'hair_business',
      isOnline: newProductIsOnline,
      hairQuoteId: quoteToConvert.id
    });

    const updatedQuote: HairQuote = {
        ...quoteToConvert,
        status: 'stock' // Keep as stock, product is now created
    };
    updateHairQuote(updatedQuote);

    alert("Cabelo adicionado ao estoque e marcado como 'Aguardando Venda'!");
    setQuoteToConvert(null);
    setNewProductPrice('');
  };

  const handleApproveQuote = (quoteId: string) => {
      if (confirm("Tem certeza que deseja APROVAR esta compra? Ela será adicionada ao estoque e contará para a meta do avaliador.")) {
          approveHairQuote(quoteId);
          alert("Compra aprovada e adicionada ao estoque!");
      }
  };


  // --- RULES EDITOR LOGIC ---
  const handleConfigChange = <K extends keyof HairCalcConfig>(
    section: K, 
    itemId: string | null, 
    field: keyof HairOption | 'maxPriceLimit' | 'blockPurchaseMessage', 
    value: any
  ) => {
    const newConfig = { ...localConfig };

    if (section === 'maxPriceLimit' || section === 'blockPurchaseMessage') {
        (newConfig as any)[section] = value;
    } else {
        const array = newConfig[section] as HairOption[];
        const index = array.findIndex(i => i.id === itemId);
        if (index > -1) {
            const key = field as keyof HairOption;
            array[index] = { ...array[index], [key]: value };
        }
    }
    setLocalConfig(newConfig);
    setHasChanges(true);
  };

  const toggleSectionAll = (section: keyof HairCalcConfig, enable: boolean) => {
      const newConfig = { ...localConfig };
      const val = newConfig[section];
      if (Array.isArray(val)) {
        const array = val as HairOption[];
        (newConfig as any)[section] = array.map(item => ({ ...item, enabled: enable }));
        setLocalConfig(newConfig);
        setHasChanges(true);
      }
  };

  const saveConfiguration = () => {
    if (selectedRuleContext === 'global') {
        updateHairConfig(localConfig);
        alert("Configuração GLOBAL salva com sucesso!");
    } else {
        const user = socialUsers.find(u => u.id === selectedRuleContext);
        if (user) {
            updateSocialUser({ ...user, customConfig: localConfig });
            alert(`Configuração para ${user.fullName} salva com sucesso!`);
        }
    }
    setHasChanges(false);
  };

  const renderConfigSection = (title: string, sectionKey: keyof HairCalcConfig, data: HairOption[]) => (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-bold text-gray-800">{title}</h4>
        <div className="space-x-2 text-xs">
           <button type="button" onClick={() => toggleSectionAll(sectionKey, true)} className="text-blue-600 hover:underline">Marcar Todos</button>
           <span>|</span>
           <button type="button" onClick={() => toggleSectionAll(sectionKey, false)} className="text-gray-500 hover:underline">Desmarcar Todos</button>
        </div>
      </div>
      <div className="space-y-2">
         {data.map((item) => (
            <div key={item.id} className={`flex items-center justify-between p-2 rounded border ${item.enabled ? 'bg-gray-50 border-gray-200' : 'bg-gray-100 border-gray-100 opacity-60'}`}>
               <div className="flex items-center flex-1">
                   <button 
                     type="button"
                     onClick={() => handleConfigChange(sectionKey, item.id, 'enabled', !item.enabled)}
                     className={`mr-3 p-1 rounded transition ${item.enabled ? 'text-green-600 hover:bg-green-100' : 'text-gray-400 hover:bg-gray-200'}`}
                   >
                     {item.enabled ? <CheckSquare size={20}/> : <Square size={20}/>}
                   </button>
                   <span className={`font-medium ${item.enabled ? 'text-gray-800' : 'text-gray-500 line-through'}`}>{item.label}</span>
               </div>
               <div className="w-32">
                  <div className="relative">
                     <span className="absolute left-2 top-1.5 text-xs text-gray-500">R$</span>
                     <input 
                        type="number" 
                        step="0.01"
                        className="w-full pl-6 p-1 text-sm border rounded font-bold text-right"
                        value={item.price}
                        onChange={(e) => handleConfigChange(sectionKey, item.id, 'price', parseFloat(e.target.value))}
                        disabled={!item.enabled}
                     />
                  </div>
               </div>
            </div>
         ))}
      </div>
    </div>
  );

  // --- Calculate Profit per Item Logic ---
  const soldItemsProfit = hairQuotes
    .filter(q => q.status === 'sold')
    .map(quote => {
        const product = products.find(p => p.hairQuoteId === quote.id);
        let soldPrice = 0;
        let soldDate = '';

        if (product) {
            for (const sale of sales) {
                const item = sale.items.find(i => i.id === product.id);
                if (item) {
                    soldPrice = item.price * item.quantity;
                    soldDate = sale.date;
                    break;
                }
            }
        }

        return {
            quoteId: quote.id,
            description: `${quote.hairType} - ${quote.sellerName}`,
            buyPrice: quote.totalValue,
            sellPrice: soldPrice,
            profit: soldPrice - quote.totalValue,
            date: soldDate || quote.date
        };
    })
    .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalCalculatedProfit = soldItemsProfit.reduce((acc, i) => acc + i.profit, 0);

  // --- EVALUATOR RANKING LOGIC ---
  const evaluatorRanking = socialUsers.map(user => {
      const monthlyTotal = hairQuotes
        .filter(q => q.evaluatorId === user.id && (q.status === 'stock' || q.status === 'sold') && isMonth(new Date(q.date)))
        .reduce((acc, q) => acc + q.totalValue, 0);
      
      const goal = hairConfig.monthlyGoal || 1;
      const progress = Math.min((monthlyTotal / goal) * 100, 100);

      return {
          ...user,
          monthlyTotal,
          progress
      };
  }).sort((a,b) => b.monthlyTotal - a.monthlyTotal);

  // --- Edit Quote Modal Handlers ---
  const openEditQuote = (quote: HairQuote) => {
    setEditingQuoteData({ ...quote }); // Create a copy to edit
    setShowEditQuoteModal(true);
    setEditQuoteError('');
  };

  const handleEditQuoteChange = (field: keyof HairQuote, value: any) => {
    setEditingQuoteData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleEditPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, photoKey: 'front' | 'side' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const resizedImage = await resizeImage(file); // Assuming resizeImage is available
        setEditingQuoteData(prev => prev ? { ...prev, photos: { ...prev.photos, [photoKey]: resizedImage } } : null);
      } catch (err) {
        console.error("Error resizing image", err);
        const reader = new FileReader();
        reader.onloadend = () => setEditingQuoteData(prev => prev ? { ...prev, photos: { ...prev.photos, [photoKey]: reader.result as string } } : null);
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSaveEditedQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuoteData) return;

    // Basic validation
    if (!editingQuoteData.hairType || !editingQuoteData.length || !editingQuoteData.circumference || !editingQuoteData.condition || !editingQuoteData.quality || !editingQuoteData.color || editingQuoteData.totalValue <= 0) {
        setEditQuoteError("Por favor, preencha todos os campos obrigatórios e o valor total.");
        return;
    }
    if (editingQuoteData.weight && editingQuoteData.weight <= 0) {
        setEditQuoteError("A gramagem deve ser maior que zero.");
        return;
    }

    await updateHairQuote(editingQuoteData);
    setShowEditQuoteModal(false);
    setEditingQuoteData(null);
    alert("Cotação de cabelo atualizada com sucesso!");
  };

  const resizeImage = (file: File, maxWidth: number = 800): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.7));
          } else {
             reject(new Error("Canvas context error"));
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };


  return (
    <div className="p-4 pb-20 relative">
      <h2 className="text-2xl font-bold text-purple-900 mb-6 flex items-center">
        <Scissors className="mr-2" /> Gestão de Cabelos
      </h2>

      {/* TABS */}
      <div className="flex mb-6 bg-purple-50 p-1 rounded-lg overflow-x-auto">
        <button onClick={() => setActiveTab('dashboard')} className={`flex-1 min-w-[100px] py-2 rounded-md text-sm font-bold transition ${activeTab === 'dashboard' ? 'bg-white shadow text-purple-800' : 'text-purple-400 hover:text-purple-600'}`}>
           <TrendingUp size={16} className="inline mr-1"/> Compras
        </button>
        <button onClick={() => setActiveTab('finance')} className={`flex-1 min-w-[100px] py-2 rounded-md text-sm font-bold transition ${activeTab === 'finance' ? 'bg-white shadow text-purple-800' : 'text-purple-400 hover:text-purple-600'}`}>
           <DollarSign size={16} className="inline mr-1"/> Financeiro
        </button>
        <button onClick={() => setActiveTab('evaluators')} className={`flex-1 min-w-[100px] py-2 rounded-md text-sm font-bold transition ${activeTab === 'evaluators' ? 'bg-white shadow text-purple-800' : 'text-purple-400 hover:text-purple-600'}`}>
           <Users size={16} className="inline mr-1"/> Avaliadores
        </button>
        <button onClick={() => setActiveTab('rules')} className={`flex-1 min-w-[100px] py-2 rounded-md text-sm font-bold transition ${activeTab === 'rules' ? 'bg-white shadow text-purple-800' : 'text-purple-400 hover:text-purple-600'}`}>
           <Settings size={16} className="inline mr-1"/> Regras
        </button>
      </div>

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div className="animate-fade-in">
           {/* HAIR STATS DASHBOARD */}
           <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-8">
                <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center">
                    <TrendingUp size={20} className="mr-2 text-purple-600"/> Indicadores de Compras (Entradas de Cabelo)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                    <div className="text-[10px] text-purple-600 font-bold uppercase mb-1 flex items-center"><Calendar size={10} className="mr-1"/> Hoje</div>
                    <div className="text-2xl font-bold text-gray-800">R$ {hairStats.day.toFixed(2)}</div>
                    <div className="text-xs text-gray-500 mt-1">{hairStats.countDay} compras</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                    <div className="text-[10px] text-purple-600 font-bold uppercase mb-1">Semana</div>
                    <div className="text-2xl font-bold text-gray-800">R$ {hairStats.week.toFixed(2)}</div>
                    <div className="text-xs text-gray-500 mt-1">{hairStats.countWeek} compras</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                    <div className="text-[10px] text-purple-600 font-bold uppercase mb-1">Mês</div>
                    <div className="text-2xl font-bold text-gray-800">R$ {hairStats.month.toFixed(2)}</div>
                    <div className="text-xs text-gray-500 mt-1">{hairStats.countMonth} compras</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                    <div className="text-[10px] text-purple-600 font-bold uppercase mb-1">Ano</div>
                    <div className="text-2xl font-bold text-gray-800">R$ {hairStats.year.toFixed(2)}</div>
                    <div className="text-xs text-gray-500 mt-1">{hairStats.countYear} compras</div>
                    </div>
                </div>
            </div>

            {/* LIST */}
            <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                    <h4 className="font-bold text-gray-700 text-lg">Registro de Atividades</h4>
                    <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm w-full md:w-auto overflow-x-auto">
                        <button onClick={() => setHairFilter('awaiting_approval')} className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-md transition whitespace-nowrap ${hairFilter === 'awaiting_approval' ? 'bg-yellow-100 text-yellow-700' : 'text-gray-500 hover:bg-gray-50'}`}>Aguardando Aprovação</button>
                        <button onClick={() => setHairFilter('purchased')} className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-md transition whitespace-nowrap ${hairFilter === 'purchased' ? 'bg-green-100 text-green-700' : 'text-gray-500 hover:bg-gray-50'}`}>Comprados / Estoque</button>
                        <button onClick={() => setHairFilter('quoted')} className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-md transition whitespace-nowrap ${hairFilter === 'quoted' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}>Apenas Avaliados</button>
                        <button onClick={() => setHairFilter('all')} className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-md transition whitespace-nowrap ${hairFilter === 'all' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-50'}`}>Todos</button>
                    </div>
                </div>
                
                <div className="space-y-3">
                    {hairQuotes
                    .filter(q => {
                        if (hairFilter === 'awaiting_approval') return q.status === 'purchased';
                        if (hairFilter === 'purchased') return q.status === 'stock' || q.status === 'sold';
                        if (hairFilter === 'quoted') return q.status === 'quoted';
                        return true;
                    })
                    .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(quote => {
                        const evaluator = getEvaluatorDetails(quote.evaluatorId);
                        const dateObj = new Date(quote.date);
                        
                        let statusColor = 'bg-yellow-100 text-yellow-700';
                        let statusText = 'Avaliado';
                        
                        if (quote.status === 'purchased') { statusColor = 'bg-orange-100 text-orange-700'; statusText = 'Aguardando Aprovação'; }
                        if (quote.status === 'stock') { statusColor = 'bg-green-100 text-green-700'; statusText = 'Aprovado / Em Estoque'; }
                        if (quote.status === 'sold') { statusColor = 'bg-gray-800 text-white'; statusText = 'Cabelo Vendido'; }

                        return (
                        <div key={quote.id} className={`p-5 border rounded-xl flex flex-col md:flex-row justify-between items-start gap-4 transition hover:shadow-md ${quote.status === 'purchased' ? 'bg-orange-50 border-orange-200 shadow-sm' : quote.status === 'stock' || quote.status === 'sold' ? 'bg-white border-green-200 shadow-sm' : 'bg-gray-50 border-gray-200 opacity-90'}`}>
                            <div className="flex-1 w-full">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex flex-col">
                                    <span className="font-bold text-gray-800 text-sm flex items-center">
                                        <Calendar size={12} className="mr-1"/> {dateObj.toLocaleDateString('pt-BR')}
                                        <Clock size={12} className="ml-2 mr-1"/> {dateObj.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                    <div className="mt-2 text-sm text-gray-700 bg-purple-50 p-2 rounded border border-purple-100">
                                        <div className="font-bold text-purple-800 flex items-center"><User size={12} className="mr-1"/> Avaliador: {quote.evaluatorName}</div>
                                        {evaluator && <div className="text-xs text-gray-500 flex items-center mt-1"><MapPin size={10} className="mr-1"/> {evaluator.address} - {evaluator.unit}</div>}
                                    </div>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${statusColor}`}>
                                        {statusText}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500 mt-2 p-2 border border-gray-200 rounded inline-block bg-white">
                                    {quote.hairType} • {quote.length}cm • {quote.circumference}cm • {quote.condition} • {quote.color}
                                    {quote.weight && <span className="ml-2">• {quote.weight} {quote.weightUnit}</span>}
                                </div>
                                {quote.status !== 'quoted' && (
                                    <div className="mt-3 bg-green-50 p-3 rounded-lg text-xs border border-green-100 grid grid-cols-1 md:grid-cols-3 gap-2">
                                    <div><strong>Vendedor:</strong> {quote.sellerName}</div>
                                    <div><strong>CPF:</strong> {quote.sellerCpf}</div>
                                    <div><strong>Pix:</strong> {quote.sellerPix}</div>
                                    </div>
                                )}
                                {quote.approvalCode && (
                                    <div className="mt-3 bg-gray-100 p-3 rounded-lg text-xs border border-gray-200 flex items-center justify-between">
                                        <span className="font-bold text-gray-700">CÓDIGO: {quote.approvalCode}</span>
                                        <button 
                                            onClick={() => navigator.clipboard.writeText(quote.approvalCode || '')}
                                            className="ml-3 p-1 rounded-full hover:bg-gray-200 text-gray-600"
                                            title="Copiar código"
                                        >
                                            <Copy size={14}/>
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="text-right flex flex-col items-end min-w-[120px] w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0">
                                <div className="text-xs text-gray-400 font-bold uppercase mb-1">Valor Total</div>
                                <div className="font-black text-2xl text-gray-800 mb-3">R$ {quote.totalValue.toFixed(2)}</div>
                                
                                <div className="flex flex-col gap-2 items-end">
                                   {quote.photos && (
                                     <div className="flex gap-2 justify-end">
                                     {['front', 'side', 'back'].map((key) => {
                                         const imgUrl = quote.photos?.[key as keyof typeof quote.photos];
                                         if (!imgUrl) return null;
                                         return <img key={key} src={imgUrl} onClick={() => setViewingPhoto(imgUrl)} className="w-12 h-12 rounded-lg object-cover border border-gray-200 shadow-sm transition hover:scale-110 cursor-pointer bg-white" title="Clique para ampliar"/>;
                                     })}
                                     </div>
                                   )}
                                   
                                   {quote.status === 'purchased' && (
                                     <button 
                                         onClick={() => handleApproveQuote(quote.id)}
                                         className="mt-2 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg font-bold flex items-center hover:bg-green-700 transition"
                                     >
                                         <CheckCircle size={14} className="mr-1"/> Aprovar Compra
                                     </button>
                                   )}

                                   {quote.status === 'stock' && (
                                     <>
                                        <button 
                                            onClick={() => openEditQuote(quote)} // NEW: Edit button
                                            className="mt-2 text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg font-bold flex items-center hover:bg-purple-700 transition"
                                        >
                                            <Edit2 size={14} className="mr-1"/> Editar
                                        </button>
                                        <button 
                                            onClick={() => openConversionModal(quote)}
                                            className="mt-2 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold flex items-center hover:bg-blue-700 transition"
                                        >
                                            <PackagePlus size={14} className="mr-1"/> Gerar Produto
                                        </button>
                                     </>
                                   )}
                                   
                                   {quote.status === 'sold' && (
                                      <div className="mt-2 text-xs text-gray-600 font-bold flex items-center bg-gray-100 px-2 py-1 rounded border border-gray-200">
                                         <ShoppingBag size={14} className="mr-1"/> Venda Finalizada
                                      </div>
                                   )}
                                </div>
                            </div>
                        </div>
                    )})}
                    {hairQuotes.length === 0 && <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-100"><Filter size={48} className="mx-auto mb-3 opacity-20"/><p>Nenhum registro encontrado.</p></div>}
                </div>
            </div>
        </div>
      )}

      {/* FINANCE TAB (NEW) */}
      {activeTab === 'finance' && (
        <div className="animate-fade-in space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg text-gray-800 flex items-center">
                        <DollarSign size={20} className="mr-2 text-green-600"/> Fluxo de Caixa Exclusivo (Cabelos)
                    </h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Este fluxo é separado do salão</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* IN */}
                    <div className="bg-green-50 p-6 rounded-xl border border-green-100 relative overflow-hidden">
                        <div className="absolute right-0 top-0 p-4 opacity-10">
                            <ArrowUpRight size={100} className="text-green-600"/>
                        </div>
                        <p className="text-green-700 font-bold uppercase text-xs mb-1">Total de Vendas (Entradas)</p>
                        <h2 className="text-3xl font-black text-green-800">R$ {financialStats.income.toFixed(2)}</h2>
                        <p className="text-xs text-green-600 mt-2">Vendas de produtos gerados por compras de cabelo.</p>
                    </div>

                    {/* OUT */}
                    <div className="bg-red-50 p-6 rounded-xl border border-red-100 relative overflow-hidden">
                        <div className="absolute right-0 top-0 p-4 opacity-10">
                            <ArrowDownRight size={100} className="text-red-600"/>
                        </div>
                        <p className="text-red-700 font-bold uppercase text-xs mb-1">Total de Compras (Saídas)</p>
                        <h2 className="text-3xl font-black text-red-800">R$ {financialStats.expenses.toFixed(2)}</h2>
                        <p className="text-xs text-red-600 mt-2">Pagamentos realizados aos vendedores de cabelo.</p>
                    </div>

                    {/* BALANCE */}
                    <div className={`p-6 rounded-xl border relative overflow-hidden ${financialStats.balance >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'}`}>
                        <div className="absolute right-0 top-0 p-4 opacity-10">
                            <PieChart size={100} className={financialStats.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}/>
                        </div>
                        <p className={`${financialStats.balance >= 0 ? 'text-blue-700' : 'text-orange-700'} font-bold uppercase text-xs mb-1`}>Balanço Atual</p>
                        <h2 className={`text-3xl font-black ${financialStats.balance >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>R$ {financialStats.balance.toFixed(2)}</h2>
                        <p className={`${financialStats.balance >= 0 ? 'text-blue-600' : 'text-orange-600'} text-xs mt-2`}>Lucro/Prejuízo da operação de cabelos.</p>
                    </div>
                </div>
            </div>
            
            {/* NEW: PROFITABILITY BREAKDOWN */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                 <h4 className="font-bold text-gray-700 mb-4 flex items-center">
                    <BarChart3 size={20} className="mr-2 text-indigo-500"/> Detalhamento de Lucratividade por Peça
                 </h4>
                 
                 <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-sm">
                        <thead className="bg-indigo-50 text-indigo-900 font-bold uppercase text-xs">
                            <tr>
                                <th className="p-3 text-left">Data Venda</th>
                                <th className="p-3 text-left">Descrição</th>
                                <th className="p-3 text-right">Custo Compra</th>
                                <th className="p-3 text-right">Valor Venda</th>
                                <th className="p-3 text-right">Lucro</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {soldItemsProfit.length === 0 ? (
                                <tr><td colSpan={5} className="p-4 text-center text-gray-400">Nenhum cabelo vendido ainda.</td></tr>
                            ) : (
                                soldItemsProfit.map(item => (
                                    <tr key={item.quoteId} className="hover:bg-gray-50">
                                        <td className="p-3 text-gray-600">
                                            {item.date ? new Date(item.date).toLocaleDateString('pt-BR') : '-'}
                                        </td>
                                        <td className="p-3 font-medium text-gray-800">{item.description}</td>
                                        <td className="p-3 text-right text-red-600">R$ {item.buyPrice.toFixed(2)}</td>
                                        <td className="p-3 text-right text-green-600">R$ {item.sellPrice.toFixed(2)}</td>
                                        <td className={`p-3 text-right font-bold ${item.profit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                            R$ {item.profit.toFixed(2)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        {soldItemsProfit.length > 0 && (
                            <tfoot className="bg-gray-50 font-bold border-t border-gray-200">
                                <tr>
                                    <td colSpan={4} className="p-3 text-right uppercase text-gray-500 text-xs">Balanço Total (Itens Vendidos)</td>
                                    <td className={`p-3 text-right ${totalCalculatedProfit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                                        R$ {totalCalculatedProfit.toFixed(2)}
                                    </td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                 </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h4 className="font-bold text-gray-700 mb-4">Extrato de Saídas (Compras de Cabelo)</h4>
                <div className="space-y-2">
                    {expenses
                      .filter(e => e.businessUnit === 'hair_business')
                      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(exp => (
                        <div key={exp.id} className="flex justify-between items-center p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50">
                             <div>
                                <div className="font-bold text-gray-800">{exp.description}</div>
                                <div className="text-xs text-gray-400">{new Date(exp.date).toLocaleString('pt-BR')}</div>
                             </div>
                             <div className="text-red-600 font-bold">- R$ {exp.amount.toFixed(2)}</div>
                        </div>
                    ))}
                    {expenses.filter(e => e.businessUnit === 'hair_business').length === 0 && (
                        <p className="text-gray-400 text-sm italic">Nenhuma despesa registrada ainda.</p>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* EVALUATORS TAB */}
      {activeTab === 'evaluators' && (
        <div className="space-y-8 animate-fade-in bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            
            {/* GOALS & RANKING SECTION */}
            <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                    {/* Goal Editor */}
                    <div className="md:w-1/3">
                        <h4 className="font-bold text-indigo-900 mb-3 flex items-center">
                            <Trophy size={18} className="mr-2"/> Configurar Metas & Prêmios
                        </h4>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Meta Mensal (R$)</label>
                                <input 
                                    type="number" 
                                    className="w-full p-2 border rounded-lg"
                                    value={goalAmount}
                                    onChange={e => setGoalAmount(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Prêmio</label>
                                <input 
                                    type="text" 
                                    placeholder="Ex: Bônus R$ 500"
                                    className="w-full p-2 border rounded-lg"
                                    value={goalReward}
                                    onChange={e => setGoalReward(e.target.value)}
                                />
                            </div>
                            <button 
                                onClick={handleSaveGoal}
                                className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition"
                            >
                                Salvar Meta
                            </button>
                        </div>
                    </div>

                    {/* Leaderboard */}
                    <div className="md:w-2/3 border-l border-purple-200 pl-0 md:pl-6 pt-6 md:pt-0">
                        <h4 className="font-bold text-indigo-900 mb-3 flex items-center">
                            <Medal size={18} className="mr-2"/> Ranking Mensal de Avaliadores (Meta de Compras)
                        </h4>
                        <div className="bg-white rounded-lg border border-purple-100 overflow-hidden">
                            <div className="grid grid-cols-12 bg-purple-100 p-2 text-xs font-bold text-purple-800 uppercase items-center">
                                <div className="col-span-1 text-center">Pos</div>
                                <div className="col-span-6">Avaliador</div>
                                <div className="col-span-5 text-right pr-2">Progresso (Compra / Meta)</div>
                            </div>
                            {evaluatorRanking.length === 0 ? (
                                <p className="text-center text-gray-400 py-4 text-xs">Nenhuma compra este mês.</p>
                            ) : (
                                evaluatorRanking.map((user, idx) => (
                                    <div key={user.id} className="grid grid-cols-12 p-3 border-b last:border-0 border-gray-50 items-center text-sm hover:bg-purple-50">
                                        <div className="col-span-1 flex justify-center relative">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${idx === 0 ? 'bg-yellow-400 text-white' : idx === 1 ? 'bg-gray-400 text-white' : idx === 2 ? 'bg-orange-400 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                                {idx + 1}
                                            </div>
                                            {user.progress >= 100 && (
                                                <Trophy size={14} className="absolute -top-2 -right-1 text-yellow-500 fill-yellow-500 animate-bounce-small" />
                                            )}
                                        </div>
                                        <div className="col-span-6 font-medium text-gray-800 truncate pr-2">{user.fullName}</div>
                                        <div className="col-span-5 text-right pr-4">
                                            <div className="text-xs font-bold text-indigo-700">
                                                R$ {user.monthlyTotal.toFixed(2)} <span className="text-gray-400 font-normal">/ {hairConfig.monthlyGoal?.toFixed(2)}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                                <div 
                                                    className={`h-1.5 rounded-full transition-all duration-1000 ${user.progress >= 100 ? 'bg-green-500' : 'bg-indigo-500'}`} 
                                                    style={{ width: `${user.progress}%` }}
                                                ></div>
                                            </div>
                                            <div className={`text-[10px] font-bold text-right mt-0.5 ${user.progress >= 100 ? 'text-green-600' : 'text-gray-500'}`}>
                                                {user.progress.toFixed(0)}%
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div>
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-gray-700 flex items-center"><Users size={20} className="mr-2 text-purple-600"/> Cadastro de Avaliadores</h4>
                {editingEvaluator && (
                    <button onClick={cancelEditing} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full flex items-center hover:bg-gray-200">
                    <X size={12} className="mr-1"/> Cancelar Edição
                    </button>
                )}
            </div>

            <form onSubmit={handleSaveEvaluator} className={`space-y-4 bg-gray-50 p-6 rounded-xl border mb-6 transition-colors ${editingEvaluator ? 'border-purple-300 ring-2 ring-purple-100' : 'border-gray-200'}`}>
                {editingEvaluator && <div className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-2 flex items-center"><Edit2 size={12} className="mr-1"/> Editando: {editingEvaluator.fullName}</div>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input required placeholder="Nome Completo" className="w-full p-2 border rounded" value={evalName} onChange={e => setEvalName(e.target.value)} />
                    <input required placeholder="CPF" className="w-full p-2 border rounded" value={evalCpf} onChange={e => setEvalCpf(e.target.value)} />
                    <input required placeholder="Endereço" className="w-full p-2 border rounded" value={evalAddr} onChange={e => setEvalAddr(e.target.value)} />
                    <input required placeholder="Unidade (Ex: Centro)" className="w-full p-2 border rounded" value={evalUnit} onChange={e => setEvalUnit(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                    <input required placeholder="Nome de Usuário (Login)" className="w-full p-2 border rounded bg-white" value={evalUser} onChange={e => setEvalUser(e.target.value)} />
                    <input required placeholder="Senha de Acesso" className="w-full p-2 border rounded bg-white" type={editingEvaluator ? 'text' : 'password'} value={evalPass} onChange={e => setEvalPass(e.target.value)} />
                </div>
                <button className="w-full bg-purple-600 text-white py-2 rounded font-bold hover:bg-purple-700 flex justify-center items-center">
                    {editingEvaluator ? <><Save size={18} className="mr-2"/> Salvar Alterações</> : 'Criar Usuário'}
                </button>
            </form>

            <div>
                <h4 className="font-bold text-gray-700 mb-3 text-sm uppercase">Lista de Avaliadores</h4>
                <div className="space-y-2">
                    {socialUsers.map(user => (
                        <div key={user.id} className="flex justify-between items-center bg-white p-3 border rounded shadow-sm hover:shadow-md transition">
                        <div>
                            <div className="font-bold text-gray-800">{user.fullName}</div>
                            <div className="text-xs text-gray-500">{user.unit} | CPF: {user.cpf}</div>
                            <div className="text-xs text-purple-500 font-mono">User: {user.username}</div>
                            {user.customConfig && <div className="text-[10px] text-blue-600 mt-1 font-bold">Possui regras personalizadas</div>}
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => startEditingEvaluator(user)} className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded" title="Editar"><Edit2 size={16}/></button>
                            <button onClick={() => { if(confirm('Tem certeza?')) removeSocialUser(user.id); }} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded" title="Excluir"><Trash2 size={16}/></button>
                        </div>
                        </div>
                    ))}
                    {socialUsers.length === 0 && <p className="text-gray-400 text-sm">Nenhum avaliador cadastrado.</p>}
                </div>
            </div>
            </div>
        </div>
      )}

      {/* RULES TAB (FULL EDITOR) */}
      {activeTab === 'rules' && (
        <div className="animate-fade-in space-y-6">
           <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center">
                <Settings className="text-orange-600 mr-3 shrink-0" size={24}/>
                <div>
                    <h4 className="font-bold text-orange-800">Editor Completo de Regras e Preços</h4>
                    <p className="text-sm text-orange-700">Edite preços, ative ou desative opções. O que for desativado sumirá da calculadora.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                   {hasChanges && (
                    <button 
                        onClick={saveConfiguration}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-orange-700 transition flex items-center animate-pulse"
                    >
                        <Save size={18} className="mr-2"/> Salvar
                    </button>
                    )}
              </div>
           </div>

           {/* CONFIG SELECTOR */}
           <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
              <div className="flex-1">
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Configurar Para:</label>
                 <select 
                    className="w-full p-2 border rounded-lg bg-gray-50 font-bold text-gray-800"
                    value={selectedRuleContext}
                    onChange={(e) => setSelectedRuleContext(e.target.value)}
                 >
                    <option value="global">Padrão Global (Todos)</option>
                    {socialUsers.map(u => (
                        <option key={u.id} value={u.id}>{u.fullName} ({u.unit})</option>
                    ))}
                 </select>
              </div>
              <div className="text-xs text-gray-500 max-w-xs leading-tight">
                Selecione um avaliador específico para criar regras personalizadas para ele. Caso contrário, edite o Padrão Global.
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* 1. Texture */}
               {renderConfigSection('Tipos de Cabelo (Textura)', 'textures', localConfig.textures)}

               {/* 2. Color */}
               {renderConfigSection('Cores Disponíveis', 'colors', localConfig.colors)}
               
               {/* 3. Condition */}
               {renderConfigSection('Condição / Química', 'conditions', localConfig.conditions)}

               {/* 6. Quality */}
               {renderConfigSection('Qualidade do Fio', 'qualities', localConfig.qualities)}
           </div>

           {/* 4. Sizes */}
           {renderConfigSection('Tamanhos (Comprimento)', 'lengths', localConfig.lengths)}
           
           {/* 5. Thickness */}
           {renderConfigSection('Espessura (Circunferência)', 'circumferences', localConfig.circumferences)}

           {/* Global Limits */}
           <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <h4 className="font-bold text-gray-800 mb-4">Limites Globais</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-600 mb-1">Valor Máximo de Compra (R$)</label>
                        <input 
                            type="number" 
                            className="w-full p-2 border rounded"
                            value={localConfig.maxPriceLimit}
                            onChange={(e) => handleConfigChange('maxPriceLimit', null, 'maxPriceLimit', parseFloat(e.target.value))}
                        />
                        <p className="text-xs text-gray-400 mt-1">Use 0 para sem limite.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-600 mb-1">Mensagem de Bloqueio</label>
                        <input 
                            type="text" 
                            className="w-full p-2 border rounded"
                            value={localConfig.blockPurchaseMessage}
                            onChange={(e) => handleConfigChange('blockPurchaseMessage', null, 'blockPurchaseMessage', e.target.value)}
                        />
                    </div>
                </div>
           </div>
        </div>
      )}

      {/* FULL SCREEN IMAGE MODAL */}
      {viewingPhoto && (
        <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
           <div className="absolute top-4 right-4 flex gap-4">
              <a href={viewingPhoto} download={`cabelo-${Date.now()}.jpg`} className="bg-white/10 text-white p-3 rounded-full hover:bg-white/20 hover:scale-110 transition backdrop-blur-md flex items-center justify-center" title="Baixar Imagem">
                 <Download size={24} />
              </a>
              <button onClick={() => setViewingPhoto(null)} className="bg-white/10 text-white p-3 rounded-full hover:bg-red-500/50 hover:scale-110 transition backdrop-blur-md flex items-center justify-center" title="Fechar">
                 <X size={24} />
              </button>
           </div>
           <img src={viewingPhoto} alt="Visualização Grande" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()}/>
           <p className="text-white/50 text-sm mt-4">Clique no botão acima para baixar.</p>
        </div>
      )}

      {/* PRODUCT CONVERSION MODAL */}
      {quoteToConvert && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in flex flex-col max-h-[90vh]">
                <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center">
                    <PackagePlus className="mr-2 text-blue-600"/> Gerar Produto no Estoque
                </h3>
                <div className="overflow-y-auto pr-2">
                    <p className="text-sm text-gray-600 mb-4">
                        Você está criando um produto a partir do cabelo comprado de <strong>{quoteToConvert.sellerName}</strong>.
                    </p>
                    <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800 mb-4 border border-blue-100">
                        <strong>Nome Gerado:</strong> {(quoteToConvert.sellerName || 'Vendedor').split(' ')[0]} {(quoteToConvert.sellerCpf || '000').replace(/\D/g, '').substring(0,3)}### {quoteToConvert.sellerState} {quoteToConvert.sellerAgeGroup}
                    </div>
                    
                    <div className="space-y-4 mb-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Preço de Venda (R$)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-gray-400 font-bold">R$</span>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    autoFocus
                                    className="w-full pl-10 p-3 border rounded-lg font-bold text-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="0.00"
                                    value={newProductPrice}
                                    onChange={e => setNewProductPrice(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unidade</label>
                                <select 
                                    className="w-full p-3 border rounded-lg bg-white"
                                    value={newProductUnit}
                                    onChange={e => setNewProductUnit(e.target.value as UnitType)}
                                >
                                    <option value="un">Unidade (un)</option>
                                    <option value="kg">Quilo (kg)</option>
                                    <option value="g">Grama (g)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Estoque/Peso Inicial</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    className="w-full p-3 border rounded-lg"
                                    value={newProductStock}
                                    onChange={e => setNewProductStock(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => setNewProductIsOnline(!newProductIsOnline)}>
                            <div className={`w-5 h-5 rounded border mr-3 flex items-center justify-center ${newProductIsOnline ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'}`}>
                                {newProductIsOnline && <CheckSquare size={14} />}
                            </div>
                            <div>
                                <div className="font-bold text-gray-700 text-sm flex items-center">
                                    <Globe size={14} className="mr-1 text-blue-500"/> Disponível Online
                                </div>
                                <div className="text-xs text-gray-500">Exibir no catálogo para clientes?</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-auto">
                    <button 
                        onClick={() => { setQuoteToConvert(null); setNewProductPrice(''); }}
                        className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-lg hover:bg-gray-200"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleConvertQuoteToProduct}
                        className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md flex items-center justify-center"
                    >
                        <Save size={18} className="mr-2"/> Criar Produto
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* EDIT HAIR QUOTE MODAL */}
      {showEditQuoteModal && editingQuoteData && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-fade-in flex flex-col max-h-[90vh]">
                <div className="bg-purple-600 p-4 -mx-6 -mt-6 mb-4 flex justify-between items-center text-white">
                    <h3 className="font-bold text-lg flex items-center"><Edit2 className="mr-2"/> Editar Cotação de Cabelo</h3>
                    <button onClick={() => setShowEditQuoteModal(false)} className="hover:bg-purple-500 rounded-full p-1"><X size={24}/></button>
                </div>
                
                <form onSubmit={handleSaveEditedQuote} className="flex-1 overflow-y-auto pr-2 space-y-4">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm text-gray-700">
                        <div className="font-bold">Avaliador: {editingQuoteData.evaluatorName}</div>
                        <div className="text-xs text-gray-500">Data: {new Date(editingQuoteData.date).toLocaleDateString()}</div>
                    </div>

                    {/* Hair Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo de Cabelo</label>
                            <select 
                                required
                                className="w-full p-3 border rounded-lg bg-white"
                                value={editingQuoteData.hairType}
                                onChange={e => handleEditQuoteChange('hairType', e.target.value)}
                            >
                                {hairConfig.textures.filter(t => t.enabled).map(t => <option key={t.id} value={t.value}>{t.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cor</label>
                            <select 
                                required
                                className="w-full p-3 border rounded-lg bg-white"
                                value={editingQuoteData.color}
                                onChange={e => handleEditQuoteChange('color', e.target.value)}
                            >
                                {hairConfig.colors.filter(c => c.enabled).map(c => <option key={c.id} value={c.value}>{c.label}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Condição / Química</label>
                            <select 
                                required
                                className="w-full p-3 border rounded-lg bg-white"
                                value={editingQuoteData.condition}
                                onChange={e => handleEditQuoteChange('condition', e.target.value)}
                            >
                                {hairConfig.conditions.filter(c => c.enabled).map(c => <option key={c.id} value={c.value}>{c.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Qualidade</label>
                            <select 
                                required
                                className="w-full p-3 border rounded-lg bg-white"
                                value={editingQuoteData.quality}
                                onChange={e => handleEditQuoteChange('quality', e.target.value)}
                            >
                                {hairConfig.qualities.filter(q => q.enabled).map(q => <option key={q.id} value={q.value}>{q.label}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Comprimento (cm)</label>
                            <input 
                                required 
                                type="number" 
                                step="1"
                                className="w-full p-3 border rounded-lg"
                                value={editingQuoteData.length}
                                onChange={e => handleEditQuoteChange('length', parseInt(e.target.value))}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Espessura (cm)</label>
                            <input 
                                required 
                                type="number" 
                                step="1"
                                className="w-full p-3 border rounded-lg"
                                value={editingQuoteData.circumference}
                                onChange={e => handleEditQuoteChange('circumference', parseInt(e.target.value))}
                            />
                        </div>
                    </div>

                    {/* Gramagem */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Gramagem (Peso)</label>
                            <input 
                                type="number" 
                                step="0.01"
                                className="w-full p-3 border rounded-lg"
                                value={editingQuoteData.weight || ''}
                                onChange={e => handleEditQuoteChange('weight', parseFloat(e.target.value))}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unidade de Peso</label>
                            <select 
                                className="w-full p-3 border rounded-lg bg-white"
                                value={editingQuoteData.weightUnit || 'g'}
                                onChange={e => handleEditQuoteChange('weightUnit', e.target.value as UnitType)}
                            >
                                <option value="g">Gramas (g)</option>
                                <option value="kg">Quilo (kg)</option>
                                <option value="un">Unidade (un)</option>
                            </select>
                        </div>
                    </div>

                    {/* Total Value */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Valor Total (R$)</label>
                        <input 
                            required 
                            type="number" 
                            step="0.01"
                            className="w-full p-3 border rounded-lg font-bold text-lg"
                            value={editingQuoteData.totalValue}
                            onChange={e => handleEditQuoteChange('totalValue', parseFloat(e.target.value))}
                        />
                    </div>

                    {/* Photos */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Fotos do Cabelo</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['front', 'side', 'back'].map((key) => {
                                const imgUrl = editingQuoteData.photos?.[key as keyof typeof editingQuoteData.photos];
                                const ref = key === 'front' ? editFrontRef : key === 'side' ? editSideRef : editBackRef;
                                return (
                                    <div key={key} onClick={() => ref.current?.click()} className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 overflow-hidden relative">
                                        {imgUrl ? <img src={imgUrl} className="w-full h-full object-cover"/> : <Camera className="text-gray-400"/>}
                                        <span className="text-[10px] font-bold text-gray-500 absolute bottom-1 bg-white/80 px-1 rounded">{key.toUpperCase()}</span>
                                        <input type="file" ref={ref} className="hidden" accept="image/*" onChange={e => handleEditPhotoUpload(e, key as 'front' | 'side' | 'back')} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {editQuoteError && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold flex items-center">
                            <AlertTriangle size={18} className="mr-2"/> {editQuoteError}
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => setShowEditQuoteModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-lg hover:bg-gray-200">Cancelar</button>
                        <button type="submit" className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 shadow-md flex items-center justify-center">
                            <Save size={18} className="mr-2"/> Salvar Alterações
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};