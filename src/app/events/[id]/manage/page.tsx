'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { registrationService, Registration } from '@/services/registrations';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Check, X, User, Search } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';

export default function ManageEventPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const eventId = params.id as string;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadRegistrations();
  }, [eventId, isAuthenticated]);

  const loadRegistrations = async () => {
    try {
      const data = await registrationService.getEventRegistrations(eventId);
      setRegistrations(data);
    } catch (error) {
      console.error('Erro ao carregar inscritos', error);
      alert('Erro ao carregar lista de inscritos. Verifique se você é o dono do evento.');
      router.push(`/events/${eventId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (regId: string, newStatus: 'approved' | 'rejected') => {
    try {
      // Atualização otimista (muda na tela antes do backend responder para ser rápido)
      setRegistrations(prev => prev.map(r => 
        r.id === regId ? { ...r, status: newStatus } : r
      ));

      await registrationService.updateStatus(regId, newStatus);
    } catch (error) {
      console.error(error);
      alert('Erro ao atualizar status.');
      loadRegistrations(); // Reverte em caso de erro
    }
  };

  // Filtra pelo nome ou email do usuário
  const filteredRegistrations = registrations.filter(r => 
    r.user?.name.toLowerCase().includes(filter.toLowerCase()) || 
    r.user?.email.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10">
        <div className="flex items-center mb-4">
          <Link href="#" onClick={(e) => {
            e.preventDefault(); // <--- IMPEDE que o Link navegue para '#'
            router.back();      // Executa a ação de voltar
          }
        } 
        className="mr-4 text-gray-500 hover:text-blue-600">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-blue-900">Gerenciar Inscritos</h1>
        </div>

        {/* Barra de Pesquisa */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input 
            type="text"
            placeholder="Buscar por nome ou email..."
            className="text-black w-full pl-10 p-3 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <main className="p-4 max-w-3xl mx-auto">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Carregando lista...</div>
        ) : filteredRegistrations.length > 0 ? (
          <div className="space-y-3">
            {filteredRegistrations.map((reg) => (
              <div key={reg.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                
                {/* Dados do Usuário */}
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{reg.user?.name || 'Usuário Desconhecido'}</p>
                    <p className="text-sm text-gray-500">{reg.user?.email}</p>
                    <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded mt-1 inline-block
                      ${reg.status === 'approved' ? 'bg-green-100 text-green-700' : 
                        reg.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                        reg.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100'}
                    `}>
                      {reg.status === 'approved' ? 'Confirmado' : 
                       reg.status === 'pending' ? 'Pendente' : 
                       reg.status === 'rejected' ? 'Recusado' : reg.status}
                    </span>
                  </div>
                </div>

                {/* Botões de Ação */}
                {reg.status !== 'canceled' && (
                  <div className="flex gap-2 w-full sm:w-auto">
                    {reg.status !== 'approved' && (
                      <button 
                        onClick={() => handleStatusChange(reg.id, 'approved')}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 px-3 py-2 rounded-lg font-medium transition-colors"
                      >
                        <Check className="w-4 h-4" /> Aprovar
                      </button>
                    )}
                    
                    {reg.status !== 'rejected' && (
                      <button 
                        onClick={() => handleStatusChange(reg.id, 'rejected')}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 px-3 py-2 rounded-lg font-medium transition-colors"
                      >
                        <X className="w-4 h-4" /> Recusar
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            Nenhuma inscrição encontrada.
          </div>
        )}
      </main>
    </div>
  );
}