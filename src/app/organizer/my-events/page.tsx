'use client';

import { useEffect, useState } from 'react';
import { eventService } from '@/services/events';
import { Event } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, MapPin, Plus } from 'lucide-react';
import Link from 'next/link';

export default function OrganizerEventsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated && !user) return;

    // Proteção de rota
    if (user?.role !== 'organizer') {
      router.push('/');
      return;
    }

    loadMyEvents();
  }, [isAuthenticated, user, router]);

  const loadMyEvents = async () => {
    try {
      const data = await eventService.getMyEvents();
      setEvents(data);
    } catch (error) {
      console.error('Erro ao buscar meus eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/" className="mr-4 text-gray-500 hover:text-blue-600">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold text-blue-900">Eventos que Organizo</h1>
          </div>
          <Link
            href="/events/new"
            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
            title="Criar Novo Evento"
          >
            <Plus className="w-5 h-5" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500">Carregando eventos...</div>
        ) : events.length > 0 ? (
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => router.push(`/events/${event.id}`)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{event.title}</h2>
                    <div className="flex flex-col sm:flex-row gap-2 text-sm text-gray-500 mb-3">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-blue-500" />
                        {new Date(event.startDate).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-blue-500" />
                        {event.localAddress || 'Online'}
                      </span>
                    </div>
                    <span className={`inline-block px-2 py-1 text-xs font-bold rounded uppercase ${event.status === 'published' ? 'bg-green-100 text-green-700' :
                      event.status === 'canceled' ? 'bg-red-100 text-red-700' :
                        event.status === 'finished' ? 'bg-gray-100 text-gray-700 text-decoration-line-through' :
                          'bg-yellow-100 text-yellow-700'
                      }`}>
                      {
                        event.status === 'published' ? 'Publicado' :
                          event.status === 'canceled' ? 'Cancelado' :
                            event.status === 'finished' ? 'Finalizado' :
                              'Rascunho'
                      }
                    </span>
                  </div>

                  <Link
                    href={`/events/${event.id}/manage?from=/organizer/my-events`}
                    className="text-sm bg-gray-100 text-blue-700 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100 transition-colors z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Gerenciar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <p className="text-gray-500 mb-6">Você ainda não criou nenhum evento.</p>
            <Link href="/events/new" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700">
              Criar meu primeiro evento
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}