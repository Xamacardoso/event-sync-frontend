'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { eventService } from '@/services/events';
import { Event } from '@/types';
import { Calendar, MapPin, ArrowLeft, Clock, DollarSign, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // O ID vem da URL (nome da pasta [id])
    const eventId = params.id as string;
    if (eventId) {
      loadEvent(eventId);
    }
  }, [params.id]);

  const loadEvent = async (id: string) => {
    try {
      const data = await eventService.getById(id);
      setEvent(data);
    } catch (err) {
      console.error(err);
      setError('Falha ao carregar o evento. Ele pode não existir.');
    } finally {
      setLoading(false);
    }
  };

  // Formatação de data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Carregando detalhes...</div>;
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-red-500 mb-4">{error || 'Evento não encontrado'}</p>
        <Button onClick={() => router.push('/')} variant="outline" className="w-auto">
          Voltar para o Feed
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Botão Voltar */}
      <div className="bg-white p-4 sticky top-0 z-10 shadow-sm">
        <button 
          onClick={() => router.back()} 
          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Voltar
        </button>
      </div>

      {/* Banner */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-blue-600 to-purple-600 w-full relative">
        <div className="absolute bottom-0 left-0 p-4 w-full bg-gradient-to-t from-black/60 to-transparent">
          <span className="inline-block px-3 py-1 bg-white text-blue-900 text-xs font-bold rounded-full mb-2 uppercase">
            {event.type === 'free' ? 'Gratuito' : `Pago`}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-white shadow-sm">
            {event.title}
          </h1>
        </div>
      </div>

      <main className="p-4 max-w-3xl mx-auto space-y-6">
        
        {/* Informações Principais */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          
          <div className="flex items-start text-gray-700">
            <Calendar className="w-5 h-5 mr-3 text-blue-500 mt-1" />
            <div>
              <p className="font-semibold text-sm text-gray-500">Início</p>
              <p>{formatDate(event.startDate)}</p>
            </div>
          </div>

          <div className="flex items-start text-gray-700">
            <Clock className="w-5 h-5 mr-3 text-blue-500 mt-1" />
            <div>
              <p className="font-semibold text-sm text-gray-500">Término</p>
              <p>{formatDate(event.endDate)}</p>
            </div>
          </div>

          <div className="flex items-start text-gray-700">
            <MapPin className="w-5 h-5 mr-3 text-blue-500 mt-1" />
            <div>
              <p className="font-semibold text-sm text-gray-500">Local</p>
              <p>{event.localAddress || event.localUrl || 'A definir'}</p>
            </div>
          </div>

          {event.type === 'paid' && (
            <div className="flex items-start text-gray-700">
              <DollarSign className="w-5 h-5 mr-3 text-green-500 mt-1" />
              <div>
                <p className="font-semibold text-sm text-gray-500">Valor da Inscrição</p>
                <p className="text-lg font-bold text-green-600">R$ {event.price.toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Descrição */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Sobre o Evento</h2>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Botão de Ação */}
        <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t border-gray-200 md:static md:bg-transparent md:border-0">
          <div className="max-w-3xl mx-auto">
            {user?.id === event.organizerId ? (
              <Button variant="outline" className="w-full border-blue-600 text-blue-600">
                Gerenciar Evento (Você é o Organizador)
              </Button>
            ) : (
              <Button className="w-full text-lg py-4">
                Inscrever-se no Evento
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}