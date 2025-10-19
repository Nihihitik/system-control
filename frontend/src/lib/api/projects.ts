import { apiClient } from './client';
import type { Project, BuildingObject, Stage } from '@/types';

interface CreateProjectDto {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

interface UpdateProjectDto {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isArchived?: boolean;
}

interface CreateObjectDto {
  projectId: number;
  name: string;
  type?: string;
  description?: string;
}

interface UpdateObjectDto {
  name?: string;
  type?: string;
  description?: string;
}

interface CreateStageDto {
  buildingObjectId: number;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

interface UpdateStageDto {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export const projectsApi = {
  // Projects - Read
  getProjects: (includeArchived?: boolean) =>
    apiClient.get<Project[]>('/projects', { includeArchived }),

  getMyProjects: () => apiClient.get<Project[]>('/projects/my'),

  getProjectById: (id: number) => apiClient.get<Project>(`/projects/${id}`),

  // Projects - Create/Update/Delete (Manager only)
  createProject: (data: CreateProjectDto) =>
    apiClient.post<Project>('/projects', data),

  updateProject: (id: number, data: UpdateProjectDto) =>
    apiClient.patch<Project>(`/projects/${id}`, data),

  archiveProject: (id: number) =>
    apiClient.patch<Project>(`/projects/${id}/archive`, {}),

  deleteProject: (id: number) =>
    apiClient.delete<{ message: string }>(`/projects/${id}`),

  // Manager assignment
  assignManager: (projectId: number, managerId: number) =>
    apiClient.patch<Project>(`/projects/${projectId}/managers/${managerId}`, {}),

  removeManager: (projectId: number, managerId: number) =>
    apiClient.delete<Project>(`/projects/${projectId}/managers/${managerId}`),

  // Building Objects - Read
  getObjectsByProjectId: (projectId: number) =>
    apiClient.get<BuildingObject[]>(`/projects/${projectId}/objects`),

  getObjectById: (id: number) =>
    apiClient.get<BuildingObject>(`/projects/objects/${id}`),

  // Building Objects - Create/Update/Delete (Manager only)
  createObject: (data: CreateObjectDto) =>
    apiClient.post<BuildingObject>('/projects/objects', data),

  updateObject: (id: number, data: UpdateObjectDto) =>
    apiClient.patch<BuildingObject>(`/projects/objects/${id}`, data),

  deleteObject: (id: number) =>
    apiClient.delete<{ message: string }>(`/projects/objects/${id}`),

  // Stages - Read
  getStagesByObjectId: (objectId: number) =>
    apiClient.get<Stage[]>(`/projects/objects/${objectId}/stages`),

  getStageById: (id: number) => apiClient.get<Stage>(`/projects/stages/${id}`),

  // Stages - Create/Update/Delete (Manager only)
  createStage: (data: CreateStageDto) =>
    apiClient.post<Stage>('/projects/stages', data),

  updateStage: (id: number, data: UpdateStageDto) =>
    apiClient.patch<Stage>(`/projects/stages/${id}`, data),

  deleteStage: (id: number) =>
    apiClient.delete<{ message: string }>(`/projects/stages/${id}`),
};
