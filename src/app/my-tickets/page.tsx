'use client';

import { useEffect, useState } from 'react';
import { registrationService, Registration } from '@/services/registrations';
import { RegistrationCard } from '@/components/events/RegistrationCard';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Ticket } from 'lucide-react';
import Link from 'next/link';

export default function MyTicketsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated && !user) return; // Aguarda Auth

    // Se não tiver logado, manda pro login
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadRegistrations();
  }, [isAuthenticated, user, router]);

  const loadRegistrations = async () => {
    try {
      const data = await registrationService.getMyRegistrations();
      setRegistrations(data);
    } catch (error) {
      console.error('Erro ao buscar inscrições:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="max-w-3xl mx-auto">
        {/* Header Simples */}
        <div className="flex items-center mb-6">
          <Link href="/" className="mr-4 text-gray-500 hover:text-blue-600">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold text-blue-900 flex items-center">
            <Ticket className="w-6 h-6 mr-2" />
            Meus Ingressos
          </h1>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500">Carregando suas inscrições...</div>
        ) : registrations.length > 0 ? (
          <div className="space-y-4">
            {registrations.map((reg) => (
              <RegistrationCard
                key={reg.id}
                registration={reg}
                onRegistrationCancelled={loadRegistrations}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Nenhum ingresso encontrado</h3>
            <p className="text-gray-500 mb-6">Você ainda não se inscreveu em nenhum evento.</p>
            <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700">
              Explorar Eventos
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}