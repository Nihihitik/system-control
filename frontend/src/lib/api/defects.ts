import { apiClient } from './client';
import type {
  Defect,
  CreateDefectDto,
  UpdateDefectDto,
  UpdateStatusDto,
  DefectFilterParams,
  PaginatedResponse,
  DefectHistory,
} from '@/types';

export const defectsApi = {
  // Get all defects with filters
  getDefects: (filters?: DefectFilterParams) =>
    apiClient.get<PaginatedResponse<Defect>>('/defects', filters),

  // Get my tasks (assigned or created by me)
  getMyTasks: (filters?: DefectFilterParams) =>
    apiClient.get<PaginatedResponse<Defect>>('/defects/my-tasks', filters),

  // Get assigned defects
  getAssignedDefects: (filters?: DefectFilterParams) =>
    apiClient.get<PaginatedResponse<Defect>>('/defects/assigned', filters),

  // Get created defects
  getCreatedDefects: (filters?: DefectFilterParams) =>
    apiClient.get<PaginatedResponse<Defect>>('/defects/created', filters),

  // Get defects for manager's projects (manager only)
  getManagerDefects: (filters?: DefectFilterParams) =>
    apiClient.get<PaginatedResponse<Defect>>('/defects/manager/all', filters),

  // Get defects for observer's projects (observer only)
  getObserverDefects: (filters?: DefectFilterParams) =>
    apiClient.get<PaginatedResponse<Defect>>('/defects/observer/all', filters),

  // Get defect by ID
  getDefectById: (id: number) =>
    apiClient.get<Defect>(`/defects/${id}`),

  // Create defect
  createDefect: (data: CreateDefectDto) =>
    apiClient.post<Defect>('/defects', data),

  // Update defect
  updateDefect: (id: number, data: UpdateDefectDto) =>
    apiClient.patch<Defect>(`/defects/${id}`, data),

  // Update defect status
  updateDefectStatus: (id: number, data: UpdateStatusDto) =>
    apiClient.patch<Defect>(`/defects/${id}/status`, data),

  // Assign defect (manager only)
  assignDefect: (id: number, assigneeId: number) =>
    apiClient.patch<Defect>(`/defects/${id}/assign/${assigneeId}`),

  // Get defect history
  getDefectHistory: (id: number) =>
    apiClient.get<DefectHistory[]>(`/defects/${id}/history`),
};
