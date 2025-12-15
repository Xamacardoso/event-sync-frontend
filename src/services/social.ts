import api from './api';

export interface FriendRequest {
    id: string;
    requesterId: string;
    recipientId: string;
    status: 'pending' | 'accepted' | 'rejected';
    timestamp: string;
}

export interface FriendUser {
    id: string;
    name: string;
    photoUrl?: string;
    city?: string;
}

export interface Message {
    id: string;
    senderId: string;
    recipientId: string;
    content: string;
    timestamp: string;
}

export const socialService = {
    // Enviar Pedido
    sendRequest: async (targetUserId: string) => {
        const response = await api.post(`/social/friend-request/${targetUserId}`);
        return response.data;
    },

    // Responder Pedido
    respondRequest: async (requestId: string, action: 'accepted' | 'rejected') => {
        const response = await api.patch(`/social/friend-request/${requestId}/respond`, { action });
        return response.data;
    },

    // Listar Amigos
    getFriends: async () => {
        const response = await api.get<FriendUser[]>('/social/friends');
        return response.data;
    },

    // Listar Pedidos Pendentes
    getPendingRequests: async () => {
        const response = await api.get<FriendRequest[]>('/social/requests/pending');
        return response.data;
    },

    // Enviar Mensagem
    sendMessage: async (friendId: string, content: string) => {
        const response = await api.post(`/social/messages/${friendId}`, { content });
        return response.data;
    },

    // Obter Mensagens
    getMessages: async (friendId: string) => {
        const response = await api.get<Message[]>(`/social/messages/${friendId}`);
        return response.data;
    }
};
