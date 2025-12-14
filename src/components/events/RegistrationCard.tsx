import { useState } from 'react';
import { Registration, registrationService } from '@/services/registrations';
import { Calendar, MapPin, Clock, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { ConfirmationModal } from '../ui/ConfirmationModal';
import { toast } from 'sonner';

interface RegistrationCardProps {
  registration: Registration;
  onRegistrationCancelled?: () => void;
}

export const RegistrationCard = ({ registration, onRegistrationCancelled }: RegistrationCardProps) => {
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);

  // Se o backend não retornar o evento, evitamos erro (mas a tela ficará vazia)
  const event = registration.event;
  if (!event) return null;

  const getStatusStyle = () => {
    switch (registration.status) {
      case 'approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'checked_in': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'canceled': return 'bg-gray-100 text-gray-500 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = () => {
    switch (registration.status) {
      case 'approved': return 'Confirmado';
      case 'pending': return 'Aguardando Aprovação';
      case 'rejected': return 'Recusado';
      case 'checked_in': return 'Presença Confirmada';
      case 'canceled': return 'Cancelado';
      default: return 'Desconhecido';
    }
  };

  const handleCancel = async () => {
    setCanceling(true);
    try {
      await registrationService.cancel(registration.id);
      toast.success('Inscrição cancelada com sucesso.');
      setIsCancelModalOpen(false);
      if (onRegistrationCancelled) onRegistrationCancelled();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao cancelar inscrição.');
    } finally {
      setCanceling(false);
    }
  };

  const formattedDate = new Date(event.startDate).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const canCancel = registration.status === 'pending' || registration.status === 'approved';

  return (
    <>
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

          <div className="flex justify-between items-end mt-2">
            <div className='flex gap-2'>
              {canCancel && (
                <button
                  onClick={() => setIsCancelModalOpen(true)}
                  className="bg-red-600 text-white hover:bg-red-700 px-3 py-2 rounded-lg text-sm flex items-center gap-1 font-medium transition-colors shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Cancelar Inscrição
                </button>
              )}
            </div>

            <div className="flex gap-2">
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
      </div>

      <ConfirmationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancel}
        title="Cancelar Inscrição?"
        description="Tem certeza que deseja cancelar sua inscrição? Caso o evento seja pago, o reembolso dependerá da política do organizador."
        confirmText="Sim, Cancelar"
        variant="danger"
        isLoading={canceling}
      />
    </>
  );
};