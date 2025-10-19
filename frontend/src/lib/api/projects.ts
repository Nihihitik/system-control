import { apiClient } from './client';
import type { Project, BuildingObject, Stage } from '@/types';

export const projectsApi = {
  // Projects
  getProjects: (includeArchived?: boolean) =>
    apiClient.get<Project[]>('/projects', { includeArchived }),

  getProjectById: (id: number) =>
    apiClient.get<Project>(`/projects/${id}`),

  // Building Objects
  getObjectsByProjectId: (projectId: number) =>
    apiClient.get<BuildingObject[]>(`/projects/${projectId}/objects`),

  getObjectById: (id: number) =>
    apiClient.get<BuildingObject>(`/projects/objects/${id}`),

  // Stages
  getStagesByObjectId: (objectId: number) =>
    apiClient.get<Stage[]>(`/projects/objects/${objectId}/stages`),

  getStageById: (id: number) =>
    apiClient.get<Stage>(`/projects/stages/${id}`),
};
