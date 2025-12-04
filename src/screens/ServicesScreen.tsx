import React from 'react';
import { useData } from '../context/DataContext';
import { Scissors } from 'lucide-react';

export const ServicesScreen: React.FC = () => {
  const { services } = useData();

  return (
    <div className="p-4 pb-20">
      <h2 className="text-2xl font-bold text-rose-900 mb-6 flex items-center">
        <Scissors className="mr-2" /> Serviços Disponíveis
      </h2>
      
      <div className="grid gap-3">
        {services.map((service) => (
          <div key={service.id} className="bg-white p-4 rounded-xl shadow-sm border border-rose-100 flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-gray-800">{service.name}</h3>
              {service.durationMinutes && <p className="text-xs text-gray-500">{service.durationMinutes} min</p>}
            </div>
            <div className="bg-rose-50 px-3 py-1 rounded-full text-rose-700 font-bold">
              R$ {service.price.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
