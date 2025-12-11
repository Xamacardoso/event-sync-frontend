// src/components/events/EventCard.tsx
import React from 'react';
import { Event } from '@/types';
import { Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';

interface EventCardProps {
  event: Event;
}

export const EventCard = ({ event }: EventCardProps) => {
  // Formata a data (Ex: 12/10/2025 14:00)
  const formattedDate = new Date(event.startDate).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Banner / Header do Card */}
      <div className="h-32 bg-linear-to-r from-blue-600 to-indigo-600 relative">
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold text-blue-900 uppercase">
          {event.type === 'free' ? 'Gratuito' : `R$ ${event.price}`}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">
          {event.title}
        </h3>
        
        <div className="flex items-center text-gray-600 text-sm mb-1">
          <Calendar className="w-4 h-4 mr-2 text-blue-500" />
          <span>{formattedDate}</span>
        </div>

        <div className="flex items-center text-gray-600 text-sm mb-4">
          <MapPin className="w-4 h-4 mr-2 text-blue-500" />
          <span className="truncate max-w-[200px]">
            {event.localAddress || 'Online / A definir'}
          </span>
        </div>

        <Link 
          href={`/events/${event.id}`} // Futura página de detalhes
          className="block w-full text-center py-2 bg-gray-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors border border-blue-100"
        >
          Ver Detalhes
        </Link>
      </div>
    </div>
  );
};