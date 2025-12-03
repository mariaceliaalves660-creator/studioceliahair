import React from 'react';
import { X, Box, Scale, Ruler, Tag, Copy, CheckCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Client, StoredHair } from '../types';

interface ClientStoredHairProps {
  client: Client;
  onClose: () => void;
}

export const ClientStoredHair: React.FC<ClientStoredHairProps> = ({ client, onClose }) => {
  const { storedHair } = useData();

  const clientHair = storedHair.filter(h => h.clientId === client.id)
                               .sort((a, b) => new Date(b.dateStored).getTime() - new Date(a.dateStored).getTime());

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
      <div className="bg-white w-full md:max-w-md h-[90vh] md:h-auto md:max-h-[85vh] rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="bg-purple-600 p-4 flex justify-between items-center text-white shrink-0">
          <h3 className="font-bold flex items-center text-lg">
            <Box className="mr-2" /> Meu Cabelo Guardado
          </h3>
          <button onClick={onClose} className="hover:bg-purple-500 rounded-full p-1">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4">
          {clientHair.length === 0 ? (
            <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-gray-100">
              <Box size={48} className="mx-auto mb-2 opacity-20" />
              <p>Você não tem nenhum cabelo guardado conosco.</p>
            </div>
          ) : (
            clientHair.map(hair => (
              <div key={hair.id} className={`bg-white border rounded-xl p-4 shadow-sm flex flex-col md:flex-row justify-between items-start gap-4 ${hair.status === 'delivered' ? 'opacity-70 bg-gray-50 border-gray-100' : 'border-purple-100'}`}>
                <div className="flex items-start flex-1">
                  {hair.photoUrl && <img src={hair.photoUrl} alt="Cabelo Guardado" className="w-20 h-20 object-cover rounded-lg mr-4 bg-gray-100"/>}
                  <div>
                    <h5 className="font-bold text-gray-800">{hair.clientName}</h5>
                    <p className="text-xs text-gray-500">Guardado em: {new Date(hair.dateStored).toLocaleDateString('pt-BR')}</p>
                    {hair.dateDelivered && <p className="text-xs text-green-600 font-medium">Entregue em: {new Date(hair.dateDelivered).toLocaleDateString('pt-BR')}</p>}
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full flex items-center"><Scale size={10} className="mr-1"/> {hair.weight} {hair.weightUnit}</span>
                      <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full flex items-center"><Ruler size={10} className="mr-1"/> {hair.length} cm</span>
                    </div>
                    {hair.notes && <p className="text-xs text-gray-400 mt-2 italic">Obs: {hair.notes}</p>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${hair.status === 'stored' ? 'bg-purple-200 text-purple-800' : 'bg-green-200 text-green-800'}`}>
                    {hair.status === 'stored' ? 'Produto Guardado' : 'Cabelo Entregue'}
                  </span>
                  {hair.status === 'stored' && hair.deliveryCode && (
                    <div className="mt-3 bg-gray-100 p-2 rounded-lg text-xs border border-gray-200 flex items-center justify-between">
                      <span className="font-bold text-gray-700">CÓDIGO: {hair.deliveryCode}</span>
                      <button 
                          onClick={() => navigator.clipboard.writeText(hair.deliveryCode || '')}
                          className="ml-3 p-1 rounded-full hover:bg-gray-200 text-gray-600"
                          title="Copiar código"
                      >
                          <Copy size={14}/>
                      </button>
                    </div>
                  )}
                  {hair.status === 'delivered' && (
                    <div className="mt-3 bg-green-100 p-2 rounded-lg text-xs border border-green-200 flex items-center justify-center">
                      <CheckCircle size={14} className="mr-1"/> Entregue
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t bg-white shrink-0">
          <button onClick={onClose} className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};