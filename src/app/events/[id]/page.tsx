'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { eventService } from '@/services/events';
import { registrationService, Registration } from '@/services/registrations'; // Novo serviço
import { Event } from '@/types';
import { Calendar, MapPin, ArrowLeft, Clock, DollarSign, CheckCircle, AlertTriangle, QrCode, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import Link from 'next/link';
import { toast } from 'sonner';
import { socialService } from '@/services/social';
import { Input } from '@/components/ui/Input';
import { UserPlus, Check, Users, Search, X } from 'lucide-react';

function ParticipantsSection({ eventId }: { eventId: string }) {
  const { user } = useAuth();
  const [participants, setParticipants] = useState<Registration[]>([]);
  const [filter, setFilter] = useState('');
  const [statusMap, setStatusMap] = useState<Record<string, 'none' | 'pending' | 'friend'>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [eventId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [regs, friends, pendingReqs] = await Promise.all([
        registrationService.getEventParticipants(eventId).catch(() => []),
        socialService.getFriends().catch(() => []),
        socialService.getPendingRequests().catch(() => [])
      ]);

      setParticipants(regs);

      const newStatusMap: Record<string, 'none' | 'pending' | 'friend'> = {};
      friends.forEach((f: any) => newStatusMap[f.id] = 'friend');

      // Check both sent and received
      pendingReqs.forEach((r: any) => {
        if (r.requesterId === user?.id) newStatusMap[r.recipientId] = 'pending';
        if (r.recipientId === user?.id) newStatusMap[r.requesterId] = 'pending';
      });

      setStatusMap(newStatusMap);

    } catch (error) {
      console.log('Erro ao carregar dados participantes.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (targetUserId: string) => {
    try {
      await socialService.sendRequest(targetUserId);
      setStatusMap(prev => ({ ...prev, [targetUserId]: 'pending' }));
      toast.success('Pedido enviado!');
    } catch (error: any) {
      toast.error('Erro ao enviar pedido.');
    }
  };

  const filtered = participants.filter(p =>
    p.user?.name.toLowerCase().includes(filter.toLowerCase()) &&
    p.user?.id !== user?.id
  );

  if (loading) return <div className="p-6 text-center text-gray-400">Carregando participantes...</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-bold text-gray-900">Participantes ({filtered.length})</h2>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar pessoas..."
          className="text-black w-full pl-10 p-3 rounded-lg border border-gray-200 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <div className="grid gap-3 max-h-96 overflow-y-auto pr-2">
        {filtered.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Nenhum participante encontrado.</p>
        ) : (
          filtered.map((reg) => (
            <div key={reg.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  {reg.user?.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{reg.user?.name}</p>
                </div>
              </div>

              {/* Botão de Adicionar */}
              <div className="flex items-center gap-2">
                {statusMap[reg.userId] === 'friend' ? (
                  <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded flex items-center gap-1">
                    <Check className="w-3 h-3" /> Amigo
                  </span>
                ) : statusMap[reg.userId] === 'pending' ? (
                  <span className="text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                    Pendente
                  </span>
                ) : (
                  <button
                    onClick={() => handleAddFriend(reg.userId)}
                    className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                    title="Adicionar Amigo"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [myRegistration, setMyRegistration] = useState<Registration | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);

  // 1. Carrega dados do evento
  const loadEvent = useCallback(async (id: string) => {
    try {
      const data = await eventService.getById(id);
      setEvent(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Verifica se já estou inscrito
  const checkRegistrationStatus = useCallback(async (eventId: string) => {
    if (!isAuthenticated) return;
    try {
      const myRegs = await registrationService.getMyRegistrations();
      // Procura se existe alguma inscrição minha para este evento
      const found = myRegs.find((r: Registration) => r.eventId === eventId);
      setMyRegistration(found || null);
    } catch (err) {
      console.error('Erro ao verificar inscrição:', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const eventId = params.id as string;
    if (eventId) {
      loadEvent(eventId);
      checkRegistrationStatus(eventId);
    }
  }, [params.id, loadEvent, checkRegistrationStatus]);

  // 3. Ação de Inscrever-se
  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!event) return;

    try {
      setSubmitting(true);
      await registrationService.create(event.id);

      // Atualiza status imediatamente
      await checkRegistrationStatus(event.id);
      toast.success('Inscrição solicitada com sucesso!');
    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 409) {
        toast.error('Você já está inscrito neste evento.');
      } else {
        toast.error('Erro ao realizar inscrição. Tente novamente.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Ação de Cancelar
  const handleCancelRegistration = async () => {
    if (!myRegistration) return;
    setCanceling(true);
    try {
      await registrationService.cancel(myRegistration.id);
      toast.success('Inscrição cancelada com sucesso.');
      setIsCancelModalOpen(false);
      // Recarrega status
      if (event) checkRegistrationStatus(event.id);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao cancelar inscrição.');
    } finally {
      setCanceling(false);
    }
  };

  // Auxiliar para Texto do Botão
  const getButtonContent = () => {
    if (!myRegistration || myRegistration.status === 'canceled') return 'Inscrever-se no Evento';

    switch (myRegistration.status) {
      case 'approved':
        return <><CheckCircle className="w-5 h-5 mr-2" /> Inscrição Confirmada</>;
      case 'pending':
        return <><Clock className="w-5 h-5 mr-2" /> Aguardando Aprovação</>;
      case 'rejected':
        return <><AlertTriangle className="w-5 h-5 mr-2" /> Inscrição Recusada</>;
      default:
        return 'Inscrito';
    }
  };

  // Auxiliar para Estilo do Botão
  const getButtonClasses = () => {
    if (!myRegistration || myRegistration.status === 'canceled') return ''; // Padrão (Azul)
    if (myRegistration.status === 'approved') return '!bg-green-600 !hover:bg-green-700 !text-white';
    if (myRegistration.status === 'pending') return '!bg-yellow-500 !hover:bg-yellow-600 !text-white';
    if (myRegistration.status === 'rejected') return '!bg-red-500 !hover:bg-red-600 !text-white';
    return '';
  };

  if (loading) return <div className="p-10 text-center">Carregando detalhes...</div>;
  if (!event) return <div className="p-10 text-center">Evento não encontrado</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-48">
      {/* Botão Voltar */}
      <div className="bg-white p-4 sticky top-0 z-10 shadow-sm">
        <Link href="/" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors w-fit">
          <ArrowLeft className="w-5 h-5 mr-1" /> Voltar
        </Link>
      </div>

      {/* Banner */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-blue-600 to-indigo-600 w-full relative">
        <div className="absolute bottom-0 left-0 p-4 w-full bg-gradient-to-t from-black/60 to-transparent">
          <span className="inline-block px-3 py-1 bg-white text-blue-900 text-xs font-bold rounded-full mb-2 uppercase">
            {event.type === 'free' ? 'Gratuito' : `R$ ${event.price}`}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-white shadow-sm">{event.title}</h1>
        </div>
      </div>

      <main className="p-4 max-w-3xl mx-auto space-y-6">
        {/* Info Cards */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-start text-gray-700">
            <Calendar className="w-5 h-5 mr-3 text-blue-500 mt-1" />
            <div>
              <p className="font-semibold text-sm text-gray-500">Início</p>
              <p>{new Date(event.startDate).toLocaleString('pt-BR')}</p>
            </div>
          </div>
          <div className="flex items-start text-gray-700">
            <MapPin className="w-5 h-5 mr-3 text-blue-500 mt-1" />
            <div>
              <p className="font-semibold text-sm text-gray-500">Local</p>
              <p>{event.localAddress || 'Online'}</p>
            </div>
          </div>
        </div>

        {/* Descrição */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Sobre</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
        </div>

        {/* Organizador */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-semibold mb-3">Organizado por</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
              {(event as any).organizer?.photoUrl ? (
                <img src={(event as any).organizer.photoUrl} alt="Org" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-xl">
                  {(event as any).organizer?.name?.charAt(0).toUpperCase() || 'O'}
                </div>
              )}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">{(event as any).organizer?.name || 'Organizador Desconhecido'}</p>
              {/* Rating placeholder - would need actual field from backend */}
              <p className="text-sm text-yellow-500 flex items-center gap-1 font-medium">
                ★ 4.8 <span className="text-gray-400 font-normal text-xs">(12 avaliações)</span>
              </p>
            </div>
          </div>
        </div>

        {/* Participantes */}
        <ParticipantsSection eventId={event.id} />
      </main>

      <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t border-gray-200 z-20">
        <div className="max-w-3xl mx-auto">
          {user?.id === event.organizerId ? (
            <div className="flex gap-3">
              <Link
                href={`/events/${event.id}/manage?from=/events/${event.id}`}
                className="w-full flex justify-center items-center bg-blue-600 text-white py-4 rounded-lg font-bold hover:bg-blue-700 transition-colors"
              >
                Gerenciar Evento
              </Link>
            </div>
          ) : (
            // Lógica para Participante
            <>
              {myRegistration && ['pending', 'approved'].includes(myRegistration.status) ? (
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    {/* Botão Principal (Ingresso ou Status) */}
                    {myRegistration.status === 'approved' ? (
                      <Link
                        href={`/my-tickets/${myRegistration.id}`}
                        className="flex-1 flex justify-center items-center bg-green-600 text-white py-4 rounded-lg font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
                      >
                        <QrCode className="w-5 h-5 mr-2" />
                        Acessar Ingresso
                      </Link>
                    ) : (
                      <div className="flex-1 bg-yellow-100 text-yellow-800 border-2 border-yellow-200 font-bold py-4 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 mr-2" />
                        Aguardando Aprovação
                      </div>
                    )}

                  </div>

                  {/* Botão Cancelar Full Width */}
                  <button
                    onClick={() => setIsCancelModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 bg-red-600 text-white font-medium py-3 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
                  >
                    <Trash2 className="w-5 h-5" />
                    Cancelar inscrição no evento
                  </button>

                  {myRegistration.status === 'pending' && <p className="text-xs text-center text-gray-500">O organizador precisa aprovar sua entrada.</p>}
                </div>
              ) : (
                // Caso contrário (Não inscrito, Recusado ou Cancelado -> Pode tentar de novo)
                <Button
                  onClick={handleSubscribe}
                  disabled={submitting}
                  className={`w-full text-lg py-4 flex justify-center items-center ${getButtonClasses()}`}
                >
                  {submitting ? 'Processando...' : getButtonContent()}
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelRegistration}
        title="Cancelar Inscrição?"
        description="Tem certeza que deseja cancelar sua inscrição? Se mudar de ideia, poderá se inscrever novamente (sujeito a aprovação)."
        confirmText="Sim, Cancelar"
        variant="danger"
        isLoading={canceling}
      />
    </div >
  );
}