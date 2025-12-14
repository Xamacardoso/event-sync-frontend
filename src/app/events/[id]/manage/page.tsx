'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { registrationService, Registration } from '@/services/registrations';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowLeft, Check, X, User, Search,
  ListChecks, QrCode, Camera, Keyboard, Clock,
  Trash2,
  AlertTriangle,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { Scanner } from '@yudiel/react-qr-scanner';
import { eventService } from '@/services/events';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

export default function ManageEventPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const eventId = params.id as string;

  // Estados Gerais
  const [activeTab, setActiveTab] = useState<'approvals' | 'checkin' | 'settings'>('approvals');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  // Estados do Check-in
  const [checkInMode, setCheckInMode] = useState<'camera' | 'manual'>('camera');
  const [manualCode, setManualCode] = useState('');
  const [processingCheckIn, setProcessingCheckIn] = useState(false);
  const [paused, setPaused] = useState(false);

  // Modais diversos
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadRegistrations();
  }, [eventId, isAuthenticated]);

  const handleCancelEvent = async () => {
    setCanceling(true);
    try {
      await eventService.cancel(eventId);
      toast.success('Evento cancelado com sucesso.');
      router.push('/organizer/my-events'); // Redireciona após cancelar
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || 'Erro ao cancelar evento.';
      toast.error(msg);
      setIsCancelModalOpen(false); // Fecha o modal se der erro
    } finally {
      setCanceling(false);
    }
  };

  const loadRegistrations = async () => {
    try {
      const data = await registrationService.getEventRegistrations(eventId);
      setRegistrations(data);
    } catch (error) {
      console.error('Erro ao carregar inscritos', error);
      toast.error('Erro ao carregar lista. Verifique suas permissões.');
    } finally {
      setLoading(false);
    }
  };

  // --- Lógica de Aprovação ---
  const handleStatusChange = async (regId: string, newStatus: 'approved' | 'rejected') => {
    try {
      setRegistrations(prev => prev.map(r => r.id === regId ? { ...r, status: newStatus } : r));
      await registrationService.updateStatus(regId, newStatus);
      toast.success(`Status atualizado para ${newStatus === 'approved' ? 'Aprovado' : 'Recusado'}`);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao atualizar status.');
      loadRegistrations();
    }
  };

  // --- Lógica de Check-in ---
  const processCheckIn = async (ticketId: string, method: 'manual' | 'qr') => {
    if (!ticketId || processingCheckIn || paused) return;

    setProcessingCheckIn(true);
    setPaused(true);

    try {
      // Verifica se o ticket pertence a este evento
      const ticket = registrations.find(r => r.id === ticketId);

      if (!ticket) {
        throw new Error('Ingresso não encontrado nesta lista.');
      }

      if (ticket.eventId !== eventId) {
        throw new Error('Este ingresso pertence a outro evento.');
      }

      if (ticket.status === 'checked_in') {
        toast.info('Participante já fez check-in anteriormente.');
        setPaused(false);
        setProcessingCheckIn(false);
        return;
      }

      // Chama API passando o método
      await registrationService.checkIn(ticketId, method);

      // Atualiza lista localmente com a data atual
      const now = new Date().toISOString();
      setRegistrations(prev => prev.map(r =>
        r.id === ticketId ? { ...r, status: 'checked_in', checkedInAt: now } : r
      ));

      toast.success(`Check-in confirmado: ${ticket.user?.name}`);

      if (checkInMode === 'manual') setManualCode('');

      // Pausa breve para UX
      setTimeout(() => {
        setPaused(false);
      }, 1500);

    } catch (error: any) {
      const msg = error.message || error.response?.data?.message || 'Erro ao validar.';
      toast.error(msg);
      setTimeout(() => setPaused(false), 2000);
    } finally {
      setProcessingCheckIn(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processCheckIn(manualCode, 'manual');
  };

  // Filtros
  const filteredList = registrations.filter(r =>
    r.user?.name.toLowerCase().includes(filter.toLowerCase()) ||
    r.user?.email.toLowerCase().includes(filter.toLowerCase())
  );

  // Separa as listas para cada aba
  const approvalList = filteredList.filter(r => r.status !== 'checked_in');
  const checkInList = filteredList.filter(r => r.status === 'checked_in');

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* 6. Componente do Modal de Confirmação */}
      <ConfirmationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelEvent}
        title="Cancelar Evento?"
        description="Esta ação é irreversível. O evento será marcado como cancelado e não aceitará novas inscrições ou check-ins."
        confirmText="Sim, Cancelar Evento"
        cancelText="Voltar"
        variant="danger"
        isLoading={canceling}
      />

      {/* Header com Navegação */}
      <div className="bg-white shadow-sm sticky top-0 z-20">
        <div className="p-4 border-b border-gray-100 flex items-center">
          <Link href="#" onClick={(e) => { e.preventDefault(); router.back(); }} className="mr-4 text-gray-500 hover:text-blue-600">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-blue-900">Gerenciar Evento</h1>
        </div>

        {/* 7. AppBar Atualizada com 3 Abas */}
        <div className="flex">
          <button
            onClick={() => setActiveTab('approvals')}
            className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'approvals'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50'
              : 'border-transparent text-gray-500 hover:bg-gray-50'
              }`}
          >
            <ListChecks className="w-5 h-5" />
            <span className="hidden sm:inline">Aprovações</span>
          </button>

          <button
            onClick={() => setActiveTab('checkin')}
            className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'checkin'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50'
              : 'border-transparent text-gray-500 hover:bg-gray-50'
              }`}
          >
            <QrCode className="w-5 h-5" />
            <span className="hidden sm:inline">Check-in</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'settings'
              ? 'border-red-600 text-red-600 bg-red-50/20' // Destaque sutil em vermelho
              : 'border-transparent text-gray-500 hover:bg-gray-50'
              }`}
          >
            <Settings className="w-5 h-5" />
            <span className="hidden sm:inline">Opções</span>
          </button>
        </div>
      </div>

      <main className="p-4 max-w-3xl mx-auto space-y-6">

        {/* Campo de Busca Global */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Filtrar por nome ou email..."
            className="text-black w-full pl-10 p-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500">Carregando dados...</div>
        ) : (
          <>
            {/* === CONTEÚDO DA ABA APROVAÇÕES === */}
            {activeTab === 'approvals' && (
              <div className="space-y-3">
                {approvalList.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
                    Nenhuma inscrição pendente ou processada encontrada.
                  </div>
                ) : (
                  approvalList.map((reg) => (
                    <div key={reg.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{reg.user?.name}</p>
                          <p className="text-sm text-gray-500">{reg.user?.email}</p>
                          <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded mt-1 inline-block
                            ${reg.status === 'approved' ? 'bg-green-100 text-green-700' :
                              reg.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}
                          `}>
                            {reg.status === 'approved' ? 'Confirmado' :
                              reg.status === 'rejected' ? 'Recusado' : 'Pendente'}
                          </span>
                        </div>
                      </div>

                      {reg.status !== 'canceled' && (
                        <div className="flex gap-2 w-full sm:w-auto">
                          {reg.status !== 'approved' && (
                            <button onClick={() => handleStatusChange(reg.id, 'approved')} className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 px-3 py-2 rounded-lg font-medium transition-colors">
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          {reg.status !== 'rejected' && (
                            <button onClick={() => handleStatusChange(reg.id, 'rejected')} className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 px-3 py-2 rounded-lg font-medium transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* === CONTEÚDO DA ABA CHECK-IN === */}
            {activeTab === 'checkin' && (
              <div className="space-y-6">

                {/* Área do Scanner / Input */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="flex border-b border-gray-100">
                    <button
                      onClick={() => { setCheckInMode('camera'); setPaused(false); }}
                      className={`flex-1 py-3 text-sm font-medium flex justify-center gap-2 ${checkInMode === 'camera' ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}`}
                    >
                      <Camera className="w-4 h-4" /> Câmera
                    </button>
                    <button
                      onClick={() => setCheckInMode('manual')}
                      className={`flex-1 py-3 text-sm font-medium flex justify-center gap-2 ${checkInMode === 'manual' ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}`}
                    >
                      <Keyboard className="w-4 h-4" /> Manual
                    </button>
                  </div>

                  <div className="p-6 flex flex-col items-center justify-center min-h-[300px]">
                    {checkInMode === 'camera' ? (
                      <div className="w-full max-w-xs aspect-square bg-black rounded-lg overflow-hidden relative">
                        <Scanner
                          onScan={(result) => {
                            if (result && result.length > 0 && !paused) {
                              processCheckIn(result[0].rawValue, 'qr');
                            }
                          }}
                          allowMultiple={true}
                          scanDelay={500}
                          paused={paused}
                          components={{
                            onOff: false,
                            torch: false,
                            zoom: false,
                            finder: false,
                          }}
                        />
                        {paused && !processingCheckIn && (
                          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center z-10 backdrop-blur-[2px]">
                            <span className="bg-white text-green-700 px-3 py-1 rounded-full font-bold shadow-sm">Lido!</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <form onSubmit={handleManualSubmit} className="w-full max-w-xs space-y-4">
                        <Input
                          label="Código do Ingresso"
                          value={manualCode}
                          onChange={e => setManualCode(e.target.value)}
                          placeholder="Digite o ID..."
                          autoFocus
                        />
                        <Button type="submit" isLoading={processingCheckIn}>Validar</Button>
                      </form>
                    )}
                  </div>
                </div>

                {/* Lista de Check-ins Realizados */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3 ml-1">Já Presentes ({checkInList.length})</h3>
                  <div className="space-y-2">
                    {checkInList.length === 0 ? (
                      <p className="text-gray-500 text-sm ml-1">Nenhum check-in realizado ainda.</p>
                    ) : (
                      checkInList.map(reg => (
                        <div key={reg.id} className="bg-white p-3 rounded-lg border border-gray-100 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-full text-green-600">
                              <Check className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{reg.user?.name}</p>
                              <p className="text-xs text-gray-500">{reg.user?.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {reg.checkedInAt ? new Date(reg.checkedInAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                            </span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wide">
                              {reg.id.slice(0, 8)}... {/* ID abreviado como "método" visual */}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* 8. CONTEÚDO DA NOVA ABA CONFIGURAÇÕES (SETTINGS) */}
            {activeTab === 'settings' && (
              <div className="space-y-6">

                {/* Cartão de Informações (Placeholder para futura edição) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Detalhes do Evento</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    A funcionalidade de editar detalhes do evento (data, local, descrição) estará disponível em breve.
                  </p>
                  <Button variant="outline" disabled>
                    Editar Informações
                  </Button>
                </div>

                {/* Zona de Perigo */}
                <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                  <div className="flex items-start gap-4">
                    <div className="bg-red-100 p-3 rounded-full shrink-0">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-red-900 mb-1">Zona de Perigo</h3>
                      <p className="text-red-700 text-sm mb-6">
                        Cancelar o evento é uma ação irreversível. Todos os participantes poderão visualizar que o evento foi cancelado.
                      </p>

                      <button
                        onClick={() => setIsCancelModalOpen(true)}
                        className="bg-white border-2 border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2"
                      >
                        <Trash2 className="w-5 h-5" />
                        Cancelar Evento
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}