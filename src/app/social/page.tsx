'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { socialService, FriendUser, FriendRequest } from '@/services/social';
import { useRouter } from 'next/navigation';
import { User, MessageCircle, UserPlus, Check, X, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function SocialPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const [friends, setFriends] = useState<FriendUser[]>([]);
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const [loading, setLoading] = useState(true);

    // Carregar dados iniciais
    useEffect(() => {
        if (isAuthenticated) {
            fetchSocialData();
        }
    }, [isAuthenticated]);

    const fetchSocialData = async () => {
        try {
            const [friendsData, requestsData] = await Promise.all([
                socialService.getFriends(),
                socialService.getPendingRequests()
            ]);
            setFriends(friendsData);
            setRequests(requestsData);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao carregar dados sociais');
        } finally {
            setLoading(false);
        }
    };

    const handleRespond = async (requestId: string, action: 'accepted' | 'rejected') => {
        try {
            await socialService.respondRequest(requestId, action);
            toast.success(action === 'accepted' ? 'Amizade aceita!' : 'Pedido recusado.');
            fetchSocialData(); // Recarrega listas
        } catch (error) {
            toast.error('Erro ao responder pedido.');
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white p-4 shadow-sm mb-6">
                <div className="max-w-2xl mx-auto flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                        aria-label="Voltar"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <UserPlus className="text-blue-600" />
                        Rede Social
                    </h1>
                </div>
            </div>

            <main className="max-w-2xl mx-auto p-4 space-y-8">

                {/* Pedidos Pendentes */}
                {requests.length > 0 && (
                    <section className="bg-white rounded-xl shadow-sm border border-yellow-200 p-4">
                        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-500" />
                            Pedidos de Amizade
                        </h2>
                        <div className="space-y-3">
                            {requests.map(req => (
                                <div key={req.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Novo pedido!</p>
                                            <p className="text-xs text-gray-500">Há pouco tempo</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleRespond(req.id, 'accepted')}
                                            className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200"
                                            title="Aceitar"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleRespond(req.id, 'rejected')}
                                            className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200"
                                            title="Recusar"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Lista de Amigos */}
                <section>
                    <h2 className="font-semibold text-gray-800 mb-4 ml-1">Meus Amigos ({friends.length})</h2>
                    {friends.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100">
                            <p className="text-gray-500 mb-2">Você ainda não tem amigos conectados.</p>
                            <p className="text-sm text-blue-500">Participe de eventos para encontrar pessoas!</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {friends.map(friend => (
                                <div key={friend.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                                            {friend.photoUrl ? (
                                                <img src={friend.photoUrl} alt={friend.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <User className="w-5 h-5" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{friend.name}</p>
                                            <p className="text-xs text-gray-500">{friend.city || 'Cidade não informada'}</p>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/social/chat?friendId=${friend.id}`}
                                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                    >
                                        <MessageCircle className="w-5 h-5" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

            </main>
        </div>
    );
}
