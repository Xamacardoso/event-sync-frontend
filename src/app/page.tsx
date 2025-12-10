// src/app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';


export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Se ainda não estiver autenticado, redireciona para a tela de Login
    if (!isAuthenticated) {
      router.push('/login');
    }
    // Se estiver autenticado, o usuário fica na Home. 
    // O fetch de eventos foi removido para evitar o erro 404.
  }, [isAuthenticated, router]);

  // Enquanto o redirecionamento ou o estado final não é decidido, mostrar um loading ou mensagem simples.
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-800">Verificando autenticação...</p>
      </div>
    );
  }

  // Se chegou aqui, o usuário está autenticado. 
  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <header className="py-4 border-b border-gray-200 mb-8">
        <h1 className="text-2xl font-bold text-blue-900">Bem-vindo(a) ao EventSync!</h1>
      </header>
      
      <main className="max-w-md mx-auto">
        <p className="text-lg text-gray-700">Olá, **{user?.name}**!</p>
        <p className="mt-2 text-gray-500">
          Você está autenticado como **{user?.role}**. 
          O Feed de Eventos será exibido aqui em breve.
        </p>
        
        <button 
          onClick={() => router.push('/login')} 
          className="mt-6 text-sm text-red-500 font-medium hover:underline"
        >
          Sair / Voltar para Login (para testar)
        </button>
      </main>
    </div>
  );
}