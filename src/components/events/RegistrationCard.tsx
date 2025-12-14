import React from 'react';
import { Registration } from '@/services/registrations';
import { Calendar, MapPin, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

interface RegistrationCardProps {
  registration: Registration;
}

export const RegistrationCard = ({ registration }: RegistrationCardProps) => {
  // Se o backend não retornar o evento, evitamos erro (mas a tela ficará vazia)
  const event = registration.event;
  if (!event) return null;

  const getStatusStyle = () => {
    switch (registration.status) {
      case 'approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'checked_in': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = () => {
    switch (registration.status) {
      case 'approved': return 'Confirmado';
      case 'pending': return 'Aguardando Aprovação';
      case 'rejected': return 'Recusado';
      case 'checked_in': return 'Presença Confirmada';
      default: return 'Cancelado';
    }
  };

  const formattedDate = new Date(event.startDate).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
      {/* Faixa de Status */}
      <div className={`p-3 md:w-40 flex items-center justify-center font-bold text-sm uppercase tracking-wider border-b md:border-b-0 md:border-r ${getStatusStyle()}`}>
        {getStatusLabel()}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">{event.title}</h3>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1 text-blue-500" />
              {formattedDate}
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1 text-blue-500" />
              {event.localAddress || 'Online'}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-2">
          {registration.status === 'approved' || registration.status === 'checked_in' ? (
            <Link 
              href={`/my-tickets/${registration.id}`} // Futura página do QR Code
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Ver Ingresso / QR Code
            </Link>
          ) : (
             <Link 
              href={`/events/${registration.eventId}`} 
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              Ver Detalhes do Evento
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};