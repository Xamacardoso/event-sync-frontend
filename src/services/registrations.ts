import api from './api';

export interface Registration {
  id: string;
  eventId: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected' | 'canceled' | 'checked_in';
  createdAt: string;
  checkedInAt?: string | null;

  // O backend pode retornar o objeto 'event' aninhado dependendo da query
  event?: {
    title: string;
    startDate: string;
    localAddress?: string;
    status: 'draft' | 'published' | 'finished' | 'canceled';
  };

  user?: {
    name: string;
    email: string;
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

  cancel: async (id: string) => {
    const response = await api.patch(`/registrations/${id}/cancel`);
    return response.data;
  },

  // Lista todos os inscritos de um evento (Apenas Organizador)
  getEventRegistrations: async (eventId: string) => {
    const response = await api.get<Registration[]>(`/events/${eventId}/registrations`);
    return response.data;
  },

  // Atualiza o status (Aprovar/Recusar)
  updateStatus: async (registrationId: string, status: 'approved' | 'rejected') => {
    const response = await api.patch(`/registrations/${registrationId}/status`, { status });
    return response.data;
  },

  checkIn: async (registrationId: string, method: 'manual' | 'qr' = 'qr') => {
    // Supondo que sua rota no backend seja PATCH /registrations/:id/check-in
    const response = await api.post(`/registrations/${registrationId}/check-in`, { method });
    return response.data;
  }
};