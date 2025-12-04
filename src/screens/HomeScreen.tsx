import React from 'react';
import { 
  ShoppingBag, GraduationCap, Wand2, ShieldCheck, ArrowRight, MessageSquare, Instagram
} from 'lucide-react';
import { useData } from '../context/DataContext';

interface HomeProps {
  onNavigate: (screen: string) => void;
}

export const HomeScreen: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-rose-100 p-6 text-center">
        <h1 className="font-serif text-3xl text-rose-900 mb-1">LOJA & STUDIO</h1>
        <p className="text-gray-600">Célia Hair - Beleza e Profissionalismo</p>
      </div>

      {/* Menu Principal */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-4">
          
          {/* Produtos / Loja */}
          <button 
            onClick={() => onNavigate('products')}
            className="w-full bg-gradient-to-r from-rose-500 to-rose-600 text-white py-5 px-6 rounded-2xl font-bold text-lg hover:from-rose-600 hover:to-rose-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <ShoppingBag size={24} />
              <span>🛍️ Produtos / Loja</span>
            </div>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition" />
          </button>

          {/* Cursos / Área do Aluno */}
          <button 
            onClick={() => onNavigate('courses')}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-5 px-6 rounded-2xl font-bold text-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <GraduationCap size={24} />
              <span>📚 Cursos / Área do Aluno</span>
            </div>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition" />
          </button>

          {/* Avaliador / Parceiro */}
          <button 
            onClick={() => onNavigate('social')}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-5 px-6 rounded-2xl font-bold text-lg hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <Wand2 size={24} />
              <span>👥 Sou Avaliador/Parceiro</span>
            </div>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition" />
          </button>

          {/* Admin / Gerente */}
          <button 
            onClick={() => onNavigate('admin')}
            className="w-full bg-gradient-to-r from-gray-700 to-gray-800 text-white py-5 px-6 rounded-2xl font-bold text-lg hover:from-gray-800 hover:to-gray-900 transition-all transform hover:scale-105 shadow-lg flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck size={24} />
              <span>🔐 Área Restrita (Admin)</span>
            </div>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition" />
          </button>
        </div>
      </div>

      {/* Footer com contato */}
      <div className="bg-white border-t border-rose-100 p-6 text-center">
        <h3 className="font-bold text-gray-800 mb-4">Entre em contato conosco</h3>
        <div className="flex justify-center gap-6">
          <a 
            href="https://wa.me/message/UZMM3WLPPUWRC1" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 text-green-600 hover:text-green-700 transition"
          >
            <MessageSquare size={24} />
            <span className="text-xs font-semibold">WhatsApp</span>
          </a>
          <a 
            href="https://instagram.com/studioceliahairoficial/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 text-pink-600 hover:text-pink-700 transition"
          >
            <Instagram size={24} />
            <span className="text-xs font-semibold">Instagram</span>
          </a>
        </div>
      </div>
    </div>
  );
};