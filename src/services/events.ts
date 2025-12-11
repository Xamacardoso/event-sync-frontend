import api from './api';
import { Event, CreateEventDTO } from '@/types';

export const eventService = {
  // Lista eventos (o backend filtra por padrão)
  list: async () => {
    // buscar os publicados por padrão para o Feed
    const response = await api.get<Event[]>('/events?status=published');
    return response.data;
  },

  create: async (data: CreateEventDTO) => {
    const response = await api.post<Event>('/events', data);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<Event>(`/events/${id}`);
    return response.data;
  }
};