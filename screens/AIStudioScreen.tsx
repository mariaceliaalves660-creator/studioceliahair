import React, { useState, useRef } from 'react';
import { Wand2, Camera, Upload, RefreshCw, Loader2 } from 'lucide-react';
import { editImageWithGemini } from '../services/geminiService';

export const AIStudioScreen: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setResultImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage || !prompt) return;

    setIsLoading(true);
    setError('');
    
    try {
      // Clean base64 string
      const base64Data = selectedImage.split(',')[1];
      const mimeType = selectedImage.substring(selectedImage.indexOf(':') + 1, selectedImage.indexOf(';'));

      const newImageBase64 = await editImageWithGemini(base64Data, prompt, mimeType);
      
      setResultImage(`data:image/png;base64,${newImageBase64}`);
    } catch (err) {
      setError('Erro ao gerar imagem. Tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 pb-20">
      <h2 className="text-2xl font-bold text-fuchsia-900 mb-6 flex items-center">
        <Wand2 className="mr-2" /> Simulador IA
      </h2>
      <p className="text-gray-600 mb-6 text-sm">
        Experimente novos visuais! Tire uma foto ou envie uma imagem e peça para a IA transformar.
        <br/><em className="text-xs">Ex: "Mude o cabelo para loiro platinado", "Adicione um filtro vintage".</em>
      </p>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-fuchsia-100">
        
        {/* Upload Area */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-fuchsia-200 rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer hover:bg-fuchsia-50 transition-colors relative overflow-hidden"
        >
          {selectedImage ? (
            <img src={selectedImage} alt="Original" className="w-full h-full object-contain" />
          ) : (
            <>
              <Camera size={48} className="text-fuchsia-300 mb-2" />
              <span className="text-fuchsia-400 font-medium">Toque para adicionar foto</span>
            </>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange} 
          />
        </div>

        {/* Controls */}
        <div className="mt-4 space-y-3">
          <input 
            type="text" 
            placeholder="O que você quer mudar? (Ex: Cabelo ruivo)" 
            className="w-full p-3 rounded-lg border border-gray-200 focus:border-fuchsia-500 outline-none transition"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
          />
          
          <button 
            onClick={handleGenerate}
            disabled={!selectedImage || !prompt || isLoading}
            className="w-full bg-fuchsia-600 text-white py-3 rounded-lg font-bold shadow-md hover:bg-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <><Loader2 className="animate-spin mr-2" /> Gerando...</>
            ) : (
              <><Wand2 className="mr-2" /> Transformar</>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">
            {error}
          </div>
        )}
      </div>

      {/* Result */}
      {resultImage && (
        <div className="mt-8 bg-white p-4 rounded-xl shadow-sm border border-fuchsia-100 animate-fade-in">
          <h3 className="font-bold text-gray-800 mb-3">Resultado</h3>
          <div className="rounded-xl overflow-hidden shadow-lg">
            <img src={resultImage} alt="Generated" className="w-full h-auto" />
          </div>
          <button 
            onClick={() => { setSelectedImage(null); setResultImage(null); setPrompt(''); }}
            className="w-full mt-4 bg-gray-100 text-gray-600 py-2 rounded-lg font-medium flex items-center justify-center hover:bg-gray-200"
          >
            <RefreshCw size={18} className="mr-2" /> Tentar Novamente
          </button>
        </div>
      )}
    </div>
  );
};
