import { apiClient } from './client';
import type { Attachment } from '@/types';

export const attachmentsApi = {
  // Upload attachment
  uploadAttachment: (file: File, defectId?: number, commentId?: number) => {
    const formData = new FormData();
    formData.append('file', file);
    if (defectId) formData.append('defectId', String(defectId));
    if (commentId) formData.append('commentId', String(commentId));
    return apiClient.upload<Attachment>('/attachments/upload', formData);
  },

  // Get attachment by ID
  getAttachmentById: (id: number) =>
    apiClient.get<Attachment>(`/attachments/${id}`),

  // Get attachments by defect ID
  getAttachmentsByDefectId: (defectId: number) =>
    apiClient.get<Attachment[]>(`/attachments/defect/${defectId}`),

  // Get attachments by comment ID
  getAttachmentsByCommentId: (commentId: number) =>
    apiClient.get<Attachment[]>(`/attachments/comment/${commentId}`),

  // Delete attachment
  deleteAttachment: (id: number) =>
    apiClient.delete<{ message: string }>(`/attachments/${id}`),

  // Get download URL
  getDownloadUrl: (id: number) =>
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/attachments/${id}/download`,
};
