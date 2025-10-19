import { apiClient } from './client';
import type { Comment, CreateCommentDto, UpdateCommentDto } from '@/types';

export const commentsApi = {
  // Get comments by defect ID
  getCommentsByDefectId: (defectId: number) =>
    apiClient.get<Comment[]>(`/comments/defect/${defectId}`),

  // Create comment
  createComment: (data: CreateCommentDto) =>
    apiClient.post<Comment>('/comments', data),

  // Update comment
  updateComment: (id: number, data: UpdateCommentDto) =>
    apiClient.patch<Comment>(`/comments/${id}`, data),

  // Delete comment
  deleteComment: (id: number) =>
    apiClient.delete<{ message: string }>(`/comments/${id}`),
};
