import React, { useState } from 'react';
import { DataProvider, useData } from './context/DataContext';
import { HomeScreen } from './screens/HomeScreen';
import { ProductsScreen } from './screens/ProductsScreen';
import { AppointmentsScreen } from './screens/AppointmentsScreen';
import { SalesScreen } from './screens/SalesScreen';
import { CashierScreen } from './screens/CashierScreen';
import { StaffScreen } from './screens/StaffScreen';
import { ClientsScreen } from './screens/ClientsScreen';
import { ManagerScreen } from './screens/ManagerScreen';
import { AIStudioScreen } from './screens/AIStudioScreen';
import { OrdersScreen } from './screens/OrdersScreen';
import { SocialHairCalculatorScreen } from './screens/SocialHairCalculatorScreen'; 
import { HairBusinessScreen } from './screens/HairBusinessScreen'; 
import { StudentAreaScreen } from './screens/StudentAreaScreen'; 
import { CoursesManagementScreen } from './screens/CoursesManagementScreen';
import { StoredHairScreen } from './screens/StoredHairScreen'; // NEW: Import StoredHairScreen
import { ConnectionStatus } from './components/ConnectionStatus'; // NEW: Connection status indicator
import './utils/migrateData'; // Load migration tools into window
import { Home, ArrowLeft, LogOut, Lock, User, Key, Users, ShoppingBag, GraduationCap, MessageCircle } from 'lucide-react';

const AppContent: React.FC = () => {
  const { viewMode, setViewMode, socialUsers, setCurrentUser, currentUser, adminUsers, setCurrentAdmin, currentAdmin, cashierSessions } = useData();
  const [currentScreen, setCurrentScreen] = useState('home');
  
  // Check if there's an open cashier session
  const hasOpenSession = () => {
    return cashierSessions?.some((s: any) => s.status === 'open');
  };

  // Setup global navigation function for ManagerScreen quick access
  React.useEffect(() => {
    (window as any).__navigate = (screen: string) => {
      setCurrentScreen(screen);
    };
    return () => {
      delete (window as any).__navigate;
    };
  }, []);

  // Mode Selector / Login State
  const [showModeSelector, setShowModeSelector] = useState(true);
  const [loginMode, setLoginMode] = useState<'admin' | 'social' | null>(null); // 'admin' or 'social'
  
  // Login Credentials
  const [username, setUsername] = useState(''); // Email for admin, username for social
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (loginMode === 'admin') {
      const admin = adminUsers.find(u => u.email === username && u.password === password);
      
      if (admin) {
        setViewMode('admin');
        setCurrentAdmin(admin);
        setLoginMode(null);
        setShowModeSelector(false);
        setCurrentScreen('home');
        setUsername('');
        setPassword('');
      } else {
        setLoginError('Email ou senha de administrador incorretos.');
      }
    } else if (loginMode === 'social') {
      const user = socialUsers.find(u => u.username === username && u.password === password);
      if (user) {
        setViewMode('social');
        setCurrentUser(user);
        setLoginMode(null);
        setShowModeSelector(false);
        setCurrentScreen('social-calc'); // Direct to calculator
        setUsername('');
        setPassword('');
      } else {
        setLoginError('Usuário ou senha incorretos.');
      }
    }
  };

  const handleLogout = () => {
    setViewMode('client'); 
    setCurrentUser(null);
    setCurrentAdmin(null);
    setShowModeSelector(true);
    setCurrentScreen('home');
  };

  if (showModeSelector) {
    if (loginMode) {
      return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 animate-fade-in">
           <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <button onClick={() => { setLoginMode(null); setLoginError(''); }} className="text-gray-500 hover:text-gray-800">
                  <ArrowLeft size={24} />
                </button>
                <div className="flex flex-col items-center flex-1 mr-6">
                   <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-800 mb-2">
                     {loginMode === 'admin' ? <Lock size={24} /> : <Users size={24} />}
                   </div>
                   <h2 className="font-bold text-gray-800">
                     {loginMode === 'admin' ? 'Acesso Administrativo' : 'Acesso Avaliador'}
                   </h2>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                     {loginMode === 'admin' ? 'Email' : 'Usuário'}
                   </label>
                   <div className="relative">
                     <User className="absolute left-3 top-3 text-gray-400" size={18} />
                     <input 
                       type={loginMode === 'admin' ? 'email' : 'text'} 
                       required
                       className="w-full pl-10 p-3 border rounded-xl focus:ring-2 focus:ring-gray-800 outline-none"
                       placeholder={loginMode === 'admin' ? 'admin@exemplo.com' : 'Seu usuário'}
                       value={username}
                       onChange={e => setUsername(e.target.value)}
                     />
                   </div>
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Senha</label>
                   <div className="relative">
                     <Key className="absolute left-3 top-3 text-gray-400" size={18} />
                     <input 
                       type="password" 
                       required
                       className="w-full pl-10 p-3 border rounded-xl focus:ring-2 focus:ring-gray-800 outline-none"
                       placeholder="••••••••"
                       value={password}
                       onChange={e => setPassword(e.target.value)}
                     />
                   </div>
                </div>

                {loginError && (
                  <div className="text-red-500 text-sm font-bold text-center bg-red-50 p-2 rounded-lg">
                    {loginError}
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-black transition"
                >
                  Entrar
                </button>
              </form>
           </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-rose-50 flex flex-col items-center justify-center p-6 animate-fade-in">
         <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-2xl text-center">
            <h1 className="font-serif text-3xl text-rose-900 leading-tight">LOJA & STUDIO</h1>
            <p className="text-lg font-medium text-gray-600 -mt-1 mb-8">Célia Hair</p>
            
            <button 
              onClick={() => { setViewMode('client'); setShowModeSelector(false); setCurrentScreen('products'); }}
              className="w-full bg-rose-600 text-white py-4 rounded-xl font-bold text-lg mb-4 hover:bg-rose-700 transition shadow-lg flex items-center justify-center"
            >
              <ShoppingBag size={18} className="mr-2" /> Produtos / Loja
            </button>
            
            <button 
              onClick={() => { setViewMode('client'); setShowModeSelector(false); setCurrentScreen('student-area'); }}
              className="w-full bg-blue-50 text-blue-700 border border-blue-100 py-4 rounded-xl font-bold text-lg mb-4 hover:bg-blue-100 transition flex items-center justify-center"
            >
              <GraduationCap size={18} className="mr-2" /> Área do Aluno / Cursos
            </button>
            
            <button 
              onClick={() => setLoginMode('social')}
              className="w-full bg-purple-50 text-purple-700 border border-purple-100 py-4 rounded-xl font-bold text-lg mb-4 hover:bg-purple-100 transition flex items-center justify-center"
            >
              <Users size={18} className="mr-2" /> Sou Avaliador/Parceiro
            </button>

            <button 
              onClick={() => setLoginMode('admin')}
              className="w-full bg-white text-gray-700 border border-gray-200 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition flex items-center justify-center"
            >
              <Lock size={18} className="mr-2" /> Área Restrita (Admin)
            </button>

            {/* Seção de Contato */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-bold text-gray-700 mb-4">Fale com Nossa Equipe</h3>
              <div className="flex gap-3">
                <a
                  href="https://wa.me/message/UZMM3WLPPUWRC1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2 text-sm font-bold shadow-md"
                >
                  <MessageCircle size={18} />
                  <span>WhatsApp</span>
                </a>
                <a
                  href="https://instagram.com/studioceliahairoficial/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition flex items-center justify-center gap-2 text-sm font-bold shadow-md"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>Instagram</span>
                </a>
              </div>
            </div>
         </div>
      </div>
    );
  }

  const renderScreen = () => {
    // If social mode, restrict to calculator
    if (viewMode === 'social') {
      return <SocialHairCalculatorScreen />;
    }

    // ADMIN MODE: Force cashier if no open session (except on home or cashier screen)
    if (viewMode === 'admin' && !hasOpenSession() && currentScreen !== 'home' && currentScreen !== 'cashier') {
      return <CashierScreen />;
    }

    switch (currentScreen) {
      case 'home': return <HomeScreen onNavigate={setCurrentScreen} />;
      case 'products': return <ProductsScreen />;
      case 'orders': return <OrdersScreen />;
      case 'appointments': return <AppointmentsScreen />;
      case 'sales': return <SalesScreen />;
      case 'cashier': return <CashierScreen />;
      case 'staff': return <StaffScreen />;
      case 'clients': return <ClientsScreen />;
      case 'manager': return <ManagerScreen />;
      case 'ai-studio': return <AIStudioScreen />;
      case 'hair-business': return <HairBusinessScreen />;
      case 'student-area': return <StudentAreaScreen />;
      case 'courses-management': return <CoursesManagementScreen />;
      case 'stored-hair': return <StoredHairScreen />; // NEW: Add StoredHairScreen
      default: return <HomeScreen onNavigate={setCurrentScreen} />;
    }
  };

  const handleBack = () => {
    // If coming from Student Area (Login screen), go back to Mode Selector
    if (currentScreen === 'student-area' && !currentUser) {
        setShowModeSelector(true);
        setCurrentScreen('home');
        return;
    }
    
    // If in client mode and not on home, go back to mode selector
    if (viewMode === 'client' && currentScreen !== 'home') {
        setShowModeSelector(true);
        setCurrentScreen('home');
        return;
    }
    
    // If admin mode, go to home (admin menu)
    setCurrentScreen('home');
  };

  return (
    <div className="min-h-screen bg-rose-50 flex justify-center">
        {/* Connection Status Indicator */}
        <ConnectionStatus />
        
        {/* Changed max-w-md to responsive classes: w-full md:max-w-full */}
        <div className="w-full bg-white min-h-screen shadow-2xl relative flex flex-col">
          {/* Header */}
          <header className={`border-b border-rose-100 p-4 sticky top-0 z-10 flex items-center justify-between shadow-sm ${
            viewMode === 'admin' ? 'bg-gray-900 text-white' : 
            viewMode === 'social' ? 'bg-purple-900 text-white' : 
            'bg-white text-rose-900'
          }`}>
            <div className="flex items-center">
               {/* Show Logout instead of Back if on Home or Social Mode Root */}
               {(currentScreen === 'home' || viewMode === 'social') ? (
                 <button 
                  onClick={handleLogout}
                  className={`p-2 rounded-full transition-colors mr-2 ${viewMode === 'admin' ? 'hover:bg-gray-700' : 'hover:bg-rose-50/20'}`}
                  title="Sair / Trocar Conta"
                >
                  <LogOut size={20} />
                </button>
               ) : (
                <button 
                  onClick={handleBack}
                  className={`p-2 rounded-full transition-colors mr-2 ${viewMode === 'admin' ? 'hover:bg-gray-700' : 'hover:bg-rose-50'}`}
                >
                  <ArrowLeft size={24} />
                </button>
              )}
              <div className="flex flex-col">
                 <h1 className="font-serif font-bold text-lg leading-tight">LOJA & STUDIO</h1>
                 <span className="text-xs font-medium leading-none -mt-1">Célia Hair</span>
                 {viewMode === 'admin' && currentAdmin && (
                   <span className="text-[10px] uppercase opacity-70 tracking-wider mt-1">
                     {currentAdmin.role === 'manager' ? 'Gerente' : 'Admin Geral'}
                   </span>
                 )}
              </div>
            </div>
            
            {viewMode !== 'social' && currentScreen !== 'home' && (
              <button 
                onClick={handleBack}
                className={`p-2 rounded-full transition-colors ${viewMode === 'admin' ? 'hover:bg-gray-700' : 'hover:bg-rose-50'}`}
              >
                <Home size={24} />
              </button>
            )}
          </header>

          {/* Main Content */}
          <main className="flex-1 bg-gray-50/30">
            {renderScreen()}
          </main>
        </div>
      </div>
  );
}

const App: React.FC = () => {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
};

export default App;