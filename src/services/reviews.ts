import api from './api';

export interface CreateReviewDTO {
    eventId: string;
    rating: number;
    comment?: string;
}

export const reviewsService = {
    create: async (data: CreateReviewDTO) => {
        const response = await api.post('/reviews', data);
        return response.data;
    },
    getMyReview: async (eventId: string) => {
        const response = await api.get(`/reviews/event/${eventId}/me`);
        return response.data;
    }
};
