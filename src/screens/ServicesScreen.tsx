import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Scissors, Plus, Edit2, Trash2, X } from 'lucide-react';
import { Service } from '../types';

export const ServicesScreen: React.FC = () => {
  const { services, addService, updateService, removeService } = useData();
  
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    durationMinutes: '',
    category: ''
  });

  // Service Categories - same as in SalesScreen
  const serviceCategories = [
    { id: 'cabelos_corte', name: '💇‍♀️ Cabelos - Cortes e Finalizações' },
    { id: 'coloracao', name: '🎨 Coloração e Química Capilar' },
    { id: 'tratamentos', name: '💆‍♀️ Tratamentos Capilares' },
    { id: 'alisamentos', name: '🔥 Alisamentos' },
    { id: 'mega_hair', name: '💇‍♀️ Mega Hair / Extensões' },
    { id: 'sobrancelhas', name: '👁️ Design de Sobrancelhas' },
    { id: 'cilios', name: '✨ Cílios' },
    { id: 'unhas', name: '💅 Unhas - Manicure e Pedicure' },
    { id: 'maquiagem', name: '💄 Maquiagem' },
    { id: 'estetica', name: '💆‍♀️ Estética Facial e Corporal' }
  ];

  const openModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        price: service.price.toString(),
        durationMinutes: service.durationMinutes?.toString() || '',
        category: service.category || ''
      });
    } else {
      setEditingService(null);
      setFormData({ name: '', price: '', durationMinutes: '', category: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingService(null);
    setFormData({ name: '', price: '', durationMinutes: '', category: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.category) {
      alert('Preencha nome, preço e categoria');
      return;
    }

    const serviceData: Service = {
      id: editingService?.id || `service-${Date.now()}`,
      name: formData.name,
      price: parseFloat(formData.price),
      durationMinutes: formData.durationMinutes ? parseInt(formData.durationMinutes) : undefined,
      category: formData.category
    };

    if (editingService) {
      updateService(serviceData);
    } else {
      addService(serviceData);
    }

    closeModal();
  };

  const handleDelete = (serviceId: string) => {
    if (confirm('Deseja realmente excluir este serviço?')) {
      removeService(serviceId);
    }
  };

  // Group services by category
  const servicesByCategory = serviceCategories.map(cat => ({
    ...cat,
    services: services.filter(s => s.category === cat.id)
  })).filter(cat => cat.services.length > 0);

  // Services without category
  const uncategorizedServices = services.filter(s => !s.category);

  return (
    <div className="p-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-rose-900 flex items-center">
          <Scissors className="mr-2" /> Serviços ({services.length})
        </h2>
        <button
          onClick={() => openModal()}
          className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors flex items-center shadow-sm"
        >
          <Plus size={20} className="mr-1" /> Novo Serviço
        </button>
      </div>

      {/* Services by Category */}
      {servicesByCategory.map(category => (
        <div key={category.id} className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
            {category.name}
            <span className="ml-2 text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
              {category.services.length}
            </span>
          </h3>
          <div className="grid gap-3">
            {category.services.map((service) => (
              <div key={service.id} className="bg-white p-4 rounded-xl shadow-sm border border-rose-100 flex justify-between items-center hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{service.name}</h4>
                  {service.durationMinutes && (
                    <p className="text-xs text-gray-500 mt-1">⏱️ {service.durationMinutes} min</p>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-rose-50 px-3 py-1 rounded-full text-rose-700 font-bold">
                    R$ {service.price.toFixed(2)}
                  </div>
                  <button
                    onClick={() => openModal(service)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                    title="Editar"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Uncategorized Services */}
      {uncategorizedServices.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-600 mb-3 flex items-center">
            📋 Sem Categoria
            <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {uncategorizedServices.length}
            </span>
          </h3>
          <div className="grid gap-3">
            {uncategorizedServices.map((service) => (
              <div key={service.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{service.name}</h4>
                  {service.durationMinutes && (
                    <p className="text-xs text-gray-500 mt-1">⏱️ {service.durationMinutes} min</p>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-100 px-3 py-1 rounded-full text-gray-700 font-bold">
                    R$ {service.price.toFixed(2)}
                  </div>
                  <button
                    onClick={() => openModal(service)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                    title="Editar"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {services.length === 0 && (
        <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
          <Scissors size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="font-medium">Nenhum serviço cadastrado</p>
          <p className="text-sm mt-1">Clique em "Novo Serviço" para começar</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-xl font-bold text-gray-800">
                {editingService ? 'Editar Serviço' : 'Novo Serviço'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria *
                </label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Selecione a categoria...</option>
                  {serviceCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Serviço *
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Corte feminino"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full p-2 border rounded-lg"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duração (minutos)
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-lg"
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                  placeholder="Ex: 30"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-rose-600 text-white py-2 rounded-lg hover:bg-rose-700 transition-colors font-medium shadow-sm"
                >
                  {editingService ? 'Salvar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
