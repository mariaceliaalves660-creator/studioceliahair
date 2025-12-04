import React, { useState } from 'react';
import { DataProvider } from './context/DataContext';
import { HomeScreen } from './screens/HomeScreen';
import { ProductsScreen } from './screens/ProductsScreen';
import { StudentAreaScreen } from './screens/StudentAreaScreen';
import { SocialHairCalculatorScreen } from './screens/SocialHairCalculatorScreen';
import { ManagerScreen } from './screens/ManagerScreen';
import { ArrowLeft } from 'lucide-react';

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<string>('home');
  const [previousScreen, setPreviousScreen] = useState<string | null>(null);

  const handleNavigate = (screen: string) => {
    setPreviousScreen(currentScreen);
    setCurrentScreen(screen);
  };

  const handleBack = () => {
    if (previousScreen) {
      setCurrentScreen(previousScreen);
      setPreviousScreen(null);
    } else {
      setCurrentScreen('home');
      setPreviousScreen(null);
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen onNavigate={handleNavigate} />;
      case 'products':
        return <ProductsScreen />;
      case 'courses':
        return <StudentAreaScreen />;
      case 'social':
        return <SocialHairCalculatorScreen />;
      case 'admin':
        return <ManagerScreen />;
      default:
        return <HomeScreen onNavigate={handleNavigate} />;
    }
  };

  const showBackButton = currentScreen !== 'home';

  return (
    <div className="min-h-screen bg-rose-50">
      {showBackButton && (
        <div className="bg-white border-b border-rose-100 p-4 flex items-center gap-3">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-rose-600 hover:text-rose-700 font-bold transition"
          >
            <ArrowLeft size={20} />
            Voltar
          </button>
          <div className="flex-1" />
          <div className="text-right">
            <h2 className="font-serif text-xl text-rose-900">LOJA & STUDIO</h2>
            <p className="text-xs text-gray-600">Célia Hair</p>
          </div>
        </div>
      )}
      {renderScreen()}
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}
