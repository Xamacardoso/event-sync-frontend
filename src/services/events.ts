import api from './api';
import { Event, CreateEventDTO } from '@/types';

export const eventService = {
  // Lista eventos com filtros
  list: async (filters?: { title?: string; startDate?: string; endDate?: string; type?: 'free' | 'paid'; status?: 'draft' | 'published' | 'canceled' | 'finished' }) => {
    // const params = new URLSearchParams(filters as any).toString();
    const response = await api.get<Event[]>('/events', { params: filters });
    return response.data;
  },

  create: async (data: CreateEventDTO) => {
    const response = await api.post<Event>('/events', data);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<Event>(`/events/${id}`);
    return response.data;
  },

  getMyEvents: async () => {
    const response = await api.get<Event[]>('/events/my-events');
    return response.data;
  },

  cancel: async (id: string) => {
    const response = await api.patch<Event>(`/events/${id}/cancel`);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateEventDTO>) => {
    const response = await api.put<Event>(`/events/${id}`, data);
    return response.data;
  }
};