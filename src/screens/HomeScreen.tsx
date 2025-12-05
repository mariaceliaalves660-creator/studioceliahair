import React from 'react';
import { 
  ShoppingBag, Calendar, DollarSign, TrendingUp, Users, UserCheck, 
  Settings, GraduationCap, Scissors, Globe, ShoppingCart,
  Palette, Grid, AlertCircle, Clock, Bell
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useMaintenanceAlerts } from '../hooks/useMaintenanceAlerts';

interface HomeProps {
  onNavigate: (screen: string) => void;
}

export const HomeScreen: React.FC<HomeProps> = ({ onNavigate }) => {
  const { viewMode } = useData();
  const { alerts, stats } = useMaintenanceAlerts();

  const menuItems = [
    { id: 'products', label: 'Produtos Loja', icon: ShoppingBag, color: 'from-rose-500 to-pink-600' },
    { id: 'orders', label: 'Pedidos Online', icon: ShoppingCart, color: 'from-orange-500 to-amber-600' },
    { id: 'appointments', label: 'Agendamentos', icon: Calendar, color: 'from-blue-500 to-indigo-600' },
    { id: 'cashier', label: 'Caixa / PDV', icon: DollarSign, color: 'from-green-500 to-emerald-600' },
    { id: 'sales', label: 'Vendas', icon: TrendingUp, color: 'from-teal-500 to-cyan-600' },
    { id: 'staff', label: 'Equipe', icon: Users, color: 'from-purple-500 to-violet-600' },
    { id: 'clients', label: 'Clientes', icon: UserCheck, color: 'from-pink-500 to-rose-600', badge: stats.clientsAffected },
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

        {/* Alertas de Manutenção */}
        {stats.totalAlerts > 0 && (
          <div className="mb-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl shadow-lg p-5">
            <div className="flex items-start gap-4">
              <div className="bg-white/20 rounded-full p-3">
                <Bell size={28} className="animate-pulse" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  <AlertCircle size={20} />
                  Alertas de Manutenção
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-2xl font-bold">{stats.clientsAffected}</p>
                    <p className="text-xs text-white/80">Clientes com alertas</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-2xl font-bold text-red-100">{stats.overdueCount}</p>
                    <p className="text-xs text-white/80">Manutenções atrasadas</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-2xl font-bold text-yellow-100">{stats.upcomingCount}</p>
                    <p className="text-xs text-white/80">Próximas (5 dias)</p>
                  </div>
                </div>
                <p className="text-sm text-white/90 mb-3">
                  {stats.overdueCount > 0 
                    ? `⚠️ ${stats.overdueCount} cliente(s) com manutenção atrasada! Entre em contato urgente.`
                    : `🔔 ${stats.upcomingCount} cliente(s) precisam de manutenção nos próximos 5 dias.`
                  }
                </p>
                <button
                  onClick={() => onNavigate('clients')}
                  className="bg-white text-amber-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-white/90 transition-colors flex items-center gap-2"
                >
                  <Clock size={16} />
                  Ver Clientes com Alertas
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`bg-gradient-to-br ${item.color} text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex flex-col items-center justify-center text-center min-h-[140px] relative`}
              >
                {item.badge && item.badge > 0 && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                    {item.badge}
                  </span>
                )}
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
