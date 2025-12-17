'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { socialService, Message, FriendUser } from '@/services/social';
import { ArrowLeft, Send, User } from 'lucide-react';
import Link from 'next/link';

function ChatContent() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const friendId = searchParams.get('friendId');

    const [messages, setMessages] = useState<Message[]>([]);
    const [friend, setFriend] = useState<FriendUser | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isUserNearBottomRef = useRef(true); // Rastreia se o usuário estava no fim antes da atualização

    // Redirecionar se não houver friendId
    useEffect(() => {
        if (!isAuthenticated) router.push('/login');
        if (!friendId) router.push('/social');
    }, [friendId, isAuthenticated, router]);

    // Carregar mensagens e infos do amigo
    useEffect(() => {
        if (friendId) {
            loadChat();
            // Polling simples para atualizar mensagens a cada 5s
            const interval = setInterval(loadChat, 5000);
            return () => clearInterval(interval);
        }
    }, [friendId]);

    const loadChat = async () => {
        try {
            if (!friendId) return;
            const msgs = await socialService.getMessages(friendId);
            setMessages(msgs);

            // Tenta pegar o nome do amigo da lista (cache simples) ou poderia ter um endpoint específico
            const friends = await socialService.getFriends();
            const currentFriend = friends.find(f => f.id === friendId);
            if (currentFriend) setFriend(currentFriend);

            setLoading(false);
        } catch (error) {
            console.error(error);
        }
    };

    // Monitora o scroll para mostrar/esconder botão
    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;

        // Se a distância do fundo for maior que 100px, mostra o botão
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShowScrollButton(!isNearBottom);
        isUserNearBottomRef.current = isNearBottom;
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); // Botão manual pode ser smooth
        setShowScrollButton(false);
    };

    // Auto-scroll inteligente: só rola se o usuário já estiver no fim ou for o carregamento inicial
    useEffect(() => {
        if (!loading) {
            // Se for carregamento inicial ou usuário já estava no fim, rola pro fim
            if (isUserNearBottomRef.current) {
                messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
            }
        }
    }, [messages, loading]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !friendId) return;

        try {
            await socialService.sendMessage(friendId, newMessage);
            setNewMessage('');
            isUserNearBottomRef.current = true; // Força scroll ao enviar
            loadChat(); // Atualiza na hora
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="p-4 text-center">Carregando chat...</div>;

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
                <button
                    onClick={() => router.back()}
                    className="text-gray-500 hover:text-blue-600 p-1 -ml-1 rounded-full hover:bg-gray-100"
                    aria-label="Voltar"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                        {friend?.photoUrl ? (
                            <img src={friend.photoUrl} alt="F" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <User className="w-5 h-5" />
                            </div>
                        )}
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-900">{friend?.name || 'Usuário'}</h1>
                        <span className="text-xs text-green-500 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span> Online
                        </span>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div
                className="flex-1 overflow-y-auto p-4 space-y-4 relative"
                ref={scrollContainerRef}
                onScroll={handleScroll}
            >
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 mt-10">
                        <p>Comece a conversar com {friend?.name}!</p>
                    </div>
                )}

                {messages.map((msg) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm text-sm ${isMe
                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                    }`}
                            >
                                <p>{msg.content}</p>
                                <span className={`text-[10px] block mt-1 text-right ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />

                {/* Scroll Down Button */}
                <button
                    onClick={scrollToBottom}
                    className={`fixed bottom-24 right-6 p-3 bg-white text-blue-600 rounded-full shadow-lg border border-gray-100 transition-all duration-300 transform hover:bg-gray-50 z-20 ${showScrollButton
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-10 pointer-events-none'
                        }`}
                >
                    <ArrowLeft className="w-5 h-5 -rotate-90" />
                </button>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSend} className="flex gap-2 max-w-2xl mx-auto">
                    <input
                        type="text"
                        className="flex-1 bg-gray-100 text-gray-900 placeholder:text-gray-500 border-0 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Digite sua mensagem..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-200"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={<div className="p-4 text-center">Carregando...</div>}>
            <ChatContent />
        </Suspense>
    );
}
