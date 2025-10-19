import { apiClient } from './client';
import type {
  AnalyticsOverview,
  AnalyticsOverdue,
  AnalyticsByAssignee,
  AnalyticsByLocation,
} from '@/types';

export const analyticsApi = {
  getOverview: () => apiClient.get<AnalyticsOverview>('/analytics/overview'),

  getOverdue: () => apiClient.get<AnalyticsOverdue>('/analytics/overdue'),

  getByAssignee: () => apiClient.get<AnalyticsByAssignee[]>('/analytics/by-assignee'),

  getByLocation: () => apiClient.get<AnalyticsByLocation[]>('/analytics/by-location'),
};
