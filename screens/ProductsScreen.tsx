import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Package, AlertTriangle, Edit2, X, Save, ShoppingCart, Minus, Plus, MapPin, CheckCircle, Camera, Globe, ChevronRight, ShoppingBag, Star, Scissors, ChevronLeft, GraduationCap, Clock, FileText, CheckSquare, Users, LogIn, User, Gift, LogOut, Ticket, Tag, Ban, History } from 'lucide-react';
import { Product, UnitType, Order, Course, LoyaltyReward } from '../types';

export const ProductsScreen: React.FC = () => {
  const { products, courses, updateProduct, viewMode, addOrder, students, loggedInClient, setLoggedInClient, clients, redeemPoints, loyaltyRewards, pointRedemptions, sales } = useData();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Tab State: 'store' = General Products, 'hair' = Hair Business, 'courses' = Courses
  const [categoryTab, setCategoryTab] = useState<'store' | 'hair' | 'courses'>('store');

  // Client Mode State
  const [cart, setCart] = useState<{product: Product | Course, quantity: number, type: 'product' | 'course'}[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderStep, setOrderStep] = useState<'form' | 'confirm'>('form');
  
  // Login / Shop State
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState(''); // NEW: State for login error message
  const [showMyShopModal, setShowMyShopModal] = useState(false);
  const [redemptionSuccess, setRedemptionSuccess] = useState<string | null>(null);
  
  // Product/Course Details Modal State
  const [viewProduct, setViewProduct] = useState<Product | Course | null>(null);
  const [viewQuantity, setViewQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0); // For gallery

  // Checkout Form
  const [clientName, setClientName] = useState('');
  const [clientWhatsapp, setClientWhatsapp] = useState('');
  const [clientCpf, setClientCpf] = useState(''); // NEW CPF State
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [address, setAddress] = useState('');

  // Auto-fill form if logged in
  useEffect(() => {
      if (loggedInClient) {
          setClientName(loggedInClient.name);
          setClientWhatsapp(loggedInClient.phone);
      }
  }, [loggedInClient]);

  // Re-calculate points whenever pointRedemptions or sales change
  const calculateClientPoints = () => {
      if (!loggedInClient) return 0;
      
      const redeemed = pointRedemptions
        .filter(r => r.clientId === loggedInClient.id)
        .reduce((acc, r) => acc + r.pointsCost, 0);
      
      const totalSpent = sales
        .filter(s => s.clientId === loggedInClient.id)
        .reduce((acc, sale) => acc + sale.total, 0);
      
      return Math.floor(totalSpent - redeemed);
  };

  const clientPoints = calculateClientPoints();

  const handleRedeem = (reward: LoyaltyReward) => {
      if (!loggedInClient) return;
      
      if (clientPoints < reward.pointsCost) {
          return; // Should be disabled anyway
      }
      
      if (reward.stock !== undefined && reward.stock <= 0) {
          return;
      }

      // Execute Redemption
      redeemPoints(loggedInClient.id, reward);
      
      // Show success feedback
      setRedemptionSuccess(`Parabéns! Você resgatou "${reward.title}".`);
      
      // Clear message after 3 seconds
      setTimeout(() => setRedemptionSuccess(null), 3000);
  };

  // --- Admin Logic ---
  const openEditModal = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProduct(product);
    setEditName(product.name);
    setEditCategory(product.category);
    setEditPrice(product.price.toString());
    setEditStock(product.stock.toString());
    setEditUnit(product.unit);
    setEditImage(product.imageUrl || '');
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const updated: Product = {
      ...editingProduct,
      name: editName,
      category: editCategory,
      price: parseFloat(editPrice) || 0,
      stock: parseFloat(editStock) || 0,
      unit: editUnit,
      imageUrl: editImage
    };

    updateProduct(updated);
    setEditingProduct(null);
  };

  // --- Client Cart Logic ---
  const getCartQuantity = (itemId: string) => {
    return cart.find(item => item.product.id === itemId)?.quantity || 0;
  };

  const addToCart = (item: Product | Course, qtyToAdd: number = 1, type: 'product' | 'course' = 'product') => {
    if (qtyToAdd <= 0) {
        alert("A quantidade deve ser maior que zero.");
        return false;
    }

    const currentQty = getCartQuantity(item.id);
    
    // Strict Stock Check for Products
    if (type === 'product') {
        const prod = item as Product;
        if (currentQty + qtyToAdd > prod.stock) {
            alert(`Desculpe, só temos ${prod.stock} ${prod.unit} disponíveis deste item no momento.`);
            return false;
        }
    }
    
    // Strict Limit Check for Courses
    if (type === 'course') {
        const course = item as Course;
        if (course.maxStudents) {
            const enrolledCount = students.filter(s => s.enrolledCourseIds.includes(course.id)).length;
            if (enrolledCount >= course.maxStudents) {
                alert("Desculpe, as vagas para este curso estão esgotadas.");
                return false;
            }
        }
    }

    setCart(prev => {
      const existing = prev.find(i => i.product.id === item.id);
      if (existing) {
        return prev.map(i => i.product.id === item.id ? { ...i, quantity: i.quantity + qtyToAdd } : i);
      }
      return [...prev, { product: item, quantity: qtyToAdd, type }];
    });
    return true;
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map(item => item.product.id === itemId ? { ...item, quantity: item.quantity - 1 } : item);
      }
      return prev.filter(item => item.product.id !== itemId);
    });
  };

  const handleBuyNow = () => {
      if (viewProduct) {
          const isCourse = 'title' in viewProduct; 
          const success = addToCart(viewProduct, viewQuantity, isCourse ? 'course' : 'product');
          if (success) {
              setViewProduct(null);
              setShowCheckout(true);
          }
      }
  };

  const openDetails = (item: Product | Course) => {
      if (viewMode === 'client') {
          setViewProduct(item);
          setViewQuantity(1);
          setSelectedImageIndex(0); // Reset gallery
      }
  };

  // --- Gallery Logic ---
  const getImages = (item: Product | Course) => {
    if ('images' in item && item.images && item.images.length > 0) {
        return item.images;
    }
    return item.imageUrl ? [item.imageUrl] : ['https://picsum.photos/400/400'];
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      date: new Date().toISOString(),
      customerName: clientName,
      customerWhatsapp: clientWhatsapp,
      customerCpf: clientCpf,
      clientId: loggedInClient?.id,
      deliveryType,
      address: deliveryType === 'delivery' ? address : undefined,
      items: cart.map(i => {
        const isCourse = i.type === 'course';
        return {
          productId: i.product.id,
          productName: isCourse ? (i.product as Course).title : (i.product as Product).name,
          quantity: i.quantity,
          unit: isCourse ? 'un' : (i.product as Product).unit,
          price: i.product.price,
          type: i.type
        };
      }),
      total: cartTotal,
      status: 'pending'
    };

    addOrder(newOrder);
    setOrderStep('confirm');
  };

  const resetOrder = () => {
    setCart([]);
    setShowCheckout(false);
    setOrderStep('form');
    if (!loggedInClient) {
        setClientName('');
        setClientWhatsapp('');
        setClientCpf('');
        setAddress('');
    }
  };

  const prevImage = (images: string[]) => {
      setSelectedImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
  };

  const nextImage = (images: string[]) => {
      setSelectedImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
  };

  // NEW: handleClientLogin function
  const handleClientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(''); // Clear previous errors

    const client = clients.find(c => c.email === loginEmail && c.password === loginPass);

    if (client) {
      setLoggedInClient(client);
      setShowLoginModal(false);
      setLoginEmail('');
      setLoginPass('');
    } else {
      setLoginError('Email ou senha incorretos.');
    }
  };

  return (
    <div className="p-4 pb-24 relative">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-amber-900 flex items-center md:mb-0">
            <Package className="mr-2" /> {viewMode === 'admin' ? 'Gerenciar Estoque' : 'Nossos Produtos'}
        </h2>
        
        {/* CLIENT: LOGIN / PROFILE HEADER */}
        {viewMode === 'client' && (
            <div className="flex items-center gap-3">
                {loggedInClient ? (
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <div className="text-sm font-bold text-gray-800">{loggedInClient.name}</div>
                            <div className="text-xs text-rose-600 font-bold">{clientPoints} Pontos</div>
                        </div>
                        <button 
                            onClick={() => setShowMyShopModal(true)}
                            className="bg-rose-100 text-rose-700 p-2 rounded-full hover:bg-rose-200 transition" 
                            title="Minha Lojinha de Pontos"
                        >
                            <Gift size={20}/>
                        </button>
                        <button 
                            onClick={() => setLoggedInClient(null)} 
                            className="bg-gray-100 text-gray-500 p-2 rounded-full hover:bg-gray-200"
                            title="Sair"
                        >
                            <LogOut size={18}/>
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={() => setShowLoginModal(true)}
                        className="flex items-center bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-gray-800 transition"
                    >
                        <LogIn size={16} className="mr-2"/> Entrar (Cliente)
                    </button>
                )}
            </div>
        )}
      </div>
        
      {/* TAB SWITCHER */}
      <div className="flex bg-white rounded-xl shadow-sm border border-amber-100 p-1 overflow-x-auto max-w-full mb-6">
            <button 
                onClick={() => setCategoryTab('store')}
                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center transition-all whitespace-nowrap ${categoryTab === 'store' ? 'bg-amber-100 text-amber-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                <Package size={16} className="mr-2"/> Produtos Gerais
            </button>
            <button 
                onClick={() => setCategoryTab('hair')}
                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center transition-all whitespace-nowrap ${categoryTab === 'hair' ? 'bg-purple-100 text-purple-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                <Scissors size={16} className="mr-2"/> Cabelos
            </button>
            <button 
                onClick={() => setCategoryTab('courses')}
                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center transition-all whitespace-nowrap ${categoryTab === 'courses' ? 'bg-blue-100 text-blue-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                <GraduationCap size={16} className="mr-2"/> Cursos
            </button>
      </div>

      {/* PRODUCTS GRID */}
      {categoryTab !== 'courses' ? (
          products.filter(p => {
            if (categoryTab === 'hair') return p.origin === 'hair_business';
            return !p.origin || p.origin === 'store';
          }).length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <Package size={48} className="mx-auto text-gray-300 mb-4"/>
                  <p className="text-gray-500 font-medium">Nenhum produto encontrado nesta categoria.</p>
              </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.filter(p => {
                    if (categoryTab === 'hair') return p.origin === 'hair_business';
                    return !p.origin || p.origin === 'store';
                }).map((product) => {
                const isLowStock = product.stock <= 5;
                const isOutOfStock = product.stock <= 0;
                const badgeText = product.origin === 'hair_business' ? 'VENDIDO' : 'ESGOTADO';

                return (
                    <div 
                        key={product.id} 
                        onClick={() => openDetails(product)}
                        className={`bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 flex flex-col relative group transition-all duration-300 ${viewMode === 'client' ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1' : ''} ${isOutOfStock ? 'opacity-75 grayscale' : ''}`}
                    >
                    <div className="aspect-square bg-gray-50 relative overflow-hidden">
                        <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        
                        {viewMode === 'admin' && (
                            <span className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold shadow-sm z-10 ${isLowStock ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-700'}`}>
                                {product.stock} {product.unit}
                            </span>
                        )}

                        {viewMode === 'admin' && (
                        <button 
                            onClick={(e) => openEditModal(product, e)}
                            className="absolute top-2 left-2 p-2 bg-white/90 rounded-full text-gray-700 hover:text-amber-600 hover:bg-white shadow-sm transition-colors z-10"
                        >
                            <Edit2 size={16} />
                        </button>
                        )}

                        {product.isOnline && (
                            <div className="absolute top-2 left-2 bg-blue-500/90 backdrop-blur-sm text-white p-1.5 rounded-full shadow-sm z-10" title="Disponível Online">
                                <Globe size={14} />
                            </div>
                        )}

                        {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
                            <span className={`bg-red-600 text-white px-3 py-1 rounded font-bold text-sm transform -rotate-12 border-2 border-white uppercase`}>{badgeText}</span>
                        </div>
                        )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col">
                        <div className="mb-2">
                        <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded-full">{product.category.length > 20 ? product.category.substring(0,20)+'...' : product.category}</span>
                        </div>
                        <h3 className="font-bold text-gray-800 text-sm leading-snug mb-1 line-clamp-2 min-h-[2.5em]">{product.name}</h3>
                        
                        {/* NEW: Display for Hair Products */}
                        {product.origin === 'hair_business' && (
                            <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 self-start ${product.isOnline ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                {product.isOnline ? 'Cabelo (Pedido Online)' : 'Cabelo (Loja Física)'}
                            </div>
                        )}

                        <div className="mt-auto pt-2 flex items-end justify-between">
                            <div className="text-lg font-bold text-gray-900">
                                R$ {product.price.toFixed(2)}
                                <span className="text-xs text-gray-400 font-normal ml-1">/{product.unit}</span>
                            </div>
                            {viewMode === 'client' && !isOutOfStock && (
                                <div className="bg-rose-100 text-rose-600 p-1.5 rounded-full hover:bg-rose-600 hover:text-white transition-colors">
                                    <ShoppingBag size={18} />
                                </div>
                            )}
                        </div>
                    </div>
                    </div>
                );
                })}
            </div>
          )
      ) : (
          courses.filter(c => c.active).length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <GraduationCap size={48} className="mx-auto text-gray-300 mb-4"/>
                <p className="text-gray-500 font-medium">Nenhum curso disponível no momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.filter(c => c.active).map((course) => {
                    const enrolled = students.filter(s => s.enrolledCourseIds.includes(course.id)).length;
                    const isFull = course.maxStudents ? enrolled >= course.maxStudents : false;
                    
                    return (
                    <div 
                        key={course.id} 
                        onClick={() => openDetails(course)}
                        className={`bg-white rounded-2xl shadow-sm overflow-hidden border border-blue-50 flex flex-col group transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-1 ${isFull ? 'opacity-80' : ''}`}
                    >
                        <div className="aspect-video bg-gray-50 relative overflow-hidden">
                             <img 
                                src={course.imageUrl || 'https://picsum.photos/400/250'} 
                                alt={course.title}
                                className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isFull ? 'grayscale' : ''}`}
                             />
                             <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-blue-800 shadow-sm flex items-center">
                                <Clock size={12} className="mr-1"/> {course.workload}
                             </div>
                             {isFull && (
                                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                     <span className="bg-red-600 text-white font-bold px-3 py-1 transform -rotate-12 border-2 border-white">VAGAS ESGOTADAS</span>
                                 </div>
                             )}
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                             <h3 className="font-bold text-gray-800 text-lg leading-tight mb-2">{course.title}</h3>
                             <div className="space-y-1 mb-4">
                                <p className="text-xs text-gray-500 flex items-center"><Globe size={12} className="mr-2 text-blue-500"/> {course.format}</p>
                                <p className="text-xs text-gray-500 flex items-center"><CheckSquare size={12} className="mr-2 text-green-500"/> {course.certificate}</p>
                             </div>
                             
                             <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                 <div>
                                     <span className="text-xs text-gray-400 font-bold uppercase">Investimento</span>
                                     <div className="text-xl font-black text-blue-600">R$ {course.price.toFixed(2)}</div>
                                 </div>
                                 <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition">
                                     Ver Detalhes
                                 </button>
                             </div>
                        </div>
                    </div>
                )})}
            </div>
          )
      )}

      {/* --- CLIENT: ITEM DETAILS MODAL --- */}
      {viewProduct && viewMode === 'client' && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center animate-fade-in">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewProduct(null)}></div>
              
              <div className="bg-white w-full md:max-w-2xl md:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden relative z-10 flex flex-col md:flex-row max-h-[90vh]">
                  <button 
                    onClick={() => setViewProduct(null)}
                    className="absolute top-4 right-4 z-20 bg-white/50 hover:bg-white p-2 rounded-full backdrop-blur-md transition-colors"
                  >
                    <X size={24} className="text-gray-800"/>
                  </button>

                  <div className="w-full md:w-1/2 bg-gray-100 relative h-72 md:h-auto flex flex-col">
                      <div className="flex-1 relative overflow-hidden group">
                          <img 
                            src={getImages(viewProduct)[selectedImageIndex]} 
                            alt={('name' in viewProduct) ? viewProduct.name : viewProduct.title} 
                            className="w-full h-full object-cover transition-all" 
                          />
                          
                          {getImages(viewProduct).length > 1 && (
                            <>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); prevImage(getImages(viewProduct)); }}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/80 p-2 rounded-full text-white hover:text-gray-800 transition"
                                >
                                    <ChevronLeft size={24}/>
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); nextImage(getImages(viewProduct)); }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/80 p-2 rounded-full text-white hover:text-gray-800 transition"
                                >
                                    <ChevronRight size={24}/>
                                </button>
                            </>
                          )}
                      </div>

                      {getImages(viewProduct).length > 1 && (
                          <div className="h-16 bg-white border-t flex items-center px-2 space-x-2 overflow-x-auto">
                              {getImages(viewProduct).map((img, idx) => (
                                  <button 
                                    key={idx}
                                    onClick={() => setSelectedImageIndex(idx)}
                                    className={`h-12 w-12 rounded-lg overflow-hidden border-2 transition ${selectedImageIndex === idx ? 'border-rose-500 scale-105' : 'border-gray-200 opacity-60 hover:opacity-100'}`}
                                  >
                                      <img src={img} className="w-full h-full object-cover"/>
                                  </button>
                              ))}
                          </div>
                      )}
                  </div>

                  <div className="w-full md:w-1/2 p-6 flex flex-col overflow-y-auto">
                      <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                             {'category' in viewProduct ? (
                                <>
                                    <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                                        {viewProduct.category.length < 15 ? viewProduct.category : 'Destaque'}
                                    </span>
                                    {viewProduct.isOnline && (
                                        <span className="flex items-center text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded">
                                            <Globe size={10} className="mr-1"/> Online
                                        </span>
                                    )}
                                </>
                             ) : (
                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                                    Curso Profissional
                                </span>
                             )}
                          </div>
                          
                          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2 leading-tight">
                              {'name' in viewProduct ? viewProduct.name : viewProduct.title}
                          </h2>
                          
                          {'category' in viewProduct ? (
                            <>
                                <p className="text-gray-600 text-sm leading-relaxed mb-3 border-l-2 border-rose-200 pl-3">
                                    {viewProduct.category.length > 20 
                                        ? viewProduct.category 
                                        : `Produto de alta qualidade da categoria ${viewProduct.category}. Ideal para realçar sua beleza e estilo.`}
                                </p>
                                {/* NEW: Delivery info for online hair products */}
                                {viewProduct.origin === 'hair_business' && viewProduct.isOnline && (
                                    <div className="bg-purple-50 text-purple-700 text-xs font-bold p-2 rounded-lg mb-4 flex items-center">
                                        <Truck size={14} className="mr-2"/> Entrega: 7 a 15 dias úteis.
                                    </div>
                                )}
                            </>
                          ) : (
                             <div className="text-sm text-gray-600 space-y-3 mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <div className="flex items-start">
                                    <Clock size={16} className="mr-2 text-blue-500 mt-0.5"/>
                                    <div><strong>Carga Horária:</strong> {viewProduct.workload}</div>
                                </div>
                                <div className="flex items-start">
                                    <Globe size={16} className="mr-2 text-blue-500 mt-0.5"/>
                                    <div><strong>Formato:</strong> {viewProduct.format}</div>
                                </div>
                                <div className="flex items-start">
                                    <GraduationCap size={16} className="mr-2 text-blue-500 mt-0.5"/>
                                    <div><strong>Certificado:</strong> {viewProduct.certificate}</div>
                                </div>
                                <div className="flex items-start">
                                    <FileText size={16} className="mr-2 text-blue-500 mt-0.5"/>
                                    <div><strong>Materiais:</strong> {viewProduct.materials}</div>
                                </div>
                                {'maxStudents' in viewProduct && viewProduct.maxStudents && (
                                    <div className="flex items-start">
                                        <Users size={16} className="mr-2 text-blue-500 mt-0.5"/>
                                        <div>
                                            <strong>Vagas:</strong> {students.filter(s => s.enrolledCourseIds.includes(viewProduct.id)).length} / {viewProduct.maxStudents}
                                        </div>
                                    </div>
                                )}
                             </div>
                          )}

                          <div className="flex items-center justify-between mb-6 bg-gray-50 p-3 rounded-xl">
                              <div>
                                  <p className="text-xs text-gray-500 uppercase font-bold">Investimento</p>
                                  <p className="text-3xl font-bold text-gray-900">R$ {viewProduct.price.toFixed(2)}</p>
                              </div>
                              <div className="text-right">
                                  {'stock' in viewProduct && (
                                    <>
                                        <p className="text-xs text-gray-500 uppercase font-bold">Disponível</p>
                                        <p className={`font-bold ${viewProduct.stock < 5 ? 'text-red-500' : 'text-green-600'}`}>
                                            {viewProduct.stock} {viewProduct.unit}
                                        </p>
                                    </>
                                  )}
                              </div>
                          </div>
                      </div>

                      <div className="border-t pt-4 space-y-3">
                          <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-gray-700">Quantidade:</span>
                              <div className="flex items-center bg-gray-100 rounded-lg">
                                  <button 
                                    onClick={() => setViewQuantity(q => Math.max(1, q - 1))}
                                    className="p-3 hover:text-rose-600 transition"
                                  >
                                    <Minus size={18}/>
                                  </button>
                                  <input 
                                    type="number"
                                    min="1"
                                    step={'unit' in viewProduct && viewProduct.unit === 'un' ? "1" : "0.001"}
                                    max={'stock' in viewProduct ? viewProduct.stock : 99}
                                    className="w-16 text-center font-bold text-lg bg-transparent outline-none p-1 appearance-none"
                                    value={viewQuantity}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        if (!isNaN(val)) setViewQuantity(val);
                                    }}
                                  />
                                  <button 
                                    onClick={() => setViewQuantity(q => {
                                        const max = 'stock' in viewProduct ? viewProduct.stock : 99;
                                        return Math.min(max, q + 1);
                                    })}
                                    className="p-3 hover:text-rose-600 transition"
                                  >
                                    <Plus size={18}/>
                                  </button>
                              </div>
                          </div>

                          <div className="flex gap-3">
                              <button 
                                onClick={() => { 
                                    addToCart(viewProduct, viewQuantity, 'title' in viewProduct ? 'course' : 'product'); 
                                    setViewProduct(null); 
                                }}
                                className="flex-1 py-3 border-2 border-rose-600 text-rose-600 font-bold rounded-xl hover:bg-rose-50 transition flex items-center justify-center"
                              >
                                  <ShoppingCart size={20} className="mr-2"/> Adicionar
                              </button>
                              <button 
                                onClick={handleBuyNow}
                                className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 shadow-lg hover:shadow-rose-200 transition flex items-center justify-center"
                              >
                                  Comprar Agora <ChevronRight size={20} className="ml-1"/>
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* CLIENT: Floating Cart Button */}
      {viewMode === 'client' && cart.length > 0 && !viewProduct && !showCheckout && (
        <div className="fixed bottom-4 left-4 right-4 z-40">
           <button 
             onClick={() => setShowCheckout(true)}
             className="w-full bg-rose-600 text-white p-4 rounded-xl shadow-xl flex justify-between items-center animate-bounce-small"
           >
              <div className="flex items-center">
                 <div className="bg-white/20 p-2 rounded-lg mr-3">
                    <ShoppingCart size={24} />
                 </div>
                 <div className="text-left">
                    <div className="font-bold text-lg">{cart.reduce((a, b) => a + b.quantity, 0)} itens</div>
                    <div className="text-xs text-rose-100">Ver Cestinha</div>
                 </div>
              </div>
              <div className="font-bold text-xl">
                 R$ {cartTotal.toFixed(2)}
              </div>
           </button>
        </div>
      )}

      {/* CLIENT: Checkout Modal */}
      {showCheckout && (
         <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
               {orderStep === 'form' ? (
                 <>
                    <div className="bg-rose-600 p-4 flex justify-between items-center text-white">
                        <h3 className="font-bold flex items-center text-lg"><ShoppingCart className="mr-2"/> Finalizar Pedido</h3>
                        <button onClick={() => setShowCheckout(false)} className="hover:bg-rose-500 rounded-full p-1"><X size={24}/></button>
                    </div>
                    
                    <form onSubmit={handleSubmitOrder} className="p-6 overflow-y-auto">
                        <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                           <h4 className="font-bold text-gray-500 text-xs uppercase mb-2">Resumo</h4>
                           <ul className="space-y-2 mb-3">
                              {cart.map((item, idx) => (
                                <li key={idx} className="flex justify-between text-sm">
                                   <div className="flex items-center">
                                       <button type="button" onClick={() => removeFromCart(item.product.id)} className="mr-2 text-red-400 hover:text-red-600"><X size={14}/></button>
                                       <span>
                                           {item.quantity}x {'name' in item.product ? item.product.name : item.product.title}
                                            {item.type === 'course' && <span className="ml-1 text-[10px] bg-blue-100 text-blue-700 px-1 rounded">Curso</span>}
                                       </span>
                                   </div>
                                   <span className="font-bold">R$ {(item.product.price * item.quantity).toFixed(2)}</span>
                                </li>
                              ))}
                           </ul>
                           <div className="border-t pt-2 flex justify-between font-bold text-rose-700 text-lg">
                              <span>Total</span>
                              <span>R$ {cartTotal.toFixed(2)}</span>
                           </div>
                        </div>

                        <div className="space-y-4">
                           <h4 className="font-bold text-gray-800 flex items-center"><Edit2 size={16} className="mr-2"/> Cadastro Rápido</h4>
                           {loggedInClient && (
                               <div className="bg-green-50 p-3 rounded-lg border border-green-100 mb-2">
                                   <p className="text-xs text-green-700 font-bold flex items-center"><User size={12} className="mr-1"/> Comprando como: {loggedInClient.name}</p>
                                   <p className="text-[10px] text-green-600">Seus pontos serão creditados automaticamente!</p>
                               </div>
                           )}
                           <input 
                              required 
                              placeholder="Seu Nome Completo" 
                              className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-rose-300"
                              value={clientName}
                              onChange={e => setClientName(e.target.value)}
                              disabled={!!loggedInClient}
                           />
                           <input 
                              required 
                              placeholder="WhatsApp (com DDD)" 
                              className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-rose-300"
                              value={clientWhatsapp}
                              onChange={e => setClientWhatsapp(e.target.value)}
                              disabled={!!loggedInClient}
                           />
                           <input 
                              required 
                              placeholder="CPF" 
                              className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-rose-300"
                              value={clientCpf}
                              onChange={e => setClientCpf(e.target.value)}
                           />

                           <div className="pt-2">
                              <h4 className="font-bold text-gray-800 mb-2">Forma de Entrega / Acesso</h4>
                              <div className="flex gap-3 mb-3">
                                 <button 
                                    type="button"
                                    onClick={() => setDeliveryType('pickup')}
                                    className={`flex-1 py-3 rounded-xl border font-bold text-sm ${deliveryType === 'pickup' ? 'bg-rose-100 border-rose-300 text-rose-800' : 'border-gray-200 text-gray-500'}`}
                                 >
                                    Retirar na Loja
                                 </button>
                                 <button 
                                    type="button"
                                    onClick={() => setDeliveryType('delivery')}
                                    className={`flex-1 py-3 rounded-xl border font-bold text-sm ${deliveryType === 'delivery' ? 'bg-rose-100 border-rose-300 text-rose-800' : 'border-gray-200 text-gray-500'}`}
                                 >
                                    Entrega / Online
                                 </button>
                              </div>

                              {deliveryType === 'pickup' ? (
                                 <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 text-sm text-orange-800">
                                    <p className="font-bold flex items-center mb-1"><MapPin size={16} className="mr-2"/> Endereço para Retirada:</p>
                                    <p>Av. Principal, 123 - Centro</p>
                                    <p className="text-xs mt-2 opacity-80">* Aguarde o aviso de "Pronto" no WhatsApp.</p>
                                 </div>
                              ) : (
                                 <textarea 
                                    required={deliveryType === 'delivery'}
                                    placeholder="Endereço Completo para Entrega... (Se for curso online, coloque 'Email: seuemail@...')" 
                                    className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-rose-300 h-24 resize-none"
                                    value={address}
                                    onChange={e => setAddress(e.target.value)}
                                 />
                              )}
                           </div>
                        </div>

                        <button type="submit" className="w-full bg-rose-600 text-white py-4 rounded-xl font-bold text-lg mt-6 shadow-lg hover:bg-rose-700">
                           Enviar Pedido
                        </button>
                    </form>
                 </>
               ) : (
                 <div className="p-8 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
                       <CheckCircle size={48} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Pedido Recebido!</h3>
                    <p className="text-gray-500 mb-6">
                       Aguarde! Entraremos em contato via WhatsApp para confirmar o pagamento e entrega.
                    </p>
                    {deliveryType === 'pickup' && (
                       <div className="bg-orange-50 p-4 rounded-lg w-full mb-6">
                          <p className="font-bold text-orange-800 text-sm">Status Atual: Em Processamento</p>
                          <p className="text-xs text-orange-600 mt-1">Avise quando estiver vindo buscar!</p>
                       </div>
                    )}
                    <button onClick={resetOrder} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold">
                       Voltar para a Loja
                    </button>
                 </div>
               )}
            </div>
         </div>
      )}

      {/* ADMIN: Edit Modal */}
      {editingProduct && viewMode === 'admin' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-amber-100 p-4 flex justify-between items-center border-b border-amber-200">
               <h3 className="font-bold text-amber-900 flex items-center">
                 <Edit2 size={18} className="mr-2"/> Editar Produto
               </h3>
               <button onClick={() => setEditingProduct(null)} className="text-amber-800 hover:bg-amber-200 rounded-full p-1">
                 <X size={20} />
               </button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 overflow-y-auto">
               <div 
                 onClick={() => editFileInputRef.current?.click()}
                 className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 mb-4 relative overflow-hidden"
               >
                 {editImage ? (
                   <img src={editImage} alt="Preview" className="h-full w-full object-contain" />
                 ) : (
                   <>
                     <Camera className="text-gray-400 mb-1" />
                     <span className="text-gray-500 text-xs">Alterar Foto Principal</span>
                   </>
                 )}
                 <input type="file" ref={editFileInputRef} className="hidden" accept="image/*" onChange={handleEditImageChange} />
               </div>

               <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome do Produto</label>
                 <input 
                   required
                   className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-400 outline-none" 
                   value={editName}
                   onChange={e => setEditName(e.target.value)}
                 />
               </div>

               <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoria (Descrição Curta)</label>
                 <textarea 
                   required
                   className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-400 outline-none resize-none" 
                   value={editCategory}
                   onChange={e => setEditCategory(e.target.value)}
                   rows={2}
                 />
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Preço (R$)</label>
                    <input required type="number" step="0.01" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-400 outline-none font-bold text-gray-700" value={editPrice} onChange={e => setEditPrice(e.target.value)} />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unidade</label>
                    <select className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-400 outline-none bg-white" value={editUnit} onChange={e => setEditUnit(e.target.value as UnitType)}>
                      <option value="un">Unidade (un)</option>
                      <option value="kg">Quilo (kg)</option>
                      <option value="g">Grama (g)</option>
                    </select>
                 </div>
               </div>

               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Estoque Atual</label>
                  <input required type="number" step="0.01" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-400 outline-none" value={editStock} onChange={e => setEditStock(e.target.value)} />
               </div>

               <button className="w-full bg-amber-600 text-white py-3 rounded-xl font-bold shadow-md hover:bg-amber-700 transition flex items-center justify-center mt-4">
                 <Save size={18} className="mr-2" /> Salvar Alterações
               </button>
            </form>
          </div>
        </div>
      )}

      {/* CLIENT LOGIN MODAL */}
      {showLoginModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
              <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 relative">
                  <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100"><X size={20}/></button>
                  <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-600">
                          <User size={32}/>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">Login Cliente</h3>
                      <p className="text-sm text-gray-500">Acesse sua conta para acumular pontos.</p>
                  </div>
                  <form onSubmit={handleClientLogin} className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Login / Usuário</label>
                          <input required type="text" className="w-full p-3 border rounded-xl" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Senha</label>
                          <input required type="password" className="w-full p-3 border rounded-xl" value={loginPass} onChange={e => setLoginPass(e.target.value)} />
                      </div>
                      {loginError && (
                        <div className="text-red-500 text-sm font-bold text-center bg-red-50 p-2 rounded-lg">
                          {loginError}
                        </div>
                      )}
                      <button className="w-full bg-rose-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-rose-700">Entrar</button>
                  </form>
                  <p className="text-xs text-center mt-4 text-gray-400">Não tem conta? Fale com nosso gerente.</p>
              </div>
          </div>
      )}

      {/* MY SHOP (POINTS REDEMPTION) MODAL */}
      {showMyShopModal && loggedInClient && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
              <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[85vh] relative">
                  {/* Success Overlay Message */}
                  {redemptionSuccess && (
                      <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-2xl animate-fade-in">
                          <div className="text-center p-6">
                              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                                  <CheckCircle size={32} />
                              </div>
                              <h3 className="text-xl font-bold text-green-800 mb-2">Resgatado!</h3>
                              <p className="text-gray-600">{redemptionSuccess}</p>
                          </div>
                      </div>
                  )}

                  <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-6 text-white shrink-0 relative">
                      <button onClick={() => setShowMyShopModal(false)} className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full"><X size={20}/></button>
                      <h3 className="font-bold text-xl flex items-center"><Gift className="mr-2"/> Minha Lojinha de Pontos</h3>
                      <div className="mt-4 bg-white/20 p-3 rounded-xl backdrop-blur-sm border border-white/30 flex items-center justify-between">
                          <span className="font-medium text-white/90">Saldo Disponível</span>
                          <span className="font-bold text-2xl">{clientPoints} pts</span>
                      </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                      <h4 className="font-bold text-gray-600 text-sm uppercase mb-4">Prêmios Disponíveis</h4>
                      <div className="space-y-3">
                          {loyaltyRewards.length === 0 ? (
                              <p className="text-center text-gray-400 italic">Nenhum prêmio disponível no momento.</p>
                          ) : (
                              loyaltyRewards.map(reward => {
                                  const canBuy = clientPoints >= reward.pointsCost;
                                  const hasStock = reward.stock === undefined || reward.stock > 0;
                                  
                                  let limitReached = false;
                                  if (reward.limitPerClient) {
                                      const redemptions = pointRedemptions.filter(r => r.clientId === loggedInClient.id && r.rewardId === reward.id).length;
                                      if (redemptions >= reward.limitPerClient) limitReached = true;
                                  }

                                  return (
                                      <div key={reward.id} className={`bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center ${!hasStock || limitReached ? 'opacity-60 border-red-100 bg-red-50' : 'border-gray-100'}`}>
                                          <div>
                                              <div className="font-bold text-gray-800">{reward.title}</div>
                                              <div className="text-xs text-gray-500">{reward.description}</div>
                                              <div className="flex gap-2 mt-1 flex-wrap">
                                                  <span className="text-xs font-bold text-rose-600">{reward.pointsCost} pontos</span>
                                                  {!hasStock && <span className="text-xs font-bold text-red-600 uppercase">Esgotado</span>}
                                                  {limitReached && <span className="text-xs font-bold text-red-600 bg-red-100 px-1 rounded uppercase">Limite Atingido</span>}
                                              </div>
                                          </div>
                                          <button 
                                            type="button"
                                            onClick={() => handleRedeem(reward)}
                                            disabled={!canBuy || !hasStock || limitReached}
                                            className={`px-4 py-2 rounded-lg font-bold text-xs flex flex-col items-center justify-center min-w-[100px] transition-all active:scale-95 ${canBuy && hasStock && !limitReached ? 'bg-green-500 text-white hover:bg-green-600 shadow-sm' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                          >
                                              {limitReached ? <><Ban size={14} className="mb-1"/> Limite</> : 
                                               !hasStock ? 'Esgotado' : 
                                               !canBuy ? 'Faltam Pontos' : 'Comprar'}
                                          </button>
                                      </div>
                                  )
                              })
                          )}
                      </div>

                      <div className="mt-8 border-t pt-4">
                          <h4 className="font-bold text-gray-600 text-sm uppercase mb-4 flex items-center"><Ticket size={16} className="mr-2"/> Meus Resgates</h4>
                          <div className="space-y-2">
                              {pointRedemptions.filter(r => r.clientId === loggedInClient.id).length === 0 ? (
                                  <p className="text-xs text-gray-400 text-center">Você ainda não comprou prêmios.</p>
                              ) : (
                                  pointRedemptions
                                    .filter(r => r.clientId === loggedInClient.id)
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
              </div>
          </div>
      )}
    </div>
  );
};