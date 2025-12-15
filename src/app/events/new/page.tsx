'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { eventService } from '@/services/events';
import { EventForm } from '@/components/events/EventForm';

export default function NewEventPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated && !user) return;
    if (user?.role !== 'organizer') {
      toast.error('Acesso restrito a organizadores.');
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  const onSubmit = async (data: any) => {
    try {
      await eventService.create({
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
      });
      toast.success('Evento criado com sucesso!');
      router.push('/');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao criar evento. Verifique os dados.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-100">

        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-gray-500 hover:text-blue-600 transition-colors font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar para o Início
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-blue-900 mb-6">Novo Evento</h1>

        <EventForm onSubmit={onSubmit} submitLabel="Publicar Evento" />

      </div>
    </div>
  );
}