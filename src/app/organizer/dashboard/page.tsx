'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardService, DashboardStats } from '@/services/dashboard';
import Link from 'next/link';
import { Calendar, Users, BarChart } from 'lucide-react';

export default function OrganizerDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            try {
                const data = await dashboardService.getStats();
                setStats(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        loadStats();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Carregando dashboard...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard do Organizador</h1>
                    <Link href="/organizer/my-events" className="text-blue-600 hover:underline">
                        Gerenciar Meus Eventos
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Card 1: Total Eventos */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="bg-blue-100 p-4 rounded-full text-blue-600">
                            <Calendar className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-gray-500 font-medium">Eventos Criados</p>
                            <h2 className="text-3xl font-bold text-gray-900">{stats?.totalEvents || 0}</h2>
                        </div>
                    </div>

                    {/* Card 2: Total Inscritos */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="bg-green-100 p-4 rounded-full text-green-600">
                            <Users className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-gray-500 font-medium">Total de Inscritos</p>
                            <h2 className="text-3xl font-bold text-gray-900">{stats?.totalRegistrations || 0}</h2>
                        </div>
                    </div>

                    {/* Card 3: Próximo Evento */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="bg-purple-100 p-4 rounded-full text-purple-600">
                            <BarChart className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-gray-500 font-medium">Próximo Evento</p>
                            {stats?.nextEvent ? (
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 line-clamp-1">{stats.nextEvent.title}</h2>
                                    <p className="text-sm text-gray-500">
                                        {new Date(stats.nextEvent.startDate).toLocaleDateString()}
                                    </p>
                                    <Link href={`/events/${stats.nextEvent.id}/manage`} className="text-xs text-blue-600 hover:underline">
                                        Gerenciar
                                    </Link>
                                </div>
                            ) : (
                                <p className="text-gray-400 italic">Nenhum evento futuro</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
