import React from 'react';
import { Cloud, CloudOff, Wifi, WifiOff } from 'lucide-react';
import { useSupabaseStatus } from '../hooks/useSupabaseSync';

export const ConnectionStatus: React.FC = () => {
  const { isConnected, isConfigured } = useSupabaseStatus();

  if (!isConfigured) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <div className="bg-amber-100 border border-amber-300 text-amber-800 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm">
          <CloudOff size={16} />
          <span className="font-medium">Modo Local</span>
          <span className="text-xs opacity-75">(Dados no dispositivo)</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {isConnected ? (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-800 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm animate-fade-in">
          <Cloud size={16} className="animate-pulse" />
          <Wifi size={16} />
          <span className="font-medium">Online - Tempo Real</span>
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
        </div>
      ) : (
        <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm">
          <CloudOff size={16} />
          <WifiOff size={16} />
          <span className="font-medium">Sem Conexão</span>
          <span className="text-xs opacity-75">(Usando cache local)</span>
        </div>
      )}
    </div>
  );
};
