import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Calculator, Activity, Award, Palette, CheckCircle, Camera, ArrowRight, Ruler, Scissors, Lock, Ban, AlertTriangle, Trophy, Star, MapPin, Copy } from 'lucide-react';
import { HairQuote } from '../types';

// Constants
const BRAZIL_STATES = ['SP', 'RJ', 'MG', 'BA', 'PR', 'RS', 'PE', 'CE', 'PA', 'SC', 'GO', 'PB', 'MA', 'ES', 'PI', 'RN', 'AL', 'MT', 'MS', 'DF', 'RO', 'AC', 'AM', 'AP', 'RR', 'TO'];
const AGE_GROUPS = ['18-25', '26-35', '36-45', '46-55', '56+'];

export const SocialHairCalculatorScreen: React.FC = () => {
  const { currentUser, addHairQuote, registerHairPurchase, hairConfig, hairQuotes } = useData();

  // --- DETERMINE ACTIVE CONFIG (Specific User Config OR Global) ---
  const activeConfig = currentUser?.customConfig || hairConfig;

  // --- DERIVE ENABLED OPTIONS FROM ACTIVE CONFIG ---
  const enabledTextures = activeConfig.textures.filter(i => i.enabled);
  const enabledColors = activeConfig.colors.filter(i => i.enabled);
  const enabledConditions = activeConfig.conditions.filter(i => i.enabled);
  const enabledLengths = activeConfig.lengths.filter(i => i.enabled);
  const enabledCircs = activeConfig.circumferences.filter(i => i.enabled);
  const enabledQualities = activeConfig.qualities.filter(i => i.enabled);

  // --- STATE ---
  const [hairType, setHairType] = useState(enabledTextures[0]?.value as string || '');
  const [length, setLength] = useState(enabledLengths[0]?.value as number || 0);
  const [circumference, setCircumference] = useState(enabledCircs[0]?.value as number || 0);
  const [condition, setCondition] = useState(enabledConditions[0]?.value as string || '');
  const [quality, setQuality] = useState(enabledQualities[0]?.value as string || '');
  const [color, setColor] = useState(enabledColors[0]?.value as string || '');
  
  // Results & Flow State
  const [currentQuote, setCurrentQuote] = useState<HairQuote | null>(null);
  const [step, setStep] = useState<'calc' | 'result' | 'seller' | 'photos' | 'success'>('calc');
  const [purchaseBlocked, setPurchaseBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [errorMsg, setErrorMsg] = useState(''); // Visual error feedback
  const [generatedApprovalCode, setGeneratedApprovalCode] = useState<string | null>(null); // NEW: Store generated code

  // Purchase Form State
  const [sellerName, setSellerName] = useState('');
  const [sellerCpf, setSellerCpf] = useState('');
  const [sellerPix, setSellerPix] = useState('');
  const [sellerState, setSellerState] = useState('');
  const [sellerAgeGroup, setSellerAgeGroup] = useState<'Criança' | 'Adolescente' | 'Adulto' | ''>('');
  
  // Photos State
  const [photoFront, setPhotoFront] = useState<string>('');
  const [photoSide, setPhotoSide] = useState<string>('');
  const [photoBack, setPhotoBack] = useState<string>('');

  const frontInputRef = useRef<HTMLInputElement>(null);
  const sideInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  // --- EFFECT: RE-VALIDATE IF CONFIG CHANGES ---
  useEffect(() => {
    // If currently selected option is now disabled, switch to first valid one
    if (!enabledTextures.find(t => t.value === hairType) && enabledTextures.length > 0) setHairType(enabledTextures[0].value as string);
    if (!enabledColors.find(c => c.value === color) && enabledColors.length > 0) setColor(enabledColors[0].value as string);
    if (!enabledConditions.find(c => c.value === condition) && enabledConditions.length > 0) setCondition(enabledConditions[0].value as string);
    if (!enabledLengths.find(l => l.value === length) && enabledLengths.length > 0) setLength(enabledLengths[0].value as number);
    if (!enabledCircs.find(c => c.value === circumference) && enabledCircs.length > 0) setCircumference(enabledCircs[0].value as number);
    if (!enabledQualities.find(q => q.value === quality) && enabledQualities.length > 0) setQuality(enabledQualities[0].value as string);
  }, [activeConfig, enabledTextures, enabledColors, enabledConditions, enabledLengths, enabledCircs, enabledQualities]);

  // --- METRICS CALCULATION ---
  const now = new Date();
  const isMonth = (d: Date) => d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  
  const myMonthlyTotal = currentUser ? hairQuotes
    .filter(q => q.evaluatorId === currentUser.id && (q.status === 'stock' || q.status === 'sold') && isMonth(new Date(q.date))) // NEW: Only count 'stock' or 'sold'
    .reduce((acc, q) => acc + q.totalValue, 0) : 0;
  
  const monthlyGoal = hairConfig.monthlyGoal || 1;
  const progressPercent = Math.min((myMonthlyTotal / monthlyGoal) * 100, 100);


  const calculate = () => {
    let total = 0;
    
    // Find prices in config
    const texObj = enabledTextures.find(t => t.value === hairType);
    if (texObj) total += texObj.price;

    const lenObj = enabledLengths.find(l => l.value === length);
    if (lenObj) total += lenObj.price;

    const circObj = enabledCircs.find(c => c.value === circumference);
    if (circObj) total += circObj.price;

    const condObj = enabledConditions.find(c => c.value === condition);
    if (condObj) total += condObj.price;

    const qualObj = enabledQualities.find(q => q.value === quality);
    if (qualObj) total += qualObj.price;
    
    // --- GLOBAL MAX PRICE LIMIT ---
    let isBlocked = false;
    let reason = '';

    if (activeConfig.maxPriceLimit > 0 && total > activeConfig.maxPriceLimit) {
        isBlocked = true;
        reason = `Valor total (R$ ${total.toFixed(2)}) excede o limite máximo permitido (R$ ${activeConfig.maxPriceLimit.toFixed(2)}).`;
    }

    setPurchaseBlocked(isBlocked);
    setBlockReason(isBlocked ? reason : '');

    // Auto-save the quote immediately as 'quoted'
    if (currentUser) {
      const newQuote: HairQuote = {
        id: `hq-${Date.now()}`,
        evaluatorId: currentUser.id,
        evaluatorName: currentUser.fullName,
        date: new Date().toISOString(),
        hairType,
        length,
        circumference,
        condition,
        quality,
        color,
        totalValue: total,
        status: 'quoted'
      };
      addHairQuote(newQuote);
      setCurrentQuote(newQuote);
      setStep('result');
    }
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, setPhoto: (s: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const resizedImage = await resizeImage(file);
        setPhoto(resizedImage);
      } catch (err) {
        console.error("Error resizing image", err);
        const reader = new FileReader();
        reader.onloadend = () => setPhoto(reader.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  const validateSeller = () => {
     if (!sellerName || !sellerCpf || !sellerPix || !sellerState || !sellerAgeGroup) {
      setErrorMsg("Por favor, preencha todos os campos obrigatórios (*).");
      return false;
    }
    setErrorMsg("");
    return true;
  };

  const validatePhotos = () => {
    if (!photoFront || !photoSide || !photoBack) {
       setErrorMsg("É obrigatório enviar as 3 fotos (Frente, Lado e Costa).");
       return false;
    }
    setErrorMsg("");
    return true;
  };

  const handleNextToPhotos = () => {
      if (validateSeller()) {
          setStep('photos');
      }
  };

  const handleFinishPurchase = () => {
    setErrorMsg("");
    if (purchaseBlocked) return;
    if (!currentQuote) return;
    
    if (!validateSeller() || !validatePhotos()) return;

    // NEW: Generate unique approval code
    const code = `HQ-${Date.now().toString().slice(-6)}`;
    setGeneratedApprovalCode(code);

    const updatedQuote: HairQuote = {
      ...currentQuote,
      status: 'purchased', // Status is 'purchased' awaiting admin approval
      sellerName,
      sellerCpf,
      sellerPix,
      sellerState,
      sellerAgeGroup: sellerAgeGroup as any,
      photos: {
        front: photoFront,
        side: photoSide,
        back: photoBack
      },
      approvalCode: code // NEW: Add approval code
    };

    // Use specific context function to also register expense
    registerHairPurchase(updatedQuote);
    setStep('success');
  };

  const resetForm = () => {
    // Reset inputs to defaults (first valid ones)
    setHairType(enabledTextures[0]?.value as string || '');
    setLength(enabledLengths[0]?.value as number || 0);
    setCircumference(enabledCircs[0]?.value as number || 0);
    setCondition(enabledConditions[0]?.value as string || '');
    setQuality(enabledQualities[0]?.value as string || '');
    setHairType(enabledTextures[0]?.value as string || '');
    setColor(enabledColors[0]?.value as string || '');
    
    // Reset Purchase Data
    setSellerName('');
    setSellerCpf('');
    setSellerPix('');
    setSellerState('');
    setSellerAgeGroup('');
    setPhotoFront('');
    setPhotoSide('');
    setPhotoBack('');
    setGeneratedApprovalCode(null); // NEW: Reset generated code
    
    // Reset Flow
    setCurrentQuote(null);
    setPurchaseBlocked(false);
    setBlockReason('');
    setErrorMsg('');
    setStep('calc');
  };

  if (step === 'success') {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[80vh] text-center animate-fade-in">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
          <CheckCircle size={64} />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Compra Registrada!</h2>
        <p className="text-gray-500 mb-4 max-w-xs mx-auto">
          O cabelo foi registrado e os dados enviados para a administração.
        </p>
        {generatedApprovalCode && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6 text-green-800 font-bold text-xl flex items-center justify-center">
                <span className="mr-2">CÓDIGO:</span>
                <span>{generatedApprovalCode}</span>
                <button 
                    onClick={() => navigator.clipboard.writeText(generatedApprovalCode)}
                    className="ml-3 p-1 rounded-full hover:bg-green-100 text-green-600"
                    title="Copiar código"
                >
                    <Copy size={18}/>
                </button>
            </div>
        )}
        <p className="text-sm text-gray-600 mb-8 max-w-xs mx-auto">
            Informe este código à administração para aprovação final da compra.
        </p>
        
        <div className="w-full max-w-sm space-y-3">
            <button 
                onClick={resetForm} 
                className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-bold text-lg hover:bg-gray-200 transition"
            >
                Voltar para Nova Avaliação
            </button>
        </div>
      </div>
    );
  }
  
  const isSelectionValid = hairType && length > 0 && circumference > 0 && condition && quality && color;

  return (
    <div className="p-4 pb-20 w-full max-w-5xl mx-auto"> 
      
      {/* HEADER CARD */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl p-6 text-white mb-6 shadow-lg relative overflow-hidden">
        <div className="relative z-10">
            <h2 className="text-2xl font-bold flex items-center">
                <Calculator className="mr-2" /> Calculadora de Cabelo
            </h2>
            <p className="text-white/80 text-sm mt-1 flex items-center">
                <MapPin size={14} className="mr-1"/> Avaliador: <strong>{currentUser?.fullName}</strong> ({currentUser?.address} - {currentUser?.unit})
            </p>
        </div>
        
        {/* GOAL / PROGRESS WIDGET */}
        {hairConfig.monthlyGoal > 0 && (
            <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <div className="text-[10px] uppercase font-bold text-pink-200 flex items-center">
                            <Trophy size={12} className="mr-1"/> Meta do Mês
                        </div>
                        <div className="text-lg font-bold">R$ {myMonthlyTotal.toFixed(2)} / {monthlyGoal.toFixed(2)}</div>
                    </div>
                    {hairConfig.monthlyReward && (
                        <div className="text-right">
                            <div className="text-[10px] uppercase font-bold text-yellow-200 flex items-center justify-end">
                                <Star size={12} className="mr-1 fill-yellow-200"/> Prêmio
                            </div>
                            <div className="text-sm font-bold text-yellow-100">{hairConfig.monthlyReward}</div>
                        </div>
                    )}
                </div>
                <div className="w-full bg-black/20 rounded-full h-2.5">
                    <div 
                        className="bg-green-400 h-2.5 rounded-full transition-all duration-1000" 
                        style={{ width: `${progressPercent}%` }}
                    ></div>
                </div>
                <div className="text-right text-[10px] mt-1 text-white/70">{progressPercent.toFixed(0)}% Alcançado</div>
            </div>
        )}
      </div>

      {step === 'calc' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6 animate-fade-in">
          
          {/* 1. TEXTURE */}
          <div>
            <label className="font-bold text-gray-700 flex items-center mb-2">
              <Activity size={18} className="mr-2 text-pink-500" /> Tipo de Cabelo
            </label>
            {enabledTextures.length === 0 ? <p className="text-red-500 text-sm">Indisponível</p> : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {enabledTextures.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setHairType(type.value as string)}
                    className={`py-2 rounded-lg border font-medium text-sm transition ${hairType === type.value ? 'bg-pink-100 border-pink-500 text-pink-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. COLOR */}
          <div>
             <label className="font-bold text-gray-700 flex items-center mb-2">
               <Palette size={18} className="mr-2 text-purple-500" /> Cor
             </label>
             <select 
               className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none"
               value={color}
               onChange={e => setColor(e.target.value)}
               disabled={enabledColors.length === 0}
             >
               {enabledColors.map(c => <option key={c.id} value={c.value}>{c.label}</option>)}
               {enabledColors.length === 0 && <option>Indisponível</option>}
             </select>
          </div>

          {/* 3. CONDITION */}
          <div>
             <label className="font-bold text-gray-700 flex items-center mb-2">
               <Scissors size={18} className="mr-2 text-blue-500" /> Estado / Química
             </label>
             {enabledConditions.length === 0 ? <p className="text-red-500 text-sm">Indisponível</p> : (
               <div className="grid grid-cols-3 gap-2">
                {enabledConditions.map(c => (
                   <button
                     key={c.id}
                     onClick={() => setCondition(c.value as string)}
                     className={`py-2 rounded-lg border font-medium text-sm transition ${condition === c.value ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                   >
                     {c.label}
                   </button>
                 ))}
               </div>
             )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* 4. LENGTH */}
             <div>
                <label className="font-bold text-gray-700 flex items-center mb-2 text-sm">
                  <Ruler size={16} className="mr-1 text-green-500" /> Tamanho (cm)
                </label>
                <select 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none font-bold"
                  value={length}
                  onChange={e => setLength(parseInt(e.target.value))}
                  disabled={enabledLengths.length === 0}
                >
                  {enabledLengths.map(l => (
                    <option key={l.id} value={l.value}>{l.label}</option>
                  ))}
                  {enabledLengths.length === 0 && <option value="0">Indisponível</option>}
                </select>
             </div>

             {/* 5. CIRCUMFERENCE */}
             <div>
                <label className="font-bold text-gray-700 flex items-center mb-2 text-sm">
                  <Ruler size={16} className="mr-1 text-orange-500" /> Espessura (cm)
                </label>
                <select 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none font-bold"
                  value={circumference}
                  onChange={e => setCircumference(parseInt(e.target.value))}
                  disabled={enabledCircs.length === 0}
                >
                  {enabledCircs.map(c => (
                    <option key={c.id} value={c.value}>{c.label}</option>
                  ))}
                  {enabledCircs.length === 0 && <option value="0">Indisponível</option>}
                </select>
             </div>
          </div>

          {/* 6. QUALITY */}
          <div>
             <label className="font-bold text-gray-700 flex items-center mb-2">
               <Award size={18} className="mr-2 text-yellow-500" /> Qualidade
             </label>
             <select 
               className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none"
               value={quality}
               onChange={e => setQuality(e.target.value)}
               disabled={enabledQualities.length === 0}
             >
               {enabledQualities.map(q => (
                 <option key={q.id} value={q.value}>{q.label}</option>
               ))}
               {enabledQualities.length === 0 && <option>Indisponível</option>}
             </select>
          </div>

          <button 
            onClick={calculate}
            disabled={!isSelectionValid}
            className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-black transition mt-4 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            {isSelectionValid ? 'Calcular Valor' : 'Opções Indisponíveis'}
          </button>
        </div>
      )}

      {/* Result Screen */}
      {step === 'result' && currentQuote && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center animate-fade-in space-y-6">
           
           {!purchaseBlocked ? (
             <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Valor da Cotação</h3>
                <div className="text-5xl font-black text-green-600">
                  R$ {currentQuote.totalValue.toFixed(2)}
                </div>
                <p className="text-xs text-gray-400 mt-2">Cotação salva automaticamente.</p>
             </div>
           ) : (
             <div className="py-6">
                <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4 animate-pulse">
                   <Ban size={48} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Compra Não Autorizada</h3>
             </div>
           )}

           {purchaseBlocked ? (
             <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-700">
                <div className="flex items-center justify-center font-bold text-lg mb-2">
                  <Lock size={24} className="mr-2"/> Bloqueio Administrativo
                </div>
                <p className="text-sm font-medium">{activeConfig.blockPurchaseMessage}</p>
                <p className="text-xs mt-2 opacity-80">Motivo: {blockReason}</p>
             </div>
           ) : (
             <button 
                onClick={() => setStep('seller')}
                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold shadow-md hover:bg-green-700 flex flex-col items-center justify-center"
              >
                <span>Finalizar Compra</span>
                <span className="text-[10px] font-normal opacity-80">(Registrar Vendedor)</span>
              </button>
           )}

           <button 
             onClick={resetForm}
             className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-200 flex flex-col items-center justify-center"
           >
             <span>Nova Avaliação</span>
           </button>
        </div>
      )}

      {/* Seller Details Form */}
      {step === 'seller' && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-fade-in space-y-4">
           <h3 className="font-bold text-lg text-gray-800 border-b pb-2 mb-4">Dados do Vendedor</h3>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <input 
                required 
                placeholder="Nome Completo do Vendedor *" 
                className="w-full p-3 border rounded-lg"
                value={sellerName}
                onChange={e => setSellerName(e.target.value)}
             />
             <input 
                required 
                placeholder="CPF *" 
                className="w-full p-3 border rounded-lg"
                value={sellerCpf}
                onChange={e => setSellerCpf(e.target.value)}
             />
           </div>
           
           <input 
             required 
             placeholder="Chave PIX para Pagamento *" 
             className="w-full p-3 border rounded-lg"
             value={sellerPix}
             onChange={e => setSellerPix(e.target.value)}
           />

           <div className="grid grid-cols-2 gap-4">
              <div>
                  <select 
                    className="w-full p-3 border rounded-lg bg-white"
                    value={sellerState}
                    onChange={e => setSellerState(e.target.value)}
                  >
                    <option value="">Estado (UF) *</option>
                    {BRAZIL_STATES.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                  </select>
              </div>
              <div>
                  <select 
                    className="w-full p-3 border rounded-lg bg-white"
                    value={sellerAgeGroup}
                    onChange={e => setSellerAgeGroup(e.target.value as any)}
                  >
                    <option value="">Faixa Etária *</option>
                    {AGE_GROUPS.map(age => <option key={age} value={age}>{age}</option>)}
                  </select>
              </div>
           </div>

           {errorMsg && (
             <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold flex items-center">
                <AlertTriangle size={18} className="mr-2"/> {errorMsg}
             </div>
           )}

           <div className="flex gap-3 pt-4">
             <button onClick={() => setStep('result')} className="flex-1 py-3 bg-gray-100 rounded-lg text-gray-600 font-bold">Voltar</button>
             <button onClick={handleNextToPhotos} className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 flex items-center justify-center">
               Próximo <ArrowRight size={18} className="ml-2"/>
             </button>
           </div>
        </div>
      )}

      {/* Photo Uploads */}
      {step === 'photos' && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-fade-in space-y-4">
          <h3 className="font-bold text-lg text-gray-800 border-b pb-2 mb-4">Fotos do Cabelo (Obrigatório)</h3>

          <div className="grid grid-cols-3 gap-2">
            {/* Front */}
            <div onClick={() => frontInputRef.current?.click()} className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 overflow-hidden relative">
               {photoFront ? <img src={photoFront} className="w-full h-full object-cover"/> : <Camera className="text-gray-400"/>}
               <span className="text-[10px] font-bold text-gray-500 absolute bottom-1 bg-white/80 px-1 rounded">FRENTE *</span>
               <input type="file" ref={frontInputRef} className="hidden" accept="image/*" onChange={e => handlePhotoUpload(e, setPhotoFront)} />
            </div>
            {/* Side */}
            <div onClick={() => sideInputRef.current?.click()} className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 overflow-hidden relative">
               {photoSide ? <img src={photoSide} className="w-full h-full object-cover"/> : <Camera className="text-gray-400"/>}
               <span className="text-[10px] font-bold text-gray-500 absolute bottom-1 bg-white/80 px-1 rounded">LADO *</span>
               <input type="file" ref={sideInputRef} className="hidden" accept="image/*" onChange={e => handlePhotoUpload(e, setPhotoSide)} />
            </div>
            {/* Back */}
            <div onClick={() => backInputRef.current?.click()} className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 overflow-hidden relative">
               {photoBack ? <img src={photoBack} className="w-full h-full object-cover"/> : <Camera className="text-gray-400"/>}
               <span className="text-[10px] font-bold text-gray-500 absolute bottom-1 bg-white/80 px-1 rounded">COSTA *</span>
               <input type="file" ref={backInputRef} className="hidden" accept="image/*" onChange={e => handlePhotoUpload(e, setPhotoBack)} />
            </div>
          </div>

          {errorMsg && (
             <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold flex items-center">
                <AlertTriangle size={18} className="mr-2"/> {errorMsg}
             </div>
           )}

          <div className="flex gap-3 pt-4">
             <button onClick={() => setStep('seller')} className="flex-1 py-3 bg-gray-100 rounded-lg text-gray-600 font-bold">Voltar</button>
             <button 
               onClick={handleFinishPurchase}
               className="flex-1 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 flex items-center justify-center shadow-md active:scale-95 transition-transform"
             >
               <CheckCircle size={18} className="mr-2"/> Confirmar Compra
             </button>
          </div>
        </div>
      )}

    </div>
  );
};