import React from 'react';
import { 
  Package, Calendar, ShoppingBag, 
  DollarSign, Users, User, ShieldCheck, Wand2, ArrowRight, Scissors, GraduationCap, BookOpen, Box, MessageSquare, Instagram, MapPin // Whatsapp substituído por MessageSquare
} from 'lucide-react';
import { useData } from '../context/DataContext';

interface HomeProps {
  onNavigate: (screen: string) => void;
}

export const HomeScreen: React.FC<HomeProps> = ({ onNavigate }) => {
  const { viewMode, currentAdmin } = useData();

  const adminItems = [
    { id: 'products', label: 'Estoque / Produtos', icon: Package, color: 'bg-amber-100 text-amber-600' },
    { id: 'orders', label: 'Pedidos Online', icon: ShoppingBag, color: 'bg-rose-100 text-rose-600' },
    { id: 'appointments', label: 'Agendamentos', icon: Calendar, color: 'bg-blue-100 text-blue-600' },
    { id: 'sales', label: 'Vendas (PDV)', icon: ShoppingBag, color: 'bg-emerald-100 text-emerald-600' },
    { id: 'cashier', label: 'Caixa', icon: DollarSign, color: 'bg-purple-100 text-purple-600' },
    { id: 'staff', label: 'Colaboradores', icon: Users, color: 'bg-indigo-100 text-indigo-600' },
    { id: 'clients', label: 'Clientes', icon: User, color: 'bg-pink-100 text-pink-600' },
    { id: 'hair-business', label: 'Gestão Cabelos', icon: Scissors, color: 'bg-fuchsia-100 text-fuchsia-600' }, 
    { id: 'courses-management', label: 'Gestão de Cursos', icon: BookOpen, color: 'bg-cyan-100 text-cyan-600' },
    { id: 'manager', label: 'Gerente (Acesso Total)', icon: ShieldCheck, color: 'bg-gray-100 text-gray-600', superAdminOnly: true },
    { id: 'stored-hair', label: 'Cabelo Guardado', icon: Box, color: 'bg-purple-100 text-purple-600', fullWidth: true }, // ALTERADO: Simulador IA para Cabelo Guardado
  ];

  if (viewMode === 'client') {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[70vh] text-center">
        <div className="bg-rose-100 p-4 rounded-full mb-6 animate-pulse">
           <ShoppingBag size={48} className="text-rose-600" />
        </div>
        <h1 className="text-3xl font-serif text-rose-900 mb-2">Loja & Studio Célia Hair</h1>
        <p className="text-gray-600 mb-8 max-w-xs mx-auto">
          Confira nossos produtos, cursos e cabelos. Faça seu pedido online e transforme seu visual.
        </p>

        <button 
          onClick={() => onNavigate('products')}
          className="w-full bg-rose-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-rose-700 transition transform hover:scale-105 flex items-center justify-center mb-4"
        >
           <Package className="mr-2" /> Catálogo de Produtos e Cursos
        </button>

        {/* NEW: Fale com nossa equipe section */}
        <div className="w-full max-w-sm mt-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Fale com nossa equipe</h3>
            <div className="grid grid-cols-3 gap-4">
                <a 
                    href="https://wa.me/message/UZMM3WLPPUWRC1" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-4 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-colors shadow-sm"
                >
                    <MessageSquare size={28} className="mb-1" /> {/* Whatsapp substituído por MessageSquare */}
                    <span className="text-xs font-medium">WhatsApp</span>
                </a>
                <a 
                    href="https://www.instagram.com/studioceliahairoficial/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-4 rounded-xl bg-pink-50 text-pink-700 hover:bg-pink-100 transition-colors shadow-sm"
                >
                    <Instagram size={28} className="mb-1" />
                    <span className="text-xs font-medium">Instagram</span>
                </a>
                <a 
                    href="https://maps.app.goo.gl/nhyHFPApF8W3WGtU7" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-4 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors shadow-sm"
                >
                    <MapPin size={28} className="mb-1" />
                    <span className="text-xs font-medium">Localização</span>
                </a>
            </div>
        </div>

        {/* REMOVIDO: Botão "Testar Simulador IA" */}
        {/*
        <button 
          onClick={() => onNavigate('ai-studio')}
          className="w-full bg-white text-fuchsia-600 border border-fuchsia-200 py-4 rounded-2xl font-bold text-lg shadow-sm hover:bg-fuchsia-50 transition flex items-center justify-center"
        >
           <Wand2 className="mr-2" /> Testar Simulador IA
        </button>
        */}
      </div>
    );
  }

  // Admin View - Filter items based on permissions
  const availableItems = adminItems.filter(item => {
    if (!currentAdmin) return false;
    
    // Superadmin sees everything
    if (currentAdmin.role === 'superadmin') return true;

    // Items strictly for superadmin (like creating other admins)
    if (item.superAdminOnly) return false;

    // For other managers, check permissions list
    return currentAdmin.permissions?.includes(item.id);
  });

  return (
    <div className="p-4">
      <div className="text-center mb-6">
        <div className="inline-block bg-gray-800 text-white text-xs px-2 py-1 rounded-full mb-2 uppercase tracking-widest">Painel Administrativo</div>
        <h1 className="text-2xl font-serif text-gray-800">Célia Hair - Gestão</h1>
        {currentAdmin?.role !== 'superadmin' && (
           <p className="text-sm text-gray-500 mt-1">Acesso Personalizado: {currentAdmin?.name}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {availableItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`${item.fullWidth ? 'col-span-2' : ''} ${item.color} 
            flex flex-col items-center justify-center p-5 rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all border border-white/50`}
          >
            <item.icon size={28} className="mb-2" />
            <span className="font-medium text-sm leading-tight">{item.label}</span>
          </button>
        ))}
        {availableItems.length === 0 && (
          <div className="col-span-2 text-center py-10 text-gray-400">
            <p>Nenhum módulo disponível para seu perfil.</p>
          </div>
        )}
      </div>
    </div>
  );
};