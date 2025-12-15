import api from './api';

export interface DashboardStats {
    totalEvents: number;
    totalRegistrations: number;
    nextEvent: {
        id: string;
        title: string;
        startDate: string;
    } | null;
}

export const dashboardService = {
    getStats: async () => {
        const response = await api.get<DashboardStats>('/dashboard/stats');
        return response.data;
    }
};
