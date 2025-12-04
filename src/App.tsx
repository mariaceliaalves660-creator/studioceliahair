import React, { Suspense } from 'react';

const DataProvider = ({ children }: { children: React.ReactNode }) => children;

const HomeScreen = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-rose-900">LOJA & STUDIO CÉLIA HAIR</h1>
    <p className="mt-4 text-gray-600">Bem-vindo! Aplicação carregando...</p>
  </div>
);

export default function App() {
  return (
    <DataProvider>
      <div className="min-h-screen bg-rose-50">
        <header className="bg-white shadow-sm p-4 border-b border-rose-100">
          <h1 className="font-serif text-2xl text-rose-900">LOJA & STUDIO</h1>
          <p className="text-sm text-gray-600">Célia Hair</p>
        </header>
        <main className="flex-1">
          <Suspense fallback={<div className="p-8 text-center">Carregando...</div>}>
            <HomeScreen />
          </Suspense>
        </main>
      </div>
    </DataProvider>
  );
}
