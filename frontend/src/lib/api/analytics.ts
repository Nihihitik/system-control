import { apiClient } from './client';
import type {
  AnalyticsOverview,
  AnalyticsOverdue,
  AnalyticsByAssignee,
  AnalyticsByLocation,
  AnalyticsTrendsDataPoint,
} from '@/types';

export const analyticsApi = {
  getOverview: () => apiClient.get<AnalyticsOverview>('/analytics/overview'),

  getOverdue: () => apiClient.get<AnalyticsOverdue>('/analytics/overdue'),

  getByAssignee: () => apiClient.get<AnalyticsByAssignee[]>('/analytics/by-assignee'),

  getByLocation: () => apiClient.get<AnalyticsByLocation[]>('/analytics/by-location'),

  getTrends: (days = 30) =>
    apiClient.get<AnalyticsTrendsDataPoint[]>('/analytics/trends', { days }),
};
