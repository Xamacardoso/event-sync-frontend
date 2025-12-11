export interface Event {
    id: string;
    title: string;
    description: string;
    localAddress?: string | null;
    localUrl?: string | null;
    startDate: string; // Vem como string ISO do backend
    endDate: string;
    price: number;
    type: 'free' | 'paid';
    status: 'draft' | 'published' | 'finished' | 'canceled';
    bannerUrl?: string | null;
    organizerId: string;
    maxAttendees?: number | null;
  }
  
export interface CreateEventDTO {
    title: string;
    description: string;
    localAddress?: string;
    localUrl?: string;
    startDate: string;
    endDate: string;
    price: number;
    type: 'free' | 'paid';
    maxAttendees?: number;
}