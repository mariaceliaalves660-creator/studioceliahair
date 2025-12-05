import React from 'react';
import { 
  ShoppingBag, Calendar, DollarSign, TrendingUp, Users, UserCheck, 
  Settings, GraduationCap, Scissors, Globe, ShoppingCart,
  Palette, Grid
} from 'lucide-react';
import { useData } from '../context/DataContext';

interface HomeProps {
  onNavigate: (screen: string) => void;
}

export const HomeScreen: React.FC<HomeProps> = ({ onNavigate }) => {
  const { viewMode, cashierSessions } = useData();
  
  // Check if there's an open cashier session
  const hasOpenSession = cashierSessions?.some((s: any) => s.status === 'open');

  const menuItems = [
    { id: 'products', label: 'Produtos Loja', icon: ShoppingBag, color: 'from-rose-500 to-pink-600' },
    { id: 'orders', label: 'Pedidos Online', icon: ShoppingCart, color: 'from-orange-500 to-amber-600' },
    { id: 'appointments', label: 'Agendamentos', icon: Calendar, color: 'from-blue-500 to-indigo-600' },
    { id: 'cashier', label: 'Caixa / PDV', icon: DollarSign, color: 'from-green-500 to-emerald-600' },
    { id: 'sales', label: 'Vendas', icon: TrendingUp, color: 'from-teal-500 to-cyan-600' },
    { id: 'staff', label: 'Equipe', icon: Users, color: 'from-purple-500 to-violet-600' },
    { id: 'clients', label: 'Clientes', icon: UserCheck, color: 'from-pink-500 to-rose-600' },
    { id: 'courses-management', label: 'Gestão Cursos', icon: GraduationCap, color: 'from-indigo-500 to-purple-600' },
    { id: 'stored-hair', label: 'Cabelos Guardados', icon: Scissors, color: 'from-pink-600 to-rose-700' },
    { id: 'hair-business', label: 'Negócio Cabelos', icon: Globe, color: 'from-purple-600 to-indigo-700' },
    { id: 'manager', label: 'Gerenciamento', icon: Settings, color: 'from-gray-700 to-gray-900' },
  ];

  return (
    <div className="p-6 pb-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Grid className="w-10 h-10 text-gray-700 mr-3" />
            <h1 className="text-3xl font-bold text-gray-800">Menu Principal</h1>
          </div>
          <p className="text-gray-600">
            {viewMode === 'admin' ? 'Área Administrativa Completa' : 'Selecione uma opção abaixo'}
          </p>
        </div>

        {/* Warning message if no cashier session is open */}
        {viewMode === 'admin' && !hasOpenSession && (
          <div className="bg-amber-100 border-2 border-amber-400 rounded-xl p-4 mb-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <DollarSign className="text-amber-700" size={24} />
              <h3 className="text-lg font-bold text-amber-900">⚠️ Caixa Fechado</h3>
            </div>
            <p className="text-amber-800 mb-3">
              Para acessar as funcionalidades do sistema, você precisa <strong>abrir o caixa</strong> primeiro.
            </p>
            <button
              onClick={() => onNavigate('cashier')}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-6 rounded-lg transition"
            >
              Ir para o Caixa
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isLocked = viewMode === 'admin' && !hasOpenSession && item.id !== 'cashier';
            
            return (
              <button
                key={item.id}
                onClick={() => isLocked ? null : onNavigate(item.id)}
                disabled={isLocked}
                className={`bg-gradient-to-br ${item.color} text-white p-6 rounded-2xl shadow-lg transition-all flex flex-col items-center justify-center text-center min-h-[140px] relative ${
                  isLocked 
                    ? 'opacity-40 cursor-not-allowed' 
                    : 'hover:shadow-xl transform hover:scale-105'
                }`}
              >
                {isLocked && (
                  <div className="absolute top-2 right-2 bg-red-500 rounded-full p-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <Icon size={32} className="mb-3" />
                <span className="font-bold text-sm leading-tight">{item.label}</span>
                {isLocked && (
                  <span className="text-xs mt-2 opacity-75">🔒 Abra o caixa</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
