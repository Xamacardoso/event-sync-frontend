'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { eventService } from '@/services/events';
import { Event } from '@/types';
import { EventCard } from '@/components/events/EventCard';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { user, logout, isAuthenticated } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca eventos sempre, estando logado ou não
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await eventService.list();
      setEvents(data);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white p-4 sticky top-0 z-10 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-blue-900">EventSync</h1>
          {/* Só mostra o nome se estiver logado */}
          {isAuthenticated && user && <p className="text-xs text-gray-500">Olá, {user.name}</p>}
        </div>
        
        {/* Botão muda dependendo do estado de login */}
        {isAuthenticated ? (
          <button onClick={logout} className="text-sm text-red-500 font-medium hover:underline">
            Sair
          </button>
        ) : (
          <Link href="/login" className="text-sm text-blue-600 font-bold hover:underline">
            Entrar
          </Link>
        )}
      </header>

      {/* Feed de Eventos (Visível para todos) */}
      <main className="p-4 max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Próximos Eventos</h2>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2 text-sm">Carregando...</p>
          </div>
        ) : events.length > 0 ? (
          <div className="space-y-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500">Nenhum evento encontrado.</p>
            {user?.role === 'organizer' && (
              <p className="text-sm text-blue-600 mt-2">Crie o primeiro evento!</p>
            )}
          </div>
        )}
      </main>

      {/* Botão Criar Evento (Apenas Organizadores Logados) */}
      {isAuthenticated && user?.role === 'organizer' && (
        <Link 
          href="/events/new"
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-transform hover:scale-105 active:scale-95 flex items-center justify-center z-20"
          aria-label="Criar novo evento"
        >
          <Plus className="w-6 h-6" />
        </Link>
      )}
    </div>
  );
}