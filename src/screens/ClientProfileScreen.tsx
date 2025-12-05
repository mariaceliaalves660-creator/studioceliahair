import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { 
  ArrowLeft, User, Phone, Mail, Cake, MapPin, CreditCard, 
  Calendar, Package, ShoppingBag, Scissors, AlertCircle, Clock,
  CheckCircle, XCircle, Box, TrendingUp, Award, Gift, History
} from 'lucide-react';

interface ClientProfileScreenProps {
  clientId: string;
  onBack: () => void;
}

type TabType = 'info' | 'appointments' | 'stored' | 'purchases' | 'services';

export const ClientProfileScreen: React.FC<ClientProfileScreenProps> = ({ clientId, onBack }) => {
  const { clients, sales, appointments, storedHair } = useData();
  const [activeTab, setActiveTab] = useState<TabType>('info');

  const client = clients.find(c => c.id === clientId);

  // Calcular histórico completo
  const clientHistory = useMemo(() => {
    if (!client) return { sales: [], appointments: [], storedItems: [] };

    const clientSales = sales.filter(s => s.clientId === clientId);
    const clientAppointments = appointments.filter(a => a.clientId === clientId);
    const clientStoredItems = storedHair.filter(h => h.clientId === clientId);

    return {
      sales: clientSales,
      appointments: clientAppointments,
      storedItems: clientStoredItems
    };
  }, [client, sales, appointments, storedHair, clientId]);

  // Separar compras por tipo
  const purchasesByType = useMemo(() => {
    const products: any[] = [];
    const services: any[] = [];
    const courses: any[] = [];

    clientHistory.sales.forEach(sale => {
      sale.items.forEach(item => {
        const saleInfo = {
          ...item,
          saleId: sale.id,
          saleDate: sale.date,
          paymentMethod: sale.paymentMethod
        };

        if (item.type === 'product') products.push(saleInfo);
        else if (item.type === 'service') services.push(saleInfo);
        else if (item.type === 'course') courses.push(saleInfo);
      });
    });

    return { products, services, courses };
  }, [clientHistory.sales]);

  // Detectar serviços de manutenção e calcular próxima data
  const maintenanceAlerts = useMemo(() => {
    const alerts: any[] = [];
    const maintenanceKeywords = ['manutenção', 'manutencao', 'retoque', 'reparo', 'revisão', 'revisao'];

    purchasesByType.services.forEach(service => {
      const isMaintenanceService = maintenanceKeywords.some(keyword => 
        service.name.toLowerCase().includes(keyword)
      );

      if (isMaintenanceService) {
        const serviceDate = new Date(service.saleDate);
        const nextMaintenanceDate = new Date(serviceDate);
        nextMaintenanceDate.setMonth(nextMaintenanceDate.getMonth() + 3); // +3 meses

        const today = new Date();
        const daysUntilMaintenance = Math.ceil(
          (nextMaintenanceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        const shouldAlert = daysUntilMaintenance <= 5 && daysUntilMaintenance >= 0;
        const isOverdue = daysUntilMaintenance < 0;

        alerts.push({
          serviceName: service.name,
          serviceDate: serviceDate,
          nextMaintenanceDate,
          daysUntilMaintenance,
          shouldAlert,
          isOverdue
        });
      }
    });

    return alerts.sort((a, b) => a.daysUntilMaintenance - b.daysUntilMaintenance);
  }, [purchasesByType.services]);

  // Estatísticas gerais
  const stats = useMemo(() => {
    const totalSpent = clientHistory.sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalVisits = clientHistory.sales.length;
    const totalAppointments = clientHistory.appointments.length;
    const totalStoredItems = clientHistory.storedItems.length;

    return { totalSpent, totalVisits, totalAppointments, totalStoredItems };
  }, [clientHistory]);

  if (!client) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Cliente não encontrado</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg">
          Voltar
        </button>
      </div>
    );
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
        <button onClick={onBack} className="mb-4 flex items-center gap-2 hover:opacity-80">
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>

        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <User size={32} />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{client.name}</h1>
            {client.email && <p className="text-white/80 text-sm">{client.email}</p>}
            {client.phone && (
              <p className="flex items-center gap-2 text-white/90 mt-1">
                <Phone size={14} />
                {client.phone}
              </p>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-white/70 text-xs">Total Gasto</p>
            <p className="text-xl font-bold">{formatCurrency(stats.totalSpent)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-white/70 text-xs">Visitas</p>
            <p className="text-xl font-bold">{stats.totalVisits}</p>
          </div>
        </div>

        {/* Alertas de Manutenção */}
        {maintenanceAlerts.length > 0 && maintenanceAlerts.some(a => a.shouldAlert || a.isOverdue) && (
          <div className="mt-4 bg-amber-500 text-white rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-sm mb-2">⚠️ Alertas de Manutenção</p>
                {maintenanceAlerts
                  .filter(a => a.shouldAlert || a.isOverdue)
                  .map((alert, idx) => (
                    <div key={idx} className="text-xs mb-1">
                      <strong>{alert.serviceName}</strong>
                      {alert.isOverdue ? (
                        <span className="text-red-100"> - Atrasada há {Math.abs(alert.daysUntilMaintenance)} dias!</span>
                      ) : (
                        <span> - Vence em {alert.daysUntilMaintenance} dias ({formatDate(alert.nextMaintenanceDate)})</span>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="flex overflow-x-auto">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 min-w-[100px] px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'info'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            <User size={16} className="inline mr-1" />
            Dados
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex-1 min-w-[100px] px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'appointments'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            <Calendar size={16} className="inline mr-1" />
            Agendamentos
            {stats.totalAppointments > 0 && (
              <span className="ml-1 bg-purple-100 text-purple-600 text-xs px-1.5 py-0.5 rounded-full">
                {stats.totalAppointments}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('stored')}
            className={`flex-1 min-w-[100px] px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'stored'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            <Box size={16} className="inline mr-1" />
            Guardados
            {stats.totalStoredItems > 0 && (
              <span className="ml-1 bg-purple-100 text-purple-600 text-xs px-1.5 py-0.5 rounded-full">
                {stats.totalStoredItems}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('purchases')}
            className={`flex-1 min-w-[100px] px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'purchases'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            <ShoppingBag size={16} className="inline mr-1" />
            Compras
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`flex-1 min-w-[100px] px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'services'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            <Scissors size={16} className="inline mr-1" />
            Serviços
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Aba: Dados Pessoais */}
        {activeTab === 'info' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User size={18} />
                Informações Pessoais
              </h2>
              <div className="space-y-3">
                {client.email && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail size={16} className="text-gray-400" />
                    <span className="text-sm">{client.email}</span>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone size={16} className="text-gray-400" />
                    <span className="text-sm">{client.phone}</span>
                  </div>
                )}
                {client.birthday && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Cake size={16} className="text-gray-400" />
                    <span className="text-sm">{client.birthday}</span>
                  </div>
                )}
                {client.cpf && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <CreditCard size={16} className="text-gray-400" />
                    <span className="text-sm">{client.cpf}</span>
                  </div>
                )}
                {(client.city || client.state) && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <MapPin size={16} className="text-gray-400" />
                    <span className="text-sm">
                      {client.city}{client.city && client.state && ', '}{client.state}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Estatísticas */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp size={18} />
                Estatísticas
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{stats.totalVisits}</p>
                  <p className="text-xs text-gray-600">Compras</p>
                </div>
                <div className="text-center p-3 bg-pink-50 rounded-lg">
                  <p className="text-2xl font-bold text-pink-600">{formatCurrency(stats.totalSpent)}</p>
                  <p className="text-xs text-gray-600">Total Gasto</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{stats.totalAppointments}</p>
                  <p className="text-xs text-gray-600">Agendamentos</p>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-lg">
                  <p className="text-2xl font-bold text-amber-600">{stats.totalStoredItems}</p>
                  <p className="text-xs text-gray-600">Itens Guardados</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Aba: Agendamentos */}
        {activeTab === 'appointments' && (
          <div className="space-y-3">
            {clientHistory.appointments.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <Calendar size={48} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">Nenhum agendamento encontrado</p>
              </div>
            ) : (
              clientHistory.appointments
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(appointment => (
                  <div key={appointment.id} className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-purple-600" />
                        <span className="font-semibold text-gray-800">
                          {formatDate(appointment.date)} às {appointment.time}
                        </span>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          appointment.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : appointment.status === 'cancelled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {appointment.status === 'completed'
                          ? 'Concluído'
                          : appointment.status === 'cancelled'
                          ? 'Cancelado'
                          : 'Agendado'}
                      </span>
                    </div>
                    {appointment.notes && (
                      <p className="text-sm text-gray-600 mt-2">{appointment.notes}</p>
                    )}
                  </div>
                ))
            )}
          </div>
        )}

        {/* Aba: Itens Guardados */}
        {activeTab === 'stored' && (
          <div className="space-y-3">
            {clientHistory.storedItems.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <Box size={48} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">Nenhum item guardado</p>
              </div>
            ) : (
              clientHistory.storedItems
                .sort((a, b) => new Date(b.dateStored).getTime() - new Date(a.dateStored).getTime())
                .map(item => (
                  <div key={item.id} className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-start gap-3">
                      <Box size={20} className="text-purple-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{item.productName || 'Item'}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Quantidade: {item.quantity} {item.unit}
                        </p>
                        {item.location && (
                          <p className="text-sm text-gray-600">
                            <MapPin size={12} className="inline mr-1" />
                            {item.location}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          Guardado em {formatDate(item.dateStored)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {/* Aba: Histórico de Compras (Produtos) */}
        {activeTab === 'purchases' && (
          <div className="space-y-3">
            {purchasesByType.products.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <ShoppingBag size={48} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">Nenhuma compra de produto</p>
              </div>
            ) : (
              purchasesByType.products
                .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime())
                .map((item, idx) => (
                  <div key={idx} className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-start gap-3">
                      <Package size={20} className="text-amber-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{item.name}</h3>
                        <p className="text-sm text-gray-600">
                          Quantidade: {item.quantity} {item.unit} • {formatCurrency(item.price * item.quantity)}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatDate(item.saleDate)} • {item.paymentMethod}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {/* Aba: Histórico de Serviços */}
        {activeTab === 'services' && (
          <div className="space-y-3">
            {/* Alertas de Manutenção no topo */}
            {maintenanceAlerts.length > 0 && (
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg shadow-lg p-4 mb-4">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Clock size={18} />
                  Status de Manutenção
                </h3>
                <div className="space-y-2">
                  {maintenanceAlerts.map((alert, idx) => (
                    <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="font-semibold text-sm">{alert.serviceName}</p>
                      <p className="text-xs mt-1">
                        Realizado em: {formatDate(alert.serviceDate)}
                      </p>
                      <p className="text-xs">
                        Próxima manutenção: {formatDate(alert.nextMaintenanceDate)}
                      </p>
                      {alert.isOverdue ? (
                        <div className="mt-2 flex items-center gap-2 text-red-100">
                          <XCircle size={14} />
                          <span className="text-xs font-bold">Atrasada há {Math.abs(alert.daysUntilMaintenance)} dias!</span>
                        </div>
                      ) : alert.shouldAlert ? (
                        <div className="mt-2 flex items-center gap-2 text-yellow-100">
                          <AlertCircle size={14} />
                          <span className="text-xs font-bold">Faltam {alert.daysUntilMaintenance} dias</span>
                        </div>
                      ) : (
                        <div className="mt-2 flex items-center gap-2 text-green-100">
                          <CheckCircle size={14} />
                          <span className="text-xs">Em dia (faltam {alert.daysUntilMaintenance} dias)</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lista de todos os serviços */}
            {purchasesByType.services.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <Scissors size={48} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">Nenhum serviço realizado</p>
              </div>
            ) : (
              purchasesByType.services
                .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime())
                .map((item, idx) => {
                  const maintenanceAlert = maintenanceAlerts.find(a => 
                    a.serviceName === item.name && formatDate(a.serviceDate) === formatDate(item.saleDate)
                  );

                  return (
                    <div key={idx} className="bg-white rounded-lg shadow p-4">
                      <div className="flex items-start gap-3">
                        <Scissors size={20} className="text-pink-600 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold text-gray-800">{item.name}</h3>
                            {maintenanceAlert && (
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                maintenanceAlert.isOverdue
                                  ? 'bg-red-100 text-red-700'
                                  : maintenanceAlert.shouldAlert
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {maintenanceAlert.isOverdue ? '⚠️ Atrasada' : maintenanceAlert.shouldAlert ? '⏰ Próxima' : '✓ Em dia'}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {formatCurrency(item.price)} • {item.staffName}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {formatDate(item.saleDate)} • {item.paymentMethod}
                          </p>
                          {maintenanceAlert && (
                            <div className="mt-2 text-xs bg-amber-50 text-amber-800 p-2 rounded">
                              Próxima manutenção: {formatDate(maintenanceAlert.nextMaintenanceDate)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
