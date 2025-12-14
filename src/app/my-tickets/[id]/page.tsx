'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import QRCode from 'react-qr-code';
import { registrationService, Registration } from '@/services/registrations'; // Ajuste o import conforme necessário
import { ArrowLeft, Calendar, MapPin, User } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function TicketPage() {
  const params = useParams();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
        router.push('/login');
        return;
    }
    
    // TODO [BACKEND]: Criar endpoint para buscar inscrição por ID e garantir que o usuário é o dono da inscrição
    
    // Como não temos um endpoint "getRegistrationById" direto exposto no front no passo anterior, 
    // podemos buscar todas e filtrar, ou criar o endpoint específico no service.
    // Vamos assumir aqui uma busca simplificada ou idealmente implementar o getById no service.
    // Para este exemplo, vou simular buscando da lista "meus ingressos"
    const loadTicket = async () => {
        try {
            const all = await registrationService.getMyRegistrations();
            const found = all.find(r => r.id === params.id);
            setRegistration(found || null);
        } catch(e) {
            toast.error('Erro ao carregar ingresso. Verifique se você é o dono do ingresso.');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    
    loadTicket();
  }, [params.id, isAuthenticated, router]);

  if (loading) return <div className="p-10 text-center">Carregando ingresso...</div>;
  if (!registration || !registration.event) return <div className="p-10 text-center">Ingresso não encontrado.</div>;

  const event = registration.event;

  return (
    <div className="min-h-screen bg-gray-900 p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl">
        {/* Cabeçalho do Ingresso */}
        <div className="bg-blue-600 p-6 text-white relative">
            <Link href="#" className="absolute top-6 left-6 text-white/80 hover:text-white"
                onClick={(e) => {
                    e.preventDefault();
                    router.back();
                }
            }>
                <ArrowLeft className="w-6 h-6" />
            </Link>
            <h2 className="text-center text-lg font-semibold mt-2">Seu Ingresso</h2>
        </div>

        {/* Corpo do Ingresso */}
        <div className="p-8 flex flex-col items-center">
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">{event.title}</h1>
            
            <div className="flex items-center text-gray-500 text-sm mb-6">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(event.startDate).toLocaleDateString()}
                <span className="mx-2">•</span>
                <MapPin className="w-4 h-4 mr-1" />
                {event.localAddress || 'Online'}
            </div>

            {/* QR Code */}
            <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-200 mb-6">
                <QRCode 
                    value={registration.id} // O valor é o ID da inscrição para validação
                    size={200}
                    level="H"
                />
            </div>
            <p className="text-xs text-gray-400 text-center mb-6">ID: {registration.id}</p>

            <div className="w-full border-t border-gray-100 pt-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-100 p-2 rounded-full">
                            <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Participante</p>
                            <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                        </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase
                        ${registration.status === 'approved' ? 'bg-green-100 text-green-700' : 
                          registration.status === 'checked_in' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}
                    >
                        {registration.status === 'checked_in' ? 'Usado' : 'Válido'}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}