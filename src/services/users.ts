import api from './api';

export interface UserDetails {
    id: string;
    name: string;
    email: string;
    city?: string;
    photoUrl?: string;
    role: 'user' | 'organizer' | 'admin';
    organizerRating?: number;
    visibilityParticipation?: boolean;
}

export interface UpdateUserDTO {
    name?: string;
    city?: string;
    photoUrl?: string;
    visibilityParticipation?: boolean;
    password?: string; // Optional if we allow password update
}

export const userService = {
    getProfile: async () => {
        const response = await api.get<UserDetails>('/users/me');
        return response.data;
    },

    updateProfile: async (data: UpdateUserDTO) => {
        const response = await api.put<UserDetails>('/users/me', data);
        return response.data;
    }
};
