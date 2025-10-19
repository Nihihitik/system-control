// User types
export type UserRole = 'engineer' | 'manager' | 'observer';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

// Defect types
export type DefectStatus = 'new' | 'in_progress' | 'under_review' | 'closed' | 'cancelled';
export type DefectPriority = 'critical' | 'high' | 'medium' | 'low';

export interface Project {
  id: number;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  objects?: BuildingObject[];
  managers?: User[];
  observers?: User[];
  _count?: {
    defects: number;
  };
}

export interface BuildingObject {
  id: number;
  projectId: number;
  name: string;
  type?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  project?: Project;
  stages?: Stage[];
}

export interface Stage {
  id: number;
  buildingObjectId: number;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  buildingObject?: BuildingObject;
}

export interface Defect {
  id: number;
  title: string;
  description: string;
  status: DefectStatus;
  priority: DefectPriority;
  projectId: number;
  buildingObjectId: number;
  stageId: number;
  authorId: number;
  assigneeId?: number;
  plannedDate?: string;
  createdAt: string;
  updatedAt: string;
  project?: Project;
  buildingObject?: BuildingObject;
  stage?: Stage;
  author?: User;
  assignee?: User;
  comments?: Comment[];
  attachments?: Attachment[];
  history?: DefectHistory[];
  _count?: {
    comments: number;
    attachments: number;
  };
}

export interface Comment {
  id: number;
  defectId: number;
  authorId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  author?: User;
  attachments?: Attachment[];
}

export interface Attachment {
  id: number;
  fileName: string;
  mimeType: string;
  fileSize: number;
  defectId?: number;
  commentId?: number;
  createdAt: string;
}

export interface DefectHistory {
  id: number;
  defectId: number;
  userId: number;
  field: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
  user?: User;
}

// API Request types
export interface CreateDefectDto {
  title: string;
  description: string;
  projectId: number;
  buildingObjectId: number;
  stageId: number;
  priority?: DefectPriority;
  plannedDate?: string;
}

export interface UpdateDefectDto {
  title?: string;
  description?: string;
  priority?: DefectPriority;
  plannedDate?: string;
}

export interface UpdateStatusDto {
  status: DefectStatus;
  comment?: string;
}

export interface DefectFilterParams {
  page?: number;
  limit?: number;
  statuses?: DefectStatus[];
  priorities?: DefectPriority[];
  assigneeId?: number;
  authorId?: number;
  projectId?: number;
  buildingObjectId?: number;
  stageId?: number;
  createdFrom?: string;
  createdTo?: string;
  plannedFrom?: string;
  plannedTo?: string;
  overdue?: boolean;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateCommentDto {
  defectId: number;
  content: string;
}

export interface UpdateCommentDto {
  content: string;
}

// Analytics types
export interface AnalyticsOverview {
  total: number;
  byStatus: Record<DefectStatus, number>;
  byPriority: Record<DefectPriority, number>;
}

export interface AnalyticsOverdueDefect extends Defect {
  project: Project;
  buildingObject: BuildingObject;
  stage: Stage;
  assignee?: User;
}

export interface AnalyticsOverdue {
  count: number;
  percentage: number;
  defects: AnalyticsOverdueDefect[];
}

export interface AnalyticsByAssignee {
  assignee: User | { id: null; firstName: string; lastName: string; email: string };
  total: number;
  byStatus: Record<DefectStatus, number>;
}

export interface AnalyticsByLocation {
  object: BuildingObject & { project: Project };
  count: number;
}

export interface AnalyticsTrendsDataPoint {
  date: string;
  created: number;
  closed: number;
}

// Reports export filter params
export interface ExportFiltersParams {
  status?: DefectStatus;
  priority?: DefectPriority;
  projectId?: number;
  buildingObjectId?: number;
  assigneeId?: number;
  dateFrom?: string;
  dateTo?: string;
}
