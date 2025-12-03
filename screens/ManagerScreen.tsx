import React, { useState, useRef } from 'react';
import { useData } from '../context/DataContext';
import { ShieldCheck, TrendingUp, DollarSign, History, ArrowUpRight, ArrowDownRight, Camera, Key, Trash2, Edit2, X, Save, Scissors, Users, User, Package, Globe, ShoppingBag, Clock, CheckSquare, Square, GraduationCap, FileText, CheckCircle, Video, Plus, Play, UserPlus, BookOpen, BarChart3, Lock, ChevronDown, ChevronRight, Link as LinkIcon, UserCheck, Gift, Award } from 'lucide-react';
import { AdminUser, Service, Staff, Client, Product, UnitType, Course, Order, Student, CourseModule, CourseLesson, LoyaltyReward } from '../types';

export const ManagerScreen: React.FC = () => {
  const { 
    services, addService, updateService, removeService,
    products, addProduct, updateProduct, removeProduct,
    courses, addCourse, updateCourse, removeCourse,
    students, addStudent, updateStudent, removeStudent,
    staff, addStaff, updateStaff, removeStaff,
    clients, addClient, updateClient, removeClient,
    sales, expenses, registerSessions, 
    adminUsers, addAdminUser, removeAdminUser,
    loyaltyRewards, addLoyaltyReward, removeLoyaltyReward,
    orders
  } = useData();
  
  const [activeTab, setActiveTab] = useState<'financial' | 'services' | 'products' | 'staff' | 'clients' | 'access' | 'loyalty'>('financial');

  // --- FORM STATES ---

  // Services
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [srvName, setSrvName] = useState('');
  const [srvPrice, setSrvPrice] = useState('');

  // Products
  const [productFilter, setProductFilter] = useState<'store' | 'hair'>('store');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodCat, setProdCat] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodUnit, setProdUnit] = useState<UnitType>('un');
  const [prodOrigin, setProdOrigin] = useState<'store' | 'hair_business'>('store');
  const [prodIsOnline, setProdIsOnline] = useState(false);
  
  // Product Images (Front, Side, Back)
  const [prodImageFront, setProdImageFront] = useState<string>('');
  const [prodImageSide, setProdImageSide] = useState<string>('');
  const [prodImageBack, setProdImageBack] = useState<string>('');
  
  const prodFrontRef = useRef<HTMLInputElement>(null);
  const prodSideRef = useRef<HTMLInputElement>(null);
  const prodBackRef = useRef<HTMLInputElement>(null);

  // Staff
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [stfName, setStfName] = useState('');
  const [stfRole, setStfRole] = useState('');
  const [stfComm, setStfComm] = useState('');

  // Clients
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [cliName, setCliName] = useState('');
  const [cliPhone, setCliPhone] = useState('');
  const [cliBirthday, setCliBirthday] = useState('');
  const [cliEmail, setCliEmail] = useState('');
  const [cliPass, setCliPass] = useState('');

  // Loyalty Rewards
  const [rewTitle, setRewTitle] = useState('');
  const [rewDesc, setRewDesc] = useState('');
  const [rewPoints, setRewPoints] = useState('');
  const [rewStock, setRewStock] = useState(''); 
  const [rewLimit, setRewLimit] = useState(''); // NEW

  // Access (Admin)
  const [admName, setAdmName] = useState('');
  const [admEmail, setAdmEmail] = useState('');
  const [admPass, setAdmPass] = useState('');
  const [admPermissions, setAdmPermissions] = useState<string[]>(['cashier', 'orders', 'sales']);

  // --- Financial Stats Calculation ---
  const now = new Date();
  const parseDate = (dateStr: string) => new Date(dateStr);
  const isToday = (d: Date) => d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  const isWeek = (d: Date) => {
    const start = new Date(now); start.setDate(now.getDate() - now.getDay()); start.setHours(0,0,0,0);
    return d >= start;
  };
  const isMonth = (d: Date) => d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  const isYear = (d: Date) => d.getFullYear() === now.getFullYear();

  let totals = { day: 0, week: 0, month: 0, year: 0 };
  let totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

  sales.forEach(sale => {
    const d = parseDate(sale.date);
    const t = sale.total;
    if (isToday(d)) totals.day += t;
    if (isWeek(d)) totals.week += t;
    if (isMonth(d)) totals.month += t;
    if (isYear(d)) totals.year += t;
  });

  const profit = totals.year - totalExpenses;
  
  // General Sales History List
  const allSoldItems = sales.flatMap(sale => 
    sale.items.map(item => ({
        ...item,
        saleDate: sale.date,
        clientName: sale.clientName,
        staffName: item.staffName,
        recordedBy: sale.createdByName || 'Sistema' // Added recorder info
    }))
  ).sort((a,b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());

  // --- HANDLERS ---
  
  // Services
  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      updateService({ ...editingService, name: srvName, price: parseFloat(srvPrice) });
      setEditingService(null);
      alert('Serviço atualizado!');
    } else {
      addService({ id: `s-${Date.now()}`, name: srvName, price: parseFloat(srvPrice) });
      alert('Serviço adicionado!');
    }
    setSrvName(''); setSrvPrice('');
  };
  const startEditService = (s: Service) => { setEditingService(s); setSrvName(s.name); setSrvPrice(s.price.toString()); };
  const cancelEditService = () => { setEditingService(null); setSrvName(''); setSrvPrice(''); };

  // Products
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (s: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const imagesList = [prodImageFront, prodImageSide, prodImageBack].filter(Boolean);
    const mainImage = imagesList[0] || 'https://picsum.photos/200/200';
    const productData = { name: prodName, category: prodCat, price: parseFloat(prodPrice), stock: parseFloat(prodStock), unit: prodUnit, origin: prodOrigin, isOnline: prodIsOnline, imageUrl: mainImage, images: imagesList };
    if (editingProduct) { updateProduct({ ...editingProduct, ...productData }); setEditingProduct(null); alert('Produto atualizado!'); } 
    else { addProduct({ id: `p-${Date.now()}`, ...productData }); alert('Produto adicionado!'); }
    setProdName(''); setProdCat(''); setProdPrice(''); setProdStock(''); setProdImageFront(''); setProdImageSide(''); setProdImageBack('');
  };
  const startEditProduct = (p: Product) => {
      setEditingProduct(p); setProdName(p.name); setProdCat(p.category); setProdPrice(p.price.toString()); setProdStock(p.stock.toString()); setProdUnit(p.unit); setProdOrigin(p.origin || 'store'); setProdIsOnline(!!p.isOnline);
      if (p.images && p.images.length > 0) { setProdImageFront(p.images[0] || ''); setProdImageSide(p.images[1] || ''); setProdImageBack(p.images[2] || ''); } 
      else { setProdImageFront(p.imageUrl || ''); setProdImageSide(''); setProdImageBack(''); }
  };
  const cancelEditProduct = () => { setEditingProduct(null); setProdName(''); setProdCat(''); setProdPrice(''); setProdStock(''); setProdImageFront(''); setProdImageSide(''); setProdImageBack(''); };

  // Staff
  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStaff) { updateStaff({ ...editingStaff, name: stfName, role: stfRole, commissionRate: parseFloat(stfComm) }); setEditingStaff(null); alert('Colaborador atualizado!'); }
    else { addStaff({ id: `st-${Date.now()}`, name: stfName, role: stfRole, commissionRate: parseFloat(stfComm) }); alert('Colaborador adicionado!'); }
    setStfName(''); setStfRole(''); setStfComm('');
  };
  const startEditStaff = (s: Staff) => { setEditingStaff(s); setStfName(s.name); setStfRole(s.role); setStfComm(s.commissionRate.toString()); };
  const cancelEditStaff = () => { setEditingStaff(null); setStfName(''); setStfRole(''); setStfComm(''); };

  // Clients
  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) { updateClient({ ...editingClient, name: cliName, phone: cliPhone, birthday: cliBirthday, email: cliEmail, password: cliPass }); setEditingClient(null); alert('Cliente atualizado!'); }
    else { addClient({ id: `c-${Date.now()}`, name: cliName, phone: cliPhone, birthday: cliBirthday, email: cliEmail, password: cliPass, history: [] }); alert('Cliente adicionado!'); }
    setCliName(''); setCliPhone(''); setCliBirthday(''); setCliEmail(''); setCliPass('');
  };
  const startEditClient = (c: Client) => { setEditingClient(c); setCliName(c.name); setCliPhone(c.phone); setCliBirthday(c.birthday || ''); setCliEmail(c.email || ''); setCliPass(c.password || ''); };
  const cancelEditClient = () => { setEditingClient(null); setCliName(''); setCliPhone(''); setCliBirthday(''); setCliEmail(''); setCliPass(''); };
  
  // Loyalty
  const handleSaveReward = (e: React.FormEvent) => {
    e.preventDefault();
    const newReward: LoyaltyReward = {
        id: `rew-${Date.now()}`,
        title: rewTitle,
        description: rewDesc,
        pointsCost: parseInt(rewPoints),
        stock: rewStock ? parseInt(rewStock) : undefined,
        limitPerClient: rewLimit ? parseInt(rewLimit) : undefined // Save limit
    };
    addLoyaltyReward(newReward);
    setRewTitle(''); setRewDesc(''); setRewPoints(''); setRewStock(''); setRewLimit('');
    alert('Prêmio adicionado!');
  };

  // Admin / Access
  const handleAddAdmin = (e: React.FormEvent) => { e.preventDefault(); const newAdmin: AdminUser = { id: `adm-${Date.now()}`, name: admName, email: admEmail, password: admPass, role: 'manager', permissions: admPermissions }; addAdminUser(newAdmin); setAdmName(''); setAdmEmail(''); setAdmPass(''); setAdmPermissions(['cashier', 'orders', 'sales']); alert('Sub-Gerente adicionado com sucesso!'); };
  const togglePermission = (id: string) => { setAdmPermissions(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]); };

  return (
    <div className="p-4 pb-20">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <ShieldCheck className="mr-2" /> Gerenciamento
      </h2>

      <div className="flex mb-6 bg-gray-100 p-1 rounded-lg overflow-x-auto">
        {(['financial', 'services', 'products', 'staff', 'clients', 'loyalty', 'access'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 min-w-[80px] py-2 rounded-md text-sm font-medium capitalize transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab === 'financial' ? 'Financeiro' : tab === 'staff' ? 'Equipe' : tab === 'services' ? 'Serviços' : tab === 'products' ? 'Estoque' : tab === 'access' ? 'Acessos' : tab === 'loyalty' ? 'Fidelidade' : 'Clientes'}
          </button>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        
        {/* --- FINANCIAL REPORT TAB --- */}
        {activeTab === 'financial' && (
           <div className="animate-fade-in">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><TrendingUp size={20} className="mr-2"/> Resumo Anual</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                   <div className="text-xs text-blue-500 font-bold uppercase mb-1">Entradas (Ano)</div>
                   <div className="text-xl font-black text-gray-800">R$ {totals.year.toFixed(2)}</div>
                </div>
                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                   <div className="text-xs text-red-500 font-bold uppercase mb-1">Despesas (Ano)</div>
                   <div className="text-xl font-black text-gray-800">R$ {totalExpenses.toFixed(2)}</div>
                </div>
                <div className={`p-4 rounded-xl border ${profit >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                   <div className={`text-xs font-bold uppercase mb-1 ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>Lucro Líquido</div>
                   <div className="text-xl font-black text-gray-800">R$ {profit.toFixed(2)}</div>
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><History size={20} className="mr-2"/> Histórico Geral de Itens Vendidos</h3>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-sm text-left">
                      <thead className="bg-gray-100 text-gray-600 font-bold uppercase text-xs">
                          <tr>
                              <th className="p-3">Data/Hora</th>
                              <th className="p-3">Item</th>
                              <th className="p-3">Tipo</th>
                              <th className="p-3">Cliente</th>
                              <th className="p-3">Profissional</th>
                              <th className="p-3">Registrado Por</th>
                              <th className="p-3 text-right">Valor</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                          {allSoldItems.map((item, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                  <td className="p-3 text-gray-500 whitespace-nowrap">
                                      {new Date(item.saleDate).toLocaleDateString()} <span className="text-xs">{new Date(item.saleDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                  </td>
                                  <td className="p-3 font-medium text-gray-800">{item.name} {item.type === 'product' && <span className="text-gray-400 text-xs">({item.quantity} {item.unit})</span>}</td>
                                  <td className="p-3">
                                      {item.type === 'service' ? <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">Serviço</span> :
                                       item.type === 'product' ? <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs font-bold">Produto</span> :
                                       <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs font-bold">Curso</span>}
                                  </td>
                                  <td className="p-3 text-gray-600">{item.clientName}</td>
                                  <td className="p-3 text-gray-600">{item.staffName}</td>
                                  <td className="p-3 text-gray-500 text-xs flex items-center">
                                      {item.recordedBy && <><UserCheck size={12} className="mr-1 text-purple-500"/> {item.recordedBy}</>}
                                  </td>
                                  <td className="p-3 text-right font-bold text-green-600">R$ {(item.price * item.quantity).toFixed(2)}</td>
                              </tr>
                          ))}
                          {allSoldItems.length === 0 && <tr><td colSpan={7} className="p-4 text-center text-gray-400">Nenhum registro encontrado.</td></tr>}
                      </tbody>
                  </table>
              </div>
           </div>
        )}

        {/* --- SERVICES TAB --- */}
        {activeTab === 'services' && (
           <div className="animate-fade-in">
              <h3 className="font-bold text-gray-700 mb-4">{editingService ? 'Editar Serviço' : 'Adicionar Novo Serviço'}</h3>
              <form onSubmit={handleSaveService} className="flex flex-col md:flex-row gap-4 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-200">
                 <input 
                   required 
                   placeholder="Nome do Serviço" 
                   className="flex-1 p-2 border rounded" 
                   value={srvName} 
                   onChange={e => setSrvName(e.target.value)} 
                 />
                 <div className="relative w-full md:w-40">
                    <span className="absolute left-3 top-2 text-gray-400">R$</span>
                    <input 
                      required 
                      type="number" 
                      placeholder="Preço" 
                      className="w-full p-2 pl-8 border rounded" 
                      value={srvPrice} 
                      onChange={e => setSrvPrice(e.target.value)} 
                    />
                 </div>
                 <div className="flex gap-2">
                    {editingService && <button type="button" onClick={cancelEditService} className="bg-gray-200 text-gray-700 px-4 py-2 rounded font-bold">Cancelar</button>}
                    <button className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 shadow-sm flex items-center justify-center">
                        <Save size={18} className="mr-2"/> Salvar
                    </button>
                 </div>
              </form>
              
              <div className="space-y-2">
                 {services.map(s => (
                    <div key={s.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                       <span className="font-medium">{s.name}</span>
                       <div className="flex items-center gap-4">
                          <span className="font-bold text-blue-600">R$ {s.price.toFixed(2)}</span>
                          <div className="flex gap-2">
                             <button onClick={() => startEditService(s)} className="text-gray-400 hover:text-blue-600"><Edit2 size={18}/></button>
                             <button onClick={() => { if(confirm('Excluir?')) removeService(s.id); }} className="text-gray-400 hover:text-red-600"><Trash2 size={18}/></button>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {/* --- PRODUCTS TAB --- */}
        {activeTab === 'products' && (
           <div className="animate-fade-in">
              <div className="flex mb-4 border-b overflow-x-auto">
                 <button onClick={() => { setProductFilter('store'); setProdOrigin('store'); }} className={`px-4 py-2 text-sm font-bold whitespace-nowrap ${productFilter === 'store' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-gray-400'}`}>Produtos Loja</button>
                 <button onClick={() => { setProductFilter('hair'); setProdOrigin('hair_business'); }} className={`px-4 py-2 text-sm font-bold whitespace-nowrap ${productFilter === 'hair' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-400'}`}>Gestão Cabelos</button>
              </div>

              {/* PRODUCTS / HAIR FORM & LIST */}
              <h3 className="font-bold text-gray-700 mb-4">{editingProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}</h3>
              <form onSubmit={handleSaveProduct} className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-8 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input required placeholder="Nome do Produto" className="w-full p-2 border rounded" value={prodName} onChange={e => setProdName(e.target.value)} />
                    <input required placeholder="Categoria / Descrição" className="w-full p-2 border rounded" value={prodCat} onChange={e => setProdCat(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-400">R$</span>
                        <input required type="number" step="0.01" placeholder="Preço" className="w-full p-2 pl-8 border rounded" value={prodPrice} onChange={e => setProdPrice(e.target.value)} />
                    </div>
                    <input required type="number" step="0.01" placeholder="Estoque" className="w-full p-2 border rounded" value={prodStock} onChange={e => setProdStock(e.target.value)} />
                    <select className="w-full p-2 border rounded bg-white" value={prodUnit} onChange={e => setProdUnit(e.target.value as UnitType)}>
                        <option value="un">Unidade (un)</option>
                        <option value="kg">Quilo (kg)</option>
                        <option value="g">Grama (g)</option>
                    </select>
                    <div className="flex items-center p-2 border rounded bg-white">
                        <input type="checkbox" checked={prodIsOnline} onChange={e => setProdIsOnline(e.target.checked)} className="mr-2"/>
                        <span className="text-sm text-gray-600">Disponível Online</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Imagens do Produto</label>
                    {prodOrigin === 'store' ? (
                        <div 
                          onClick={() => prodFrontRef.current?.click()}
                          className="border-2 border-dashed border-gray-300 rounded-lg h-32 w-full md:w-48 flex flex-col items-center justify-center cursor-pointer hover:bg-white bg-white/50 relative overflow-hidden"
                        >
                          {prodImageFront ? <img src={prodImageFront} className="h-full w-full object-contain"/> : <><Camera className="text-gray-400 mb-1"/><span className="text-xs text-gray-500">Foto Principal</span></>}
                          <input type="file" ref={prodFrontRef} className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, setProdImageFront)} />
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-4">
                            {['Front', 'Side', 'Back'].map((side, idx) => {
                                const ref = idx === 0 ? prodFrontRef : idx === 1 ? prodSideRef : prodBackRef;
                                const val = idx === 0 ? prodImageFront : idx === 1 ? prodImageSide : prodImageBack;
                                const setter = idx === 0 ? setProdImageFront : idx === 1 ? setProdImageSide : setProdImageBack;
                                const label = idx === 0 ? 'Frente' : idx === 1 ? 'Lado' : 'Costa';
                                return (
                                  <div key={side} onClick={() => ref.current?.click()} className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-white bg-white/50 relative overflow-hidden">
                                      {val ? <img src={val} className="h-full w-full object-cover"/> : <Camera className="text-gray-400 mb-1"/>}
                                      <span className="text-[10px] font-bold text-gray-500 absolute bottom-1 bg-white/80 px-1 rounded">{label}</span>
                                      <input type="file" ref={ref} className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, setter)} />
                                  </div>
                                )
                            })}
                        </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    {editingProduct && <button type="button" onClick={cancelEditProduct} className="bg-gray-200 text-gray-700 px-4 py-2 rounded font-bold">Cancelar</button>}
                    <button className="bg-amber-600 text-white px-6 py-2 rounded font-bold hover:bg-amber-700 shadow-sm flex items-center justify-center">
                        <Save size={18} className="mr-2"/> Salvar
                    </button>
                  </div>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {products
                    .filter(p => (productFilter === 'store' ? (!p.origin || p.origin === 'store') : p.origin === 'hair_business'))
                    .map(p => (
                    <div key={p.id} className="flex p-3 border rounded-lg bg-white shadow-sm hover:shadow-md transition">
                        <img src={p.imageUrl} className="w-16 h-16 rounded object-cover bg-gray-100 mr-3"/>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                              <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{p.name}</h4>
                              {p.isOnline && <Globe size={12} className="text-blue-500"/>}
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-1">{p.category}</p>
                          <div className="flex justify-between items-end mt-2">
                              <span className="font-bold text-gray-800">R$ {p.price.toFixed(2)}</span>
                              <span className={`text-xs font-bold ${p.stock <= 5 ? 'text-red-500' : 'text-green-600'}`}>{p.stock} {p.unit}</span>
                          </div>
                        </div>
                        <div className="flex flex-col justify-between ml-2 pl-2 border-l border-gray-100">
                            <button onClick={() => startEditProduct(p)} className="text-gray-400 hover:text-amber-600"><Edit2 size={16}/></button>
                            <button onClick={() => { if(confirm('Excluir?')) removeProduct(p.id); }} className="text-gray-400 hover:text-red-600"><Trash2 size={16}/></button>
                        </div>
                    </div>
                  ))}
              </div>
           </div>
        )}

        {/* --- STAFF TAB --- */}
        {activeTab === 'staff' && (
           <div className="animate-fade-in">
              <h3 className="font-bold text-gray-700 mb-4">{editingStaff ? 'Editar Colaborador' : 'Adicionar Colaborador'}</h3>
              <form onSubmit={handleSaveStaff} className="flex flex-col md:flex-row gap-4 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-200">
                 <input required placeholder="Nome" className="flex-1 p-2 border rounded" value={stfName} onChange={e => setStfName(e.target.value)} />
                 <input required placeholder="Função" className="flex-1 p-2 border rounded" value={stfRole} onChange={e => setStfRole(e.target.value)} />
                 <input required type="number" placeholder="Comissão (%)" className="w-full md:w-32 p-2 border rounded" value={stfComm} onChange={e => setStfComm(e.target.value)} />
                 <div className="flex gap-2">
                    {editingStaff && <button type="button" onClick={cancelEditStaff} className="bg-gray-200 text-gray-700 px-4 py-2 rounded font-bold">Cancelar</button>}
                    <button className="bg-indigo-600 text-white px-6 py-2 rounded font-bold hover:bg-indigo-700 shadow-sm flex items-center justify-center">
                        <Save size={18} className="mr-2"/> Salvar
                    </button>
                 </div>
              </form>
              <div className="space-y-2">
                 {staff.map(s => (
                    <div key={s.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                       <div>
                           <div className="font-bold">{s.name}</div>
                           <div className="text-xs text-gray-500 capitalize">{s.role} | {s.commissionRate}% Comissão</div>
                       </div>
                       <div className="flex gap-2">
                             <button onClick={() => startEditStaff(s)} className="text-gray-400 hover:text-blue-600"><Edit2 size={18}/></button>
                             <button onClick={() => { if(confirm('Excluir?')) removeStaff(s.id); }} className="text-gray-400 hover:text-red-600"><Trash2 size={18}/></button>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {/* --- CLIENTS TAB --- */}
        {activeTab === 'clients' && (
           <div className="animate-fade-in">
              <h3 className="font-bold text-gray-700 mb-4">{editingClient ? 'Editar Cliente' : 'Adicionar Cliente'}</h3>
              <form onSubmit={handleSaveClient} className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-8 space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input required placeholder="Nome Completo" className="w-full p-2 border rounded" value={cliName} onChange={e => setCliName(e.target.value)} />
                    <input required placeholder="Telefone/WhatsApp" className="w-full p-2 border rounded" value={cliPhone} onChange={e => setCliPhone(e.target.value)} />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input placeholder="Aniversário (DD/MM)" className="w-full p-2 border rounded" value={cliBirthday} onChange={e => setCliBirthday(e.target.value)} />
                    <input placeholder="Login de Acesso / Usuário (Opcional)" className="w-full p-2 border rounded" value={cliEmail} onChange={e => setCliEmail(e.target.value)} />
                    <input placeholder="Senha de Acesso - Opcional" className="w-full p-2 border rounded" value={cliPass} onChange={e => setCliPass(e.target.value)} />
                 </div>
                 <div className="flex gap-2 justify-end">
                    {editingClient && <button type="button" onClick={cancelEditClient} className="bg-gray-200 text-gray-700 px-4 py-2 rounded font-bold">Cancelar</button>}
                    <button className="bg-pink-600 text-white px-6 py-2 rounded font-bold hover:bg-pink-700 shadow-sm flex items-center justify-center">
                        <Save size={18} className="mr-2"/> Salvar
                    </button>
                 </div>
              </form>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                 {clients.map(c => (
                    <div key={c.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                       <div>
                           <div className="font-bold">{c.name}</div>
                           <div className="text-xs text-gray-500">{c.phone} {c.birthday && `| Aniv: ${c.birthday}`}</div>
                           {c.email && <div className="text-[10px] text-blue-500 mt-1 font-mono">Login: {c.email}</div>}
                       </div>
                       <div className="flex gap-2">
                             <button onClick={() => startEditClient(c)} className="text-gray-400 hover:text-blue-600"><Edit2 size={18}/></button>
                             <button onClick={() => { if(confirm('Excluir?')) removeClient(c.id); }} className="text-gray-400 hover:text-red-600"><Trash2 size={18}/></button>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {/* --- LOYALTY TAB --- */}
        {activeTab === 'loyalty' && (
           <div className="animate-fade-in">
              <h3 className="font-bold text-gray-700 mb-4 flex items-center"><Award size={20} className="mr-2 text-pink-500"/> Configuração de Prêmios e Fidelidade</h3>
              
              <form onSubmit={handleSaveReward} className="bg-pink-50 p-6 rounded-xl border border-pink-200 mb-8 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <input required placeholder="Título do Prêmio (Ex: Vale Compras R$50)" className="w-full p-2 border rounded" value={rewTitle} onChange={e => setRewTitle(e.target.value)} />
                     <div className="grid grid-cols-3 gap-4">
                        <input required type="number" placeholder="Custo em Pontos" className="w-full p-2 border rounded" value={rewPoints} onChange={e => setRewPoints(e.target.value)} />
                        <input type="number" placeholder="Estoque" className="w-full p-2 border rounded" value={rewStock} onChange={e => setRewStock(e.target.value)} />
                        <input type="number" placeholder="Limite p/ Cliente" className="w-full p-2 border rounded" value={rewLimit} onChange={e => setRewLimit(e.target.value)} />
                     </div>
                  </div>
                  <input placeholder="Descrição (Ex: Válido para qualquer serviço)" className="w-full p-2 border rounded" value={rewDesc} onChange={e => setRewDesc(e.target.value)} />
                  
                  <button className="w-full bg-pink-600 text-white py-2 rounded font-bold hover:bg-pink-700 flex justify-center items-center shadow-sm">
                      <Gift size={18} className="mr-2"/> Adicionar Prêmio
                  </button>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {loyaltyRewards.map(reward => (
                      <div key={reward.id} className="bg-white border rounded-xl p-4 shadow-sm flex justify-between items-center relative overflow-hidden group">
                          <div className="absolute right-0 top-0 p-4 opacity-5 pointer-events-none">
                              <Gift size={64}/>
                          </div>
                          <div>
                              <h4 className="font-bold text-gray-800">{reward.title}</h4>
                              <p className="text-xs text-gray-500">{reward.description}</p>
                              <div className="flex gap-2 mt-2 flex-wrap">
                                <span className="text-pink-600 font-bold bg-pink-50 px-2 py-1 rounded inline-block text-xs">
                                    {reward.pointsCost} Pontos
                                </span>
                                {reward.stock !== undefined && (
                                    <span className={`font-bold px-2 py-1 rounded inline-block text-xs ${reward.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                        {reward.stock > 0 ? `${reward.stock} un disponíveis` : 'Esgotado'}
                                    </span>
                                )}
                                {reward.limitPerClient && (
                                    <span className="font-bold px-2 py-1 rounded inline-block text-xs bg-gray-100 text-gray-600">
                                        Max: {reward.limitPerClient}/cliente
                                    </span>
                                )}
                              </div>
                          </div>
                          <button onClick={() => removeLoyaltyReward(reward.id)} className="text-gray-300 hover:text-red-500 p-2"><Trash2 size={18}/></button>
                      </div>
                  ))}
                  {loyaltyRewards.length === 0 && (
                      <p className="col-span-2 text-center text-gray-400 py-8">Nenhum prêmio cadastrado.</p>
                  )}
              </div>
           </div>
        )}

        {/* --- ACCESS (ADMIN) TAB --- */}
        {activeTab === 'access' && (
           <div className="animate-fade-in">
               <h3 className="font-bold text-gray-700 mb-4 flex items-center"><Key size={20} className="mr-2 text-gray-500"/> Sub-Gerentes / Acessos</h3>
               
               <form onSubmit={handleAddAdmin} className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <input required placeholder="Nome" className="w-full p-2 border rounded" value={admName} onChange={e => setAdmName(e.target.value)} />
                     <input required placeholder="Email de Login" className="w-full p-2 border rounded" value={admEmail} onChange={e => setAdmEmail(e.target.value)} />
                     <input required placeholder="Senha" className="w-full p-2 border rounded" value={admPass} onChange={e => setAdmPass(e.target.value)} />
                  </div>
                  
                  <div className="bg-white p-4 rounded border border-gray-200">
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Permissões de Acesso</label>
                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {[
                          {id: 'cashier', label: 'Caixa'}, {id: 'orders', label: 'Pedidos Online'}, {id: 'sales', label: 'Vendas PDV'},
                          {id: 'products', label: 'Produtos/Estoque'}, {id: 'appointments', label: 'Agendamentos'},
                          {id: 'staff', label: 'Equipe'}, {id: 'clients', label: 'Clientes'}, {id: 'hair-business', label: 'Gestão Cabelos'},
                          {id: 'courses-management', label: 'Gestão Cursos'}
                        ].map(perm => (
                           <label key={perm.id} className="flex items-center space-x-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={admPermissions.includes(perm.id)} 
                                onChange={() => togglePermission(perm.id)}
                                className="rounded text-gray-800 focus:ring-gray-500"
                              />
                              <span className="text-sm text-gray-700">{perm.label}</span>
                           </label>
                        ))}
                     </div>
                  </div>

                  <button className="w-full bg-gray-800 text-white py-2 rounded font-bold hover:bg-gray-900 flex justify-center items-center">
                      <UserPlus size={18} className="mr-2"/> Criar Acesso
                  </button>
               </form>

               <div className="space-y-3">
                   {adminUsers.filter(u => u.role !== 'superadmin').map(u => (
                      <div key={u.id} className="flex justify-between items-center p-4 border rounded-xl bg-white shadow-sm">
                          <div>
                              <div className="font-bold text-gray-800">{u.name}</div>
                              <div className="text-xs text-gray-500">{u.email}</div>
                              <div className="flex gap-1 mt-1 flex-wrap">
                                 {u.permissions?.map(p => (
                                    <span key={p} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded capitalize">{p}</span>
                                 ))}
                              </div>
                          </div>
                          <button onClick={() => { if(confirm('Remover acesso?')) removeAdminUser(u.id); }} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded"><Trash2 size={18}/></button>
                      </div>
                   ))}
                   {adminUsers.filter(u => u.role !== 'superadmin').length === 0 && <p className="text-gray-400 text-center">Nenhum sub-gerente cadastrado.</p>}
               </div>
           </div>
        )}
      </div>
    </div>
  );
};