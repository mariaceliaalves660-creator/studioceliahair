import React, { useState, useRef } from 'react';
import { useData } from '../context/DataContext';
import { Box, Camera, Ruler, Scale, Tag, CheckCircle, Edit2, Trash2, Save, X, Copy, AlertTriangle } from 'lucide-react';
import { StoredHair, UnitType } from '../types';

export const StoredHairScreen: React.FC = () => {
  const { clients, storedHair, addStoredHair, updateStoredHair, removeStoredHair } = useData();

  // --- Stored Hair Form State ---
  const [selectedClientForStoredHair, setSelectedClientForStoredHair] = useState('');
  const [storedHairDate, setStoredHairDate] = useState(new Date().toISOString().split('T')[0]);
  const [storedHairPhoto, setStoredHairPhoto] = useState<string>('');
  const storedHairPhotoRef = useRef<HTMLInputElement>(null);
  const [storedHairWeight, setStoredHairWeight] = useState('');
  const [storedHairWeightUnit, setStoredHairWeightUnit] = useState<UnitType>('g');
  const [storedHairLength, setStoredHairLength] = useState('');
  const [storedHairNotes, setStoredHairNotes] = useState('');
  const [editingStoredHair, setEditingStoredHair] = useState<StoredHair | null>(null);
  const [newlyRegisteredStoredHair, setNewlyRegisteredStoredHair] = useState<StoredHair | null>(null); // To show success screen
  const [showDeliveryConfirmModal, setShowDeliveryConfirmModal] = useState(false);
  const [deliveryCodeInput, setDeliveryCodeInput] = useState('');
  const [deliveryConfirmError, setDeliveryConfirmError] = useState('');
  const [storedHairToDeliver, setStoredHairToDeliver] = useState<StoredHair | null>(null);

  // Ensure storedHair is always an array for safety
  const currentStoredHair = storedHair || [];

  // --- Handlers ---
  const handleStoredHairImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setStoredHairPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveStoredHair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientForStoredHair || !storedHairDate || !storedHairWeight || !storedHairLength) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const client = clients.find(c => c.id === selectedClientForStoredHair);
    if (!client) {
      alert("Cliente não encontrado.");
      return;
    }

    const newId = `sh-${Date.now()}`;
    const generatedCode = `SH-${Date.now().toString().slice(-6)}`; // Generate unique code

    const hairData: StoredHair = {
      id: newId,
      clientId: client.id,
      clientName: client.name,
      dateStored: storedHairDate,
      photoUrl: storedHairPhoto || undefined,
      weight: parseFloat(storedHairWeight),
      weightUnit: storedHairWeightUnit,
      length: parseInt(storedHairLength),
      status: 'stored',
      notes: storedHairNotes || undefined,
      deliveryCode: generatedCode, // Save the generated code
    };

    if (editingStoredHair) {
      await updateStoredHair({ ...editingStoredHair, ...hairData });
      alert('Cabelo guardado atualizado!');
    } else {
      await addStoredHair(hairData);
      setNewlyRegisteredStoredHair(hairData); // Set for success screen
    }
    resetStoredHairForm();
  };

  const startEditStoredHair = (hair: StoredHair) => {
    setEditingStoredHair(hair);
    setSelectedClientForStoredHair(hair.clientId);
    setStoredHairDate(hair.dateStored);
    setStoredHairPhoto(hair.photoUrl || '');
    setStoredHairWeight(hair.weight.toString());
    setStoredHairWeightUnit(hair.weightUnit);
    setStoredHairLength(hair.length.toString());
    setStoredHairNotes(hair.notes || '');
  };

  const resetStoredHairForm = () => {
    setEditingStoredHair(null);
    setSelectedClientForStoredHair('');
    setStoredHairDate(new Date().toISOString().split('T')[0]);
    setStoredHairPhoto('');
    setStoredHairWeight('');
    setStoredHairWeightUnit('g');
    setStoredHairLength('');
    setStoredHairNotes('');
    setNewlyRegisteredStoredHair(null); // Clear success state
  };

  const openDeliveryConfirmModal = (hair: StoredHair) => {
    setStoredHairToDeliver(hair);
    setDeliveryCodeInput('');
    setDeliveryConfirmError('');
    setShowDeliveryConfirmModal(true);
  };

  const handleConfirmDelivery = async () => {
    if (!storedHairToDeliver || !deliveryCodeInput) {
      setDeliveryConfirmError("Por favor, insira o código.");
      return;
    }

    if (deliveryCodeInput !== storedHairToDeliver.deliveryCode) {
      setDeliveryConfirmError("Código incorreto. Verifique com o cliente.");
      return;
    }

    await updateStoredHair({ 
      ...storedHairToDeliver, 
      status: 'delivered', 
      dateDelivered: new Date().toISOString().split('T')[0] 
    });
    alert('Cabelo marcado como entregue!');
    setShowDeliveryConfirmModal(false);
    setStoredHairToDeliver(null);
  };

  // If a new hair item was just registered, show a success screen
  if (newlyRegisteredStoredHair) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[80vh] text-center animate-fade-in">
        <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-6">
          <CheckCircle size={64} />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Cabelo Registrado!</h2>
        <p className="text-gray-500 mb-4 max-w-xs mx-auto">
          O cabelo de <strong>{newlyRegisteredStoredHair.clientName}</strong> foi registrado com sucesso.
        </p>
        {newlyRegisteredStoredHair.deliveryCode && (
            <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg mb-6 text-purple-800 font-bold text-xl flex items-center justify-center">
                <span className="mr-2">CÓDIGO DE ENTREGA:</span>
                <span>{newlyRegisteredStoredHair.deliveryCode}</span>
                <button 
                    onClick={() => navigator.clipboard.writeText(newlyRegisteredStoredHair.deliveryCode || '')}
                    className="ml-3 p-1 rounded-full hover:bg-purple-100 text-purple-600"
                    title="Copiar código"
                >
                    <Copy size={18}/>
                </button>
            </div>
        )}
        <p className="text-sm text-gray-600 mb-8 max-w-xs mx-auto">
            Informe este código ao cliente para que ele possa confirmar a retirada.
        </p>
        
        <div className="w-full max-w-sm space-y-3">
            <button 
                onClick={() => setNewlyRegisteredStoredHair(null)} 
                className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-bold text-lg hover:bg-gray-200 transition"
            >
                Voltar para Cabelo Guardado
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 relative">
      <h2 className="text-2xl font-bold text-purple-900 mb-6 flex items-center">
        <Box className="mr-2" /> Cabelo Guardado
      </h2>

      <h3 className="font-bold text-gray-700 mb-4 flex items-center">
        <Box size={20} className="mr-2 text-purple-600"/> {editingStoredHair ? 'Editar Cabelo Guardado' : 'Registrar Novo Cabelo Guardado'}
      </h3>
      <form onSubmit={handleSaveStoredHair} className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8 space-y-4">
          <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cliente</label>
              <select 
                  required 
                  className="w-full p-3 rounded-lg border bg-white focus:border-purple-500 outline-none" 
                  value={selectedClientForStoredHair} 
                  onChange={e => setSelectedClientForStoredHair(e.target.value)}
              >
                  <option value="">Selecione o Cliente...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
          </div>
          <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data que Deixou o Produto</label>
              <input 
                  required 
                  type="date"
                  className="w-full p-3 rounded-lg border bg-white focus:border-purple-500 outline-none" 
                  value={storedHairDate} 
                  onChange={e => setStoredHairDate(e.target.value)}
              />
          </div>
          <div 
              onClick={() => storedHairPhotoRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-white bg-white/50 relative overflow-hidden"
          >
              {storedHairPhoto ? <img src={storedHairPhoto} className="h-full w-full object-contain"/> : <><Camera className="text-gray-400 mb-1"/><span className="text-xs text-gray-500">Foto do Cabelo</span></>}
              <input type="file" ref={storedHairPhotoRef} className="hidden" accept="image/*" onChange={handleStoredHairImageChange} />
          </div>
          <div className="grid grid-cols-2 gap-4">
              <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Peso</label>
                  <input 
                      required 
                      type="number" 
                      step="0.01"
                      placeholder="Peso (ex: 150)" 
                      className="w-full p-3 border rounded-lg" 
                      value={storedHairWeight} 
                      onChange={e => setStoredHairWeight(e.target.value)} 
                  />
              </div>
              <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unidade de Peso</label>
                  <select 
                      required
                      className="w-full p-3 border rounded-lg bg-white"
                      value={storedHairWeightUnit}
                      onChange={e => setStoredHairWeightUnit(e.target.value as UnitType)}
                  >
                      <option value="g">Gramas (g)</option>
                      <option value="kg">Quilo (kg)</option>
                      <option value="un">Unidade (un)</option>
                  </select>
              </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
              <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Comprimento (cm)</label>
                  <input 
                      required 
                      type="number" 
                      step="1"
                      placeholder="Comprimento (ex: 60)" 
                      className="w-full p-3 border rounded-lg" 
                      value={storedHairLength} 
                      onChange={e => setStoredHairLength(e.target.value)} 
                  />
              </div>
          </div>
          <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Observações (Opcional)</label>
              <textarea 
                  placeholder="Detalhes adicionais sobre o cabelo..." 
                  className="w-full p-3 rounded-lg border text-sm bg-white focus:border-purple-500 outline-none" 
                  rows={2} 
                  value={storedHairNotes} 
                  onChange={e => setStoredHairNotes(e.target.value)} 
              />
          </div>
          <div className="flex gap-2 justify-end">
              {editingStoredHair && <button type="button" onClick={resetStoredHairForm} className="bg-gray-200 text-gray-700 px-4 py-2 rounded font-bold">Cancelar</button>}
              <button className="bg-purple-600 text-white px-6 py-2 rounded font-bold hover:bg-purple-700 shadow-sm flex items-center justify-center">
                  <Save size={18} className="mr-2"/> {editingStoredHair ? 'Salvar Alterações' : 'Registrar Cabelo'}
              </button>
          </div>
      </form>

      <h4 className="font-bold text-gray-700 mb-4 flex items-center">
          <Box size={18} className="mr-2 text-purple-500"/> Cabelos Guardados ({currentStoredHair.length})
      </h4>
      <div className="space-y-3">
          {currentStoredHair.length === 0 ? (
              <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-gray-100">
                  <Box size={48} className="mx-auto mb-2 opacity-20"/>
                  <p>Nenhum cabelo guardado registrado.</p>
              </div>
          ) : (
              currentStoredHair.sort((a,b) => new Date(b.dateStored).getTime() - new Date(a.dateStored).getTime()).map(hair => (
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
                              {/* REMOVIDO: Exibição do Código de Entrega para o Administrador */}
                              {/*
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
                              */}
                          </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${hair.status === 'stored' ? 'bg-purple-200 text-purple-800' : 'bg-green-200 text-green-800'}`}>
                              {hair.status === 'stored' ? 'Produto Guardado' : 'Cabelo Entregue'}
                          </span>
                          {hair.status === 'stored' && (
                              <button 
                                  onClick={() => openDeliveryConfirmModal(hair)}
                                  className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg font-bold flex items-center hover:bg-green-700 transition"
                              >
                                  <CheckCircle size={14} className="mr-1"/> Marcar como Entregue
                              </button>
                          )}
                          <div className="flex gap-2">
                              <button onClick={() => startEditStoredHair(hair)} className="text-gray-400 hover:text-purple-600 p-2 rounded" title="Editar"><Edit2 size={16}/></button>
                              <button onClick={() => { if(confirm('Excluir este registro?')) removeStoredHair(hair.id); }} className="text-red-400 hover:text-red-600 p-2 rounded" title="Excluir"><Trash2 size={16}/></button>
                          </div>
                      </div>
                  </div>
              ))
          )}
      </div>

      {/* DELIVERY CONFIRMATION MODAL */}
      {showDeliveryConfirmModal && storedHairToDeliver && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 relative">
                <button onClick={() => setShowDeliveryConfirmModal(false)} className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100"><X size={20}/></button>
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                        <CheckCircle size={32}/>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Confirmar Entrega</h3>
                    <p className="text-sm text-gray-500">
                        Para entregar o cabelo de <strong>{storedHairToDeliver.clientName}</strong>, peça o código de entrega ao cliente.
                    </p>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); handleConfirmDelivery(); }} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Código de Entrega</label>
                        <input 
                            required 
                            type="text" 
                            className="w-full p-3 border rounded-xl text-center font-bold text-lg" 
                            value={deliveryCodeInput} 
                            onChange={e => setDeliveryCodeInput(e.target.value)} 
                            autoFocus
                        />
                    </div>
                    {deliveryConfirmError && (
                        <div className="text-red-500 text-sm font-bold text-center bg-red-50 p-2 rounded-lg">
                            <AlertTriangle size={18} className="mr-2"/> {deliveryConfirmError}
                        </div>
                    )}
                    <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-green-700">
                        Confirmar Entrega
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};