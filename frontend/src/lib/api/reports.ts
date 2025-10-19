import type { ExportFiltersParams } from '@/types';

// Get API base URL
const getApiUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:3000';
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
};

const buildQueryString = (params: ExportFiltersParams): string => {
  const query = new URLSearchParams();

  if (params.status) query.append('status', params.status);
  if (params.priority) query.append('priority', params.priority);
  if (params.projectId) query.append('projectId', params.projectId.toString());
  if (params.buildingObjectId)
    query.append('buildingObjectId', params.buildingObjectId.toString());
  if (params.assigneeId) query.append('assigneeId', params.assigneeId.toString());
  if (params.dateFrom) query.append('dateFrom', params.dateFrom);
  if (params.dateTo) query.append('dateTo', params.dateTo);

  return query.toString();
};

export const reportsApi = {
  exportDefectsToCSV: (filters: ExportFiltersParams = {}): string => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const queryString = buildQueryString(filters);
    const url = `${getApiUrl()}/reports/defects/csv${queryString ? `?${queryString}` : ''}`;

    if (token) {
      return `${url}${queryString ? '&' : '?'}token=${token}`;
    }

    return url;
  },

  exportDefectsToExcel: (filters: ExportFiltersParams = {}): string => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const queryString = buildQueryString(filters);
    const url = `${getApiUrl()}/reports/defects/excel${queryString ? `?${queryString}` : ''}`;

    if (token) {
      return `${url}${queryString ? '&' : '?'}token=${token}`;
    }

    return url;
  },

  downloadCSV: async (filters: ExportFiltersParams = {}) => {
    const url = reportsApi.exportDefectsToCSV(filters);
    window.open(url, '_blank');
  },

  downloadExcel: async (filters: ExportFiltersParams = {}) => {
    const url = reportsApi.exportDefectsToExcel(filters);
    window.open(url, '_blank');
  },
};
