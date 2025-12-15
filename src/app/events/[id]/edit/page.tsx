'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { eventService } from '@/services/events';
import { EventForm } from '@/components/events/EventForm';
import { Event } from '@/types';

export default function EditEventPage() {
    const router = useRouter();
    const params = useParams();
    const { user, isAuthenticated } = useAuth();
    const eventId = params.id as string;

    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        const loadEvent = async () => {
            try {
                const data = await eventService.getById(eventId);

                // Verify ownership
                if (data.organizerId !== user?.id) {
                    toast.error('Você não tem permissão para editar este evento.');
                    router.push('/');
                    return;
                }

                setEvent(data);
            } catch (error) {
                console.error('Erro ao carregar evento:', error);
                toast.error('Erro ao carregar dados do evento.');
                router.push('/');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            loadEvent();
        }
    }, [isAuthenticated, user, router, eventId]);

    const onSubmit = async (data: any) => {
        try {
            await eventService.update(eventId, {
                ...data,
                startDate: new Date(data.startDate).toISOString(),
                endDate: new Date(data.endDate).toISOString(),
            });
            toast.success('Evento atualizado com sucesso!');
            router.replace(`/events/${eventId}/manage`);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao atualizar evento.');
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Carregando...</div>;
    }

    if (!event) return null;

    return (
        <div className="min-h-screen bg-gray-50 p-4 pb-20">
            <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-100">

                <div className="mb-6">
                    <Link
                        href={`/events/${eventId}/manage`}
                        className="inline-flex items-center text-gray-500 hover:text-blue-600 transition-colors font-medium text-sm"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Voltar para Gerenciamento
                    </Link>
                </div>

                <h1 className="text-2xl font-bold text-blue-900 mb-6">Editar Evento</h1>

                <EventForm
                    initialData={event}
                    onSubmit={onSubmit}
                    submitLabel="Salvar Alterações"
                />

            </div>
        </div>
    );
}
