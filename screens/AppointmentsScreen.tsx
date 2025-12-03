"use client";

import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, User, Scissors, Edit2, Save, X, Users, ChevronDown } from 'lucide-react';
import { Appointment } from '../types';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const AppointmentsScreen: React.FC = () => {
  const { appointments, clients, services, staff, addAppointment, updateAppointment } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  // Form State (Used for both Create and Edit)
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]); // MODIFIED: Now an array
  const [selectedDateStr, setSelectedDateStr] = useState(''); // YYYY-MM-DD
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [showStaffDropdown, setShowStaffDropdown] = useState(false); // State for dropdown visibility

  // Calendar Logic
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const getDayColor = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const count = appointments.filter(a => a.date === dateStr).length;
    if (count === 0) return 'bg-green-100 text-green-700 border-green-200';
    if (count < 5) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
    // When clicking a date, we set the default date for new appointment
    setSelectedDateStr(newDate.toISOString().split('T')[0]);
    setShowForm(false);
    setEditingAppointment(null);
  };

  const openNewForm = () => {
    setEditingAppointment(null);
    setSelectedClientId('');
    setSelectedService('');
    setSelectedStaffIds([]); // Reset to empty array
    setSelectedTime('');
    setNotes('');
    // Default to currently selected date on calendar
    if (selectedDate) {
        setSelectedDateStr(selectedDate.toISOString().split('T')[0]);
    }
    setShowForm(true);
  };

  const openEditForm = (apt: Appointment) => {
    setEditingAppointment(apt);
    setSelectedClientId(apt.clientId);
    setSelectedService(apt.serviceId);
    setSelectedStaffIds(apt.staffId); // Load array of staff IDs
    setSelectedDateStr(apt.date);
    setSelectedTime(apt.time);
    setNotes(apt.notes || '');
    setShowForm(true);
  };

  const toggleStaffSelection = (staffId: string) => {
    setSelectedStaffIds(prev => {
      if (prev.includes(staffId)) {
        return prev.filter(id => id !== staffId);
      } else {
        if (prev.length < 3) { // Limit to 3 staff members
          return [...prev, staffId];
        } else {
          alert("Você pode selecionar no máximo 3 profissionais.");
          return prev;
        }
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDateStr || !selectedService || selectedStaffIds.length === 0 || !selectedTime || !selectedClientId) {
        alert("Por favor, preencha todos os campos obrigatórios, incluindo pelo menos um profissional.");
        return;
    }

    const client = clients.find(c => c.id === selectedClientId);
    if (!client) return;

    if (editingAppointment) {
      // Update existing
      const updatedApt: Appointment = {
        ...editingAppointment,
        clientId: client.id,
        clientName: client.name,
        clientPhone: client.phone,
        serviceId: selectedService,
        staffId: selectedStaffIds, // Save array of staff IDs
        date: selectedDateStr,
        time: selectedTime,
        notes,
      };
      updateAppointment(updatedApt);
    } else {
      // Create new
      const newAppt: Appointment = {
        id: `apt-${Date.now()}`,
        clientId: client.id,
        clientName: client.name,
        clientPhone: client.phone,
        serviceId: selectedService,
        staffId: selectedStaffIds, // Save array of staff IDs
        date: selectedDateStr,
        time: selectedTime,
        notes,
        status: 'scheduled'
      };
      addAppointment(newAppt);
    }

    setShowForm(false);
    setEditingAppointment(null);
  };

  const displayDateStr = selectedDate ? selectedDate.toISOString().split('T')[0] : '';
  const dayAppointments = appointments.filter(a => a.date === displayDateStr).sort((a,b) => a.time.localeCompare(b.time));

  return (
    <div className="p-4 pb-20 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-900 flex items-center">
          <CalendarIcon className="mr-2" /> Agenda
        </h2>
        <div className="flex items-center space-x-4 bg-white rounded-lg p-1 shadow-sm">
          <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded"><ChevronLeft size={20} /></button>
          <span className="font-semibold w-32 text-center">
            {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded"><ChevronRight size={20} /></button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-6 text-center">
        {DAYS.map(d => <div key={d} className="text-xs font-bold text-gray-400 py-1">{d}</div>)}
        {Array.from({ length: getFirstDayOfMonth(currentDate) }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: getDaysInMonth(currentDate) }).map((_, i) => {
          const day = i + 1;
          const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentDate.getMonth();
          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              className={`
                aspect-square rounded-lg flex items-center justify-center text-sm font-medium border
                ${getDayColor(day)}
                ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Daily List */}
      {selectedDate && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 min-h-[200px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800">
              {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h3>
            <button 
              onClick={openNewForm}
              className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center hover:bg-blue-700 shadow-sm"
            >
              <Plus size={16} className="mr-1" /> Novo
            </button>
          </div>

          <div className="space-y-3">
             {dayAppointments.length === 0 ? (
                <p className="text-center text-gray-400 py-8 flex flex-col items-center">
                  <CalendarIcon className="mb-2 opacity-20" size={40}/>
                  Nenhum agendamento para este dia.
                </p>
              ) : (
                dayAppointments.map(apt => {
                  const srv = services.find(s => s.id === apt.serviceId);
                  const assignedStaff = staff.filter(s => apt.staffId.includes(s.id)); // Filter multiple staff
                  return (
                    <div key={apt.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500 hover:bg-blue-50 transition-colors group">
                      <div className="flex items-center flex-1">
                        <div className="mr-4 text-center min-w-[50px]">
                            <div className="font-bold text-blue-900 text-lg">{apt.time}</div>
                        </div>
                        <div>
                            <div className="font-bold text-gray-800">{apt.clientName}</div>
                            <div className="text-xs text-blue-600 font-medium bg-blue-100 inline-block px-1.5 py-0.5 rounded mt-1">
                            {srv?.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 flex items-center flex-wrap gap-x-2">
                            <Users size={10} className="mr-1" /> 
                            {assignedStaff.length > 0 ? assignedStaff.map(s => s.name).join(', ') : 'Nenhum profissional'}
                            </div>
                            {apt.notes && <div className="text-xs text-gray-400 mt-1 italic">"{apt.notes}"</div>}
                        </div>
                      </div>
                      <button 
                        onClick={() => openEditForm(apt)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                        title="Editar Agendamento"
                      >
                         <Edit2 size={16} />
                      </button>
                    </div>
                  );
                })
              )}
          </div>
        </div>
      )}

      {/* Modal Form (Create / Edit) */}
      {showForm && (
         <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
               <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                  <h3 className="font-bold flex items-center">
                    {editingAppointment ? <Edit2 size={18} className="mr-2"/> : <Plus size={18} className="mr-2"/>}
                    {editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
                  </h3>
                  <button onClick={() => setShowForm(false)} className="hover:bg-blue-500 rounded-full p-1"><X size={20}/></button>
               </div>
               
               <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                  
                  {/* Client Select */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cliente</label>
                    <select 
                        required 
                        className="w-full p-3 rounded-lg border bg-white focus:border-blue-500 outline-none" 
                        value={selectedClientId} 
                        onChange={e => setSelectedClientId(e.target.value)}
                        disabled={!!editingAppointment} // Maybe keep editing client disabled or enabled? Let's leave enabled in case they selected wrong client. But user said "Client can change time/day". Let's enable it.
                    >
                        <option value="">Selecione o Cliente...</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Date Input - Allows moving appointments */}
                    <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data</label>
                       <input 
                         required 
                         type="date"
                         className="w-full p-3 rounded-lg border bg-white focus:border-blue-500 outline-none" 
                         value={selectedDateStr} 
                         onChange={e => setSelectedDateStr(e.target.value)}
                       />
                    </div>
                    {/* Time Input */}
                    <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Horário</label>
                       <input 
                         required 
                         type="time" 
                         className="w-full p-3 rounded-lg border bg-white focus:border-blue-500 outline-none" 
                         value={selectedTime} 
                         onChange={e => setSelectedTime(e.target.value)} 
                       />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Serviço</label>
                        <select 
                        required 
                        className="w-full p-3 rounded-lg border bg-white focus:border-blue-500 outline-none" 
                        value={selectedService} 
                        onChange={e => setSelectedService(e.target.value)}
                        >
                        <option value="">Selecione...</option>
                        {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    {/* Staff Multi-Select */}
                    <div className="relative">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Profissional(is) (Máx. 3)</label>
                        <button 
                            type="button"
                            onClick={() => setShowStaffDropdown(!showStaffDropdown)}
                            className="w-full p-3 rounded-lg border bg-white text-left flex items-center justify-between focus:border-blue-500 outline-none"
                        >
                            {selectedStaffIds.length > 0 
                                ? staff.filter(s => selectedStaffIds.includes(s.id)).map(s => s.name).join(', ')
                                : 'Selecione...'
                            }
                            <ChevronDown size={16} className="text-gray-400" />
                        </button>
                        {showStaffDropdown && (
                            <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                                {staff.map(s => (
                                    <label key={s.id} className="flex items-center p-3 hover:bg-blue-50 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedStaffIds.includes(s.id)}
                                            onChange={() => toggleStaffSelection(s.id)}
                                            className="mr-2 rounded text-blue-600 focus:ring-blue-500"
                                        />
                                        {s.name}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Observações</label>
                    <textarea 
                        placeholder="Detalhes adicionais..." 
                        className="w-full p-3 rounded-lg border text-sm bg-white focus:border-blue-500 outline-none" 
                        rows={3} 
                        value={notes} 
                        onChange={e => setNotes(e.target.value)} 
                    />
                  </div>

                  <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-md flex justify-center items-center mt-2">
                    <Save size={18} className="mr-2"/> {editingAppointment ? 'Salvar Alterações' : 'Confirmar Agendamento'}
                  </button>
               </form>
            </div>
         </div>
      )}
    </div>
  );
};