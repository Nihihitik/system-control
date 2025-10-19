import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  // Helper method to get project IDs based on role
  private async getProjectIds(userId: number, role: 'manager' | 'observer'): Promise<number[]> {
    const relationField = role === 'manager' ? 'managers' : 'observers';
    const projects = await this.prisma.project.findMany({
      where: {
        [relationField]: {
          some: { id: userId },
        },
      },
      select: { id: true },
    });
    return projects.map((p) => p.id);
  }

  async getOverview(userId: number, role: 'manager' | 'observer' = 'manager') {
    // Get all project IDs for this user
    const projectIds = await this.getProjectIds(userId, role);

    if (projectIds.length === 0) {
      return {
        total: 0,
        byStatus: {},
        byPriority: {},
      };
    }

    // Get total count
    const total = await this.prisma.defect.count({
      where: { projectId: { in: projectIds } },
    });

    // Group by status
    const byStatus = await this.prisma.defect.groupBy({
      by: ['status'],
      where: { projectId: { in: projectIds } },
      _count: { status: true },
    });

    // Group by priority
    const byPriority = await this.prisma.defect.groupBy({
      by: ['priority'],
      where: { projectId: { in: projectIds } },
      _count: { priority: true },
    });

    return {
      total,
      byStatus: byStatus.reduce(
        (acc, item) => {
          acc[item.status] = item._count.status;
          return acc;
        },
        {} as Record<string, number>,
      ),
      byPriority: byPriority.reduce(
        (acc, item) => {
          acc[item.priority] = item._count.priority;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }

  async getOverdue(userId: number, role: 'manager' | 'observer' = 'manager') {
    // Get all project IDs for this user
    const projectIds = await this.getProjectIds(userId, role);

    if (projectIds.length === 0) {
      return {
        count: 0,
        percentage: 0,
        defects: [],
      };
    }

    const now = new Date();

    // Get overdue defects (not closed/cancelled and past plannedDate)
    const overdueDefects = await this.prisma.defect.findMany({
      where: {
        projectId: { in: projectIds },
        plannedDate: { lt: now },
        status: { notIn: ['closed', 'cancelled'] },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        buildingObject: {
          select: {
            id: true,
            name: true,
          },
        },
        stage: {
          select: {
            id: true,
            name: true,
          },
        },
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        plannedDate: 'asc',
      },
    });

    // Get total active defects for percentage calculation
    const totalActive = await this.prisma.defect.count({
      where: {
        projectId: { in: projectIds },
        status: { notIn: ['closed', 'cancelled'] },
      },
    });

    const count = overdueDefects.length;
    const percentage = totalActive > 0 ? Math.round((count / totalActive) * 100) : 0;

    return {
      count,
      percentage,
      defects: overdueDefects,
    };
  }

  async getByAssignee(userId: number, role: 'manager' | 'observer' = 'manager') {
    // Get all project IDs for this user
    const projectIds = await this.getProjectIds(userId, role);

    if (projectIds.length === 0) {
      return [];
    }

    // Get all defects for these projects
    const defects = await this.prisma.defect.findMany({
      where: { projectId: { in: projectIds } },
      select: {
        status: true,
        assigneeId: true,
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Group by assignee
    const assigneeMap = new Map<number | null, any>();

    for (const defect of defects) {
      const assigneeId = defect.assigneeId;

      if (!assigneeMap.has(assigneeId)) {
        assigneeMap.set(assigneeId, {
          assignee: assigneeId
            ? defect.assignee
            : { id: null, firstName: 'Не назначено', lastName: '', email: '' },
          total: 0,
          byStatus: {
            new: 0,
            in_progress: 0,
            under_review: 0,
            closed: 0,
            cancelled: 0,
          },
        });
      }

      const entry = assigneeMap.get(assigneeId);
      entry.total += 1;
      entry.byStatus[defect.status] += 1;
    }

    return Array.from(assigneeMap.values()).sort((a, b) => b.total - a.total);
  }

  async getByLocation(userId: number, role: 'manager' | 'observer' = 'manager') {
    // Get all project IDs for this user
    const projectIds = await this.getProjectIds(userId, role);

    if (projectIds.length === 0) {
      return [];
    }

    // Group by building object
    const byObject = await this.prisma.defect.groupBy({
      by: ['buildingObjectId'],
      where: { projectId: { in: projectIds } },
      _count: { buildingObjectId: true },
    });

    // Get building object details
    const objectDetails = await this.prisma.buildingObject.findMany({
      where: {
        id: { in: byObject.map((o) => o.buildingObjectId) },
      },
      select: {
        id: true,
        name: true,
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Combine data
    const objectMap = new Map(objectDetails.map((obj) => [obj.id, obj]));

    const result = byObject.map((item) => ({
      object: objectMap.get(item.buildingObjectId),
      count: item._count.buildingObjectId,
    }));

    return result.sort((a, b) => b.count - a.count);
  }

  async getTrends(userId: number, role: 'manager' | 'observer' = 'manager', days: number = 30) {
    // Get all project IDs for this user
    const projectIds = await this.getProjectIds(userId, role);

    if (projectIds.length === 0) {
      return [];
    }

    // Calculate start date (days ago from today)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get defects created in the period
    const createdDefects = await this.prisma.defect.findMany({
      where: {
        projectId: { in: projectIds },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        createdAt: true,
      },
    });

    // Get defects closed in the period
    const closedDefects = await this.prisma.defect.findMany({
      where: {
        projectId: { in: projectIds },
        status: 'closed',
        updatedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        updatedAt: true,
      },
    });

    // Group by date
    const dateMap = new Map<string, { date: string; created: number; closed: number }>();

    // Initialize all dates in the range
    for (let i = 0; i <= days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dateMap.set(dateStr, { date: dateStr, created: 0, closed: 0 });
    }

    // Count created defects per date
    for (const defect of createdDefects) {
      const dateStr = defect.createdAt.toISOString().split('T')[0];
      const entry = dateMap.get(dateStr);
      if (entry) {
        entry.created += 1;
      }
    }

    // Count closed defects per date
    for (const defect of closedDefects) {
      const dateStr = defect.updatedAt.toISOString().split('T')[0];
      const entry = dateMap.get(dateStr);
      if (entry) {
        entry.closed += 1;
      }
    }

    return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }
}
