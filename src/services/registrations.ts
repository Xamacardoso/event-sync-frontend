import api from './api';

export interface Registration {
  id: string;
  eventId: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected' | 'canceled' | 'checked_in';
  createdAt: string;

  // O backend pode retornar o objeto 'event' aninhado dependendo da query
  event?: {
    title: string;
    startDate: string;
    localAddress?: string;
  };
}

export const registrationService = {
  // Rota para criar uma nova inscrição em um evento
  create: async (eventId: string) => {
    // Não precisa de body, o ID vai na URL
    const response = await api.post<Registration>(`/events/${eventId}/register`);
    return response.data;
  },

  // Rota para listar apenas as minhas inscrições
  getMyRegistrations: async () => {
    const response = await api.get<Registration[]>('/registrations/me'); 
    return response.data;
  },
  
  // cancel: async (id: string) => {
  //   const response = await api.delete(`/registrations/${id}`);
  //   return response.data;
  // }
};