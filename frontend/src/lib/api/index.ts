import { defectsApi } from './defects';
import { projectsApi } from './projects';
import { commentsApi } from './comments';
import { attachmentsApi } from './attachments';
import { analyticsApi } from './analytics';
import { reportsApi } from './reports';
import { usersApi } from './users';

// Unified API object with all methods
export const api = {
  // Defects
  getDefects: defectsApi.getDefects,
  getMyTasks: defectsApi.getMyTasks,
  getAssignedDefects: defectsApi.getAssignedDefects,
  getCreatedDefects: defectsApi.getCreatedDefects,
  getDefectById: defectsApi.getDefectById,
  createDefect: defectsApi.createDefect,
  updateDefect: defectsApi.updateDefect,
  updateDefectStatus: defectsApi.updateDefectStatus,
  assignDefect: defectsApi.assignDefect,
  getDefectHistory: defectsApi.getDefectHistory,

  // Projects
  getProjects: projectsApi.getProjects,
  getProjectById: projectsApi.getProjectById,
  getObjectById: projectsApi.getObjectById,
  getStageById: projectsApi.getStageById,

  // Comments
  getCommentsByDefectId: commentsApi.getCommentsByDefectId,
  createComment: commentsApi.createComment,
  updateComment: commentsApi.updateComment,
  deleteComment: commentsApi.deleteComment,

  // Attachments
  uploadAttachment: attachmentsApi.uploadAttachment,
  getAttachmentById: attachmentsApi.getAttachmentById,
  getAttachmentsByDefectId: attachmentsApi.getAttachmentsByDefectId,
  getAttachmentsByCommentId: attachmentsApi.getAttachmentsByCommentId,
  deleteAttachment: attachmentsApi.deleteAttachment,
  getDownloadUrl: attachmentsApi.getDownloadUrl,
};

// Also export individual modules
export { apiClient } from './client';
export { defectsApi } from './defects';
export { projectsApi } from './projects';
export { commentsApi } from './comments';
export { attachmentsApi } from './attachments';
export { analyticsApi } from './analytics';
export { reportsApi } from './reports';
export { usersApi } from './users';
