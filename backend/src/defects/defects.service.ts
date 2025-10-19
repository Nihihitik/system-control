import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DefectStatus } from '@prisma/client';
import { CreateDefectDto } from './dto/create-defect.dto';
import { UpdateDefectDto } from './dto/update-defect.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { DefectFilterDto } from './dto/defect-filter.dto';

@Injectable()
export class DefectsService {
  constructor(private prisma: PrismaService) {}

  // Create defect
  async createDefect(dto: CreateDefectDto, authorId: number) {
    // Validate project, object, and stage exist
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${dto.projectId} not found`);
    }

    const buildingObject = await this.prisma.buildingObject.findUnique({
      where: { id: dto.buildingObjectId },
    });
    if (!buildingObject) {
      throw new NotFoundException(`Building object with ID ${dto.buildingObjectId} not found`);
    }

    const stage = await this.prisma.stage.findUnique({
      where: { id: dto.stageId },
    });
    if (!stage) {
      throw new NotFoundException(`Stage with ID ${dto.stageId} not found`);
    }

    // Create defect
    return this.prisma.defect.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority || 'medium',
        projectId: dto.projectId,
        buildingObjectId: dto.buildingObjectId,
        stageId: dto.stageId,
        authorId,
        plannedDate: dto.plannedDate ? new Date(dto.plannedDate) : null,
      },
      include: {
        project: true,
        buildingObject: true,
        stage: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            email: true,
            role: true,
          },
        },
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            comments: true,
            attachments: true,
          },
        },
      },
    });
  }

  // Find all defects with filters and pagination
  async findAllDefects(filters: DefectFilterDto) {
    const {
      page = 1,
      limit = 25,
      statuses,
      priorities,
      assigneeId,
      authorId,
      projectId,
      buildingObjectId,
      stageId,
      createdFrom,
      createdTo,
      plannedFrom,
      plannedTo,
      overdue,
      search,
    } = filters;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (statuses && statuses.length > 0) {
      where.status = { in: statuses };
    }

    if (priorities && priorities.length > 0) {
      where.priority = { in: priorities };
    }

    if (assigneeId) {
      where.assigneeId = assigneeId;
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    if (buildingObjectId) {
      where.buildingObjectId = buildingObjectId;
    }

    if (stageId) {
      where.stageId = stageId;
    }

    if (createdFrom || createdTo) {
      where.createdAt = {};
      if (createdFrom) {
        where.createdAt.gte = new Date(createdFrom);
      }
      if (createdTo) {
        where.createdAt.lte = new Date(createdTo);
      }
    }

    if (plannedFrom || plannedTo) {
      where.plannedDate = {};
      if (plannedFrom) {
        where.plannedDate.gte = new Date(plannedFrom);
      }
      if (plannedTo) {
        where.plannedDate.lte = new Date(plannedTo);
      }
    }

    if (overdue) {
      where.plannedDate = { lt: new Date() };
      where.status = { notIn: [DefectStatus.closed, DefectStatus.cancelled] };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await this.prisma.defect.count({ where });

    // Get defects
    const defects = await this.prisma.defect.findMany({
      where,
      skip,
      take: limit,
      include: {
        project: { select: { id: true, name: true } },
        buildingObject: { select: { id: true, name: true } },
        stage: { select: { id: true, name: true } },
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            email: true,
            role: true,
          },
        },
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            comments: true,
            attachments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      data: defects,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Find engineer's tasks (created or assigned to them)
  async findMyTasks(userId: number, filters: DefectFilterDto) {
    return this.findAllDefects({
      ...filters,
      // Override to show only user's defects
    });
  }

  // Get defects assigned to engineer
  async findAssignedDefects(userId: number, filters: DefectFilterDto) {
    return this.findAllDefects({
      ...filters,
      assigneeId: userId,
    });
  }

  // Get defects created by engineer
  async findCreatedDefects(userId: number, filters: DefectFilterDto) {
    return this.findAllDefects({
      ...filters,
      authorId: userId,
    });
  }

  // Get defects for manager's projects
  async findManagerDefects(managerId: number, filters: DefectFilterDto) {
    // Get all project IDs for this manager
    const managerProjects = await this.prisma.project.findMany({
      where: {
        managers: {
          some: { id: managerId },
        },
      },
      select: { id: true },
    });

    const projectIds = managerProjects.map((p) => p.id);

    if (projectIds.length === 0) {
      return {
        data: [],
        meta: {
          total: 0,
          page: filters.page || 1,
          limit: filters.limit || 10,
          totalPages: 0,
        },
      };
    }

    // Use the existing findAllDefects with projectId filter
    // But we need to filter by array of project IDs
    // So we'll do a custom query here
    const where: any = {
      projectId: { in: projectIds },
    };

    // Apply other filters
    if (filters.statuses && filters.statuses.length > 0) {
      where.status = { in: filters.statuses };
    }
    if (filters.priorities && filters.priorities.length > 0) {
      where.priority = { in: filters.priorities };
    }
    if (filters.projectId) {
      where.projectId = filters.projectId;
    }
    if (filters.buildingObjectId) {
      where.buildingObjectId = filters.buildingObjectId;
    }
    if (filters.stageId) {
      where.stageId = filters.stageId;
    }
    if (filters.assigneeId) {
      where.assigneeId = filters.assigneeId;
    }
    if (filters.authorId) {
      where.authorId = filters.authorId;
    }
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await this.prisma.defect.count({ where });

    // Get defects
    const defects = await this.prisma.defect.findMany({
      where,
      include: {
        project: true,
        buildingObject: true,
        stage: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            comments: true,
            attachments: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: defects,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Find defect by ID
  async findDefectById(id: number) {
    const defect = await this.prisma.defect.findUnique({
      where: { id },
      include: {
        project: true,
        buildingObject: true,
        stage: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            email: true,
            role: true,
          },
        },
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            email: true,
            role: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                middleName: true,
                email: true,
                role: true,
              },
            },
            attachments: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        attachments: true,
        history: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                middleName: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!defect) {
      throw new NotFoundException(`Defect with ID ${id} not found`);
    }

    return defect;
  }

  // Update defect (only author, assignee, or manager)
  async updateDefect(id: number, dto: UpdateDefectDto, userId: number, userRole: string) {
    const defect = await this.findDefectById(id);

    // Check permissions
    const isAuthor = defect.authorId === userId;
    const isAssignee = defect.assigneeId === userId;
    const isManager = userRole === 'manager';

    if (!isAuthor && !isAssignee && !isManager) {
      throw new ForbiddenException('You do not have permission to edit this defect');
    }

    // Check if defect is in final status
    if (defect.status === DefectStatus.closed || defect.status === DefectStatus.cancelled) {
      if (!isManager) {
        throw new ForbiddenException('Cannot edit defect in final status');
      }
    }

    // Log changes to history
    if (dto.priority && dto.priority !== defect.priority) {
      await this.logHistory(id, userId, 'priority', defect.priority, dto.priority);
    }

    if (dto.plannedDate && new Date(dto.plannedDate).getTime() !== defect.plannedDate?.getTime()) {
      await this.logHistory(
        id,
        userId,
        'plannedDate',
        defect.plannedDate?.toISOString(),
        new Date(dto.plannedDate).toISOString(),
      );
    }

    // Update defect
    return this.prisma.defect.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.priority && { priority: dto.priority }),
        ...(dto.plannedDate && { plannedDate: new Date(dto.plannedDate) }),
      },
      include: {
        project: true,
        buildingObject: true,
        stage: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            email: true,
            role: true,
          },
        },
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  // Update defect status
  async updateDefectStatus(
    id: number,
    dto: UpdateStatusDto,
    userId: number,
    userRole: string,
  ) {
    const defect = await this.findDefectById(id);

    // Check if status transition is valid
    this.validateStatusTransition(defect.status, dto.status, userId, userRole, defect);

    // Log status change
    await this.logHistory(id, userId, 'status', defect.status, dto.status);

    // Add comment if provided
    if (dto.comment) {
      await this.prisma.comment.create({
        data: {
          defectId: id,
          authorId: userId,
          content: `Статус изменен на "${dto.status}": ${dto.comment}`,
        },
      });
    }

    // Update status
    return this.prisma.defect.update({
      where: { id },
      data: {
        status: dto.status,
      },
      include: {
        project: true,
        buildingObject: true,
        stage: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            email: true,
            role: true,
          },
        },
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  // Assign defect to engineer (manager only)
  async assignDefect(id: number, assigneeId: number) {
    const defect = await this.findDefectById(id);

    // Check if assignee exists and is engineer
    const assignee = await this.prisma.user.findUnique({
      where: { id: assigneeId },
    });

    if (!assignee) {
      throw new NotFoundException(`User with ID ${assigneeId} not found`);
    }

    if (assignee.role !== 'engineer') {
      throw new BadRequestException('Can only assign defects to engineers');
    }

    // Log assignment change
    await this.logHistory(
      id,
      assigneeId,
      'assignee',
      defect.assignee?.email || 'unassigned',
      assignee.email,
    );

    // Update assignee
    return this.prisma.defect.update({
      where: { id },
      data: {
        assigneeId,
        status: defect.status === DefectStatus.new ? DefectStatus.in_progress : defect.status,
      },
      include: {
        project: true,
        buildingObject: true,
        stage: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            email: true,
            role: true,
          },
        },
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  // Get defect history
  async getDefectHistory(id: number) {
    await this.findDefectById(id);

    return this.prisma.defectHistory.findMany({
      where: { defectId: id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Private: Log history
  private async logHistory(
    defectId: number,
    userId: number,
    field: string,
    oldValue: string | null | undefined,
    newValue: string | null | undefined,
  ) {
    await this.prisma.defectHistory.create({
      data: {
        defectId,
        userId,
        field,
        oldValue: oldValue || null,
        newValue: newValue || null,
      },
    });
  }

  // Private: Validate status transition
  private validateStatusTransition(
    currentStatus: DefectStatus,
    newStatus: DefectStatus,
    userId: number,
    userRole: string,
    defect: any,
  ) {
    // Manager can change any status
    if (userRole === 'manager') {
      return;
    }

    // Engineer can only change status of assigned defects
    if (defect.assigneeId !== userId) {
      throw new ForbiddenException('You can only change status of defects assigned to you');
    }

    // Validate allowed transitions for engineer
    const allowedTransitions: Record<DefectStatus, DefectStatus[]> = {
      [DefectStatus.new]: [DefectStatus.in_progress],
      [DefectStatus.in_progress]: [DefectStatus.under_review],
      [DefectStatus.under_review]: [], // Only manager can change from this status
      [DefectStatus.closed]: [], // Final status
      [DefectStatus.cancelled]: [], // Final status
    };

    if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }
}
