import { useMemo } from 'react';
import { useData } from '../context/DataContext';

export interface MaintenanceAlert {
  clientId: string;
  clientName: string;
  serviceName: string;
  serviceDate: Date;
  nextMaintenanceDate: Date;
  daysUntilMaintenance: number;
  shouldAlert: boolean; // Alerta nos próximos 5 dias
  isOverdue: boolean; // Manutenção atrasada
}

export const useMaintenanceAlerts = () => {
  const { sales, clients } = useData();

  const maintenanceAlerts = useMemo(() => {
    const alerts: MaintenanceAlert[] = [];
    const maintenanceKeywords = [
      'manutenção', 'manutencao', 'manutencion',
      'retoque', 'reparo', 'revisão', 'revisao',
      'mega hair', 'megahair', 'aplique', 'extensão', 'extensao'
    ];

    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (item.type !== 'service') return;

        const isMaintenanceService = maintenanceKeywords.some(keyword =>
          item.name.toLowerCase().includes(keyword)
        );

        if (isMaintenanceService) {
          const serviceDate = new Date(sale.date);
          const nextMaintenanceDate = new Date(serviceDate);
          nextMaintenanceDate.setMonth(nextMaintenanceDate.getMonth() + 3); // +3 meses

          const today = new Date();
          const daysUntilMaintenance = Math.ceil(
            (nextMaintenanceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );

          const shouldAlert = daysUntilMaintenance <= 5 && daysUntilMaintenance >= 0;
          const isOverdue = daysUntilMaintenance < 0;

          // Só inclui se estiver próximo ou atrasado
          if (shouldAlert || isOverdue) {
            alerts.push({
              clientId: sale.clientId,
              clientName: sale.clientName,
              serviceName: item.name,
              serviceDate,
              nextMaintenanceDate,
              daysUntilMaintenance,
              shouldAlert,
              isOverdue
            });
          }
        }
      });
    });

    // Ordenar por urgência (atrasados primeiro, depois próximos)
    return alerts.sort((a, b) => {
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      return a.daysUntilMaintenance - b.daysUntilMaintenance;
    });
  }, [sales, clients]);

  // Agrupar alertas por cliente
  const alertsByClient = useMemo(() => {
    const grouped: Record<string, MaintenanceAlert[]> = {};
    maintenanceAlerts.forEach(alert => {
      if (!grouped[alert.clientId]) {
        grouped[alert.clientId] = [];
      }
      grouped[alert.clientId].push(alert);
    });
    return grouped;
  }, [maintenanceAlerts]);

  // Estatísticas
  const stats = useMemo(() => {
    const totalAlerts = maintenanceAlerts.length;
    const overdueCount = maintenanceAlerts.filter(a => a.isOverdue).length;
    const upcomingCount = maintenanceAlerts.filter(a => a.shouldAlert && !a.isOverdue).length;
    const clientsAffected = Object.keys(alertsByClient).length;

    return {
      totalAlerts,
      overdueCount,
      upcomingCount,
      clientsAffected
    };
  }, [maintenanceAlerts, alertsByClient]);

  return {
    alerts: maintenanceAlerts,
    alertsByClient,
    stats
  };
};
