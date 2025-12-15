'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { socialService, Message } from '@/services/social';
import { ArrowLeft, Send, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { eventService } from '@/services/events';
import { Event } from '@/types';
import { toast } from 'sonner';

function EventChatContent() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const params = useParams();
    const eventId = params.id as string;

    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [event, setEvent] = useState<Event | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isAuthenticated) router.push('/login');
    }, [isAuthenticated, router]);

    // Load Event Info
    useEffect(() => {
        async function loadEvent() {
            try {
                const data = await eventService.getById(eventId);
                setEvent(data);
            } catch (error) {
                console.error('Error loading event', error);
            }
        }
        if (eventId) loadEvent();
    }, [eventId]);

    // Load Messages & Poll
    useEffect(() => {
        if (eventId) {
            loadChat();
            const interval = setInterval(loadChat, 5000);
            return () => clearInterval(interval);
        }
    }, [eventId]);

    const loadChat = async () => {
        try {
            const msgs = await socialService.getEventMessages(eventId);
            setMessages(msgs);
            setLoading(false);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await socialService.sendEventMessage(eventId, newMessage);
            setNewMessage('');
            loadChat();
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddFriend = async (targetId: string) => {
        try {
            await socialService.sendRequest(targetId);
            toast.success('Pedido de amizade enviado!');
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || 'Erro ao enviar pedido.';
            toast.error(msg);
        }
    };

    if (loading) return <div className="p-4 text-center">Carregando Chat do Evento...</div>;

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
                <Link href={`/events/${eventId}`} className="text-gray-500 hover:text-blue-600">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="font-bold text-gray-900">{event?.title || 'Chat do Evento'}</h1>
                    <span className="text-xs text-gray-500">Chat Geral</span>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 mt-10">
                        <p>Seja o primeiro a mandar mensagem!</p>
                    </div>
                )}

                {messages.map((msg) => {
                    const isMe = msg.senderId === user?.id;
                    const senderName = msg.sender?.name || 'Usuário';

                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[80%] px-4 py-2 rounded-2xl shadow-sm text-sm group ${isMe
                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                    }`}
                            >
                                {!isMe && (
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-gray-500">{senderName}</span>
                                        <button
                                            onClick={() => handleAddFriend(msg.senderId)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-gray-100 rounded-full text-blue-500"
                                            title="Adicionar Amigo"
                                        >
                                            <UserPlus className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                                <p>{msg.content}</p>
                                <span className={`text-[10px] block mt-1 text-right ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSend} className="flex gap-2 max-w-2xl mx-auto">
                    <input
                        type="text"
                        className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-3 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900"
                        placeholder="Mensagem para o evento..."
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

export default function EventChatPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <EventChatContent />
        </Suspense>
    );
}
