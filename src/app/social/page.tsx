'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { socialService, FriendUser, FriendRequest } from '@/services/social';
import { useRouter } from 'next/navigation';
import { User, MessageCircle, UserPlus, Check, X, Loader2, ArrowLeft, Trash2, Send, Inbox, Users } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

export default function SocialPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();

    // States
    const [friends, setFriends] = useState<FriendUser[]>([]);
    const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
    const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'friends' | 'received' | 'sent'>('friends');

    // Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [targetToDelete, setTargetToDelete] = useState<{ id: string, name: string } | null>(null);

    // Carregar dados iniciais
    useEffect(() => {
        if (isAuthenticated) {
            fetchSocialData();
        }
    }, [isAuthenticated]);

    const fetchSocialData = async () => {
        try {
            const [friendsData, receivedData, sentData] = await Promise.all([
                socialService.getFriends(),
                socialService.getPendingRequests(),
                socialService.getSentRequests()
            ]);
            setFriends(friendsData);
            setReceivedRequests(receivedData);
            setSentRequests(sentData);

            // Auto switch tab if has pending requests and no friends
            if (receivedData.length > 0 && friendsData.length === 0 && activeTab === 'friends') {
                setActiveTab('received');
            }
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
            fetchSocialData();
        } catch (error) {
            toast.error('Erro ao responder pedido.');
        }
    };

    const confirmRemove = (id: string, name: string) => {
        setTargetToDelete({ id, name });
        setIsDeleteModalOpen(true);
    };

    const handleRemoveFriendship = async () => {
        if (!targetToDelete) return;
        try {
            await socialService.removeFriendship(targetToDelete.id);
            toast.success('Removido com sucesso.');
            setIsDeleteModalOpen(false);
            setTargetToDelete(null);
            fetchSocialData();
        } catch (error) {
            toast.error('Erro ao remover.');
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm mb-4">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center gap-4 mb-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                            aria-label="Voltar"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Users className="text-blue-600" />
                            Rede Social
                        </h1>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('friends')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex justify-center items-center gap-2 ${activeTab === 'friends' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Users className="w-4 h-4" />
                            Amigos
                            {friends.length > 0 && <span className="text-xs bg-gray-200 px-1.5 rounded-full">{friends.length}</span>}
                        </button>
                        <button
                            onClick={() => setActiveTab('received')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex justify-center items-center gap-2 ${activeTab === 'received' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Inbox className="w-4 h-4" />
                            Recebidos
                            {receivedRequests.length > 0 && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 rounded-full">{receivedRequests.length}</span>}
                        </button>
                        <button
                            onClick={() => setActiveTab('sent')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex justify-center items-center gap-2 ${activeTab === 'sent' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Send className="w-4 h-4" />
                            Enviados
                            {sentRequests.length > 0 && <span className="text-xs bg-gray-200 px-1.5 rounded-full">{sentRequests.length}</span>}
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-2xl mx-auto p-4">

                {/* LISTA DE AMIGOS */}
                {activeTab === 'friends' && (
                    <div className="space-y-4">
                        {friends.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-gray-500">Você ainda não tem amigos conectados.</p>
                            </div>
                        ) : (
                            friends.map(friend => (
                                <div key={friend.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                                            {friend.photoUrl ? (
                                                <img src={friend.photoUrl} alt={friend.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <User className="w-6 h-6" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{friend.name}</p>
                                            <p className="text-xs text-gray-500">{friend.city || 'Cidade não informada'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link
                                            href={`/social/chat?friendId=${friend.id}`}
                                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                            title="Chat"
                                        >
                                            <MessageCircle className="w-5 h-5" />
                                        </Link>
                                        <button
                                            onClick={() => confirmRemove(friend.id, friend.name)}
                                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                            title="Desfazer amizade"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* PEDIDOS RECEBIDOS */}
                {activeTab === 'received' && (
                    <div className="space-y-3">
                        {receivedRequests.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-gray-500">Nenhum pedido de amizade pendente.</p>
                            </div>
                        ) : (
                            receivedRequests.map(req => (
                                <div key={req.id} className="bg-white p-4 rounded-xl shadow-sm border border-yellow-200 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                                            {req.requester?.photoUrl ? (
                                                <img src={req.requester.photoUrl} alt={req.requester.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-blue-600 bg-blue-100">
                                                    <User className="w-5 h-5" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{req.requester?.name}</p>
                                            <p className="text-xs text-gray-500">quer ser seu amigo</p>
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
                            ))
                        )}
                    </div>
                )}

                {/* PEDIDOS ENVIADOS */}
                {activeTab === 'sent' && (
                    <div className="space-y-3">
                        {sentRequests.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-gray-500">Você não enviou nenhum pedido recentemente.</p>
                            </div>
                        ) : (
                            sentRequests.map(req => (
                                <div key={req.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center text-gray-400">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{req.recipient?.name || 'Usuário'}</p>
                                            <p className="text-xs text-yellow-600 font-medium">Aguardando resposta...</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => confirmRemove(req.recipientId, req.recipient?.name || 'Usuário')}
                                        className="text-xs text-red-600 hover:underline"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}

            </main>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleRemoveFriendship}
                title="Remover?"
                description={`Tem certeza que deseja remover ${targetToDelete?.name}?`}
                confirmText="Sim, Remover"
                variant="danger"
            />
        </div>
    );
}
