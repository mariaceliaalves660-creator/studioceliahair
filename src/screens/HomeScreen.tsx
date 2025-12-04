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
  const { viewMode } = useData();

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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`bg-gradient-to-br ${item.color} text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex flex-col items-center justify-center text-center min-h-[140px]`}
              >
                <Icon size={32} className="mb-3" />
                <span className="font-bold text-sm leading-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
