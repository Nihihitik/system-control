import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateObjectDto } from './dto/create-object.dto';
import { UpdateObjectDto } from './dto/update-object.dto';
import { CreateStageDto } from './dto/create-stage.dto';
import { UpdateStageDto } from './dto/update-stage.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  // Projects CRUD
  async createProject(dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      },
      include: {
        objects: {
          include: {
            stages: true,
          },
        },
        _count: {
          select: {
            defects: true,
          },
        },
      },
    });
  }

  async findAllProjects(includeArchived = false) {
    return this.prisma.project.findMany({
      where: includeArchived ? {} : { isArchived: false },
      include: {
        objects: {
          include: {
            stages: true,
          },
        },
        _count: {
          select: {
            defects: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findProjectById(id: number) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        objects: {
          include: {
            stages: true,
            _count: {
              select: {
                defects: true,
              },
            },
          },
        },
        _count: {
          select: {
            defects: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async updateProject(id: number, dto: UpdateProjectDto) {
    await this.findProjectById(id);

    return this.prisma.project.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.startDate && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate && { endDate: new Date(dto.endDate) }),
        ...(dto.isArchived !== undefined && { isArchived: dto.isArchived }),
      },
      include: {
        objects: {
          include: {
            stages: true,
          },
        },
        _count: {
          select: {
            defects: true,
          },
        },
      },
    });
  }

  async archiveProject(id: number) {
    await this.findProjectById(id);

    return this.prisma.project.update({
      where: { id },
      data: { isArchived: true },
    });
  }

  async deleteProject(id: number) {
    await this.findProjectById(id);

    // Check if project has any defects
    const defectsCount = await this.prisma.defect.count({
      where: { projectId: id },
    });

    if (defectsCount > 0) {
      throw new BadRequestException(
        `Cannot delete project with existing defects. Archive it instead.`,
      );
    }

    await this.prisma.project.delete({
      where: { id },
    });

    return { message: 'Project deleted successfully' };
  }

  // Building Objects CRUD
  async createObject(dto: CreateObjectDto) {
    // Check if project exists
    await this.findProjectById(dto.projectId);

    return this.prisma.buildingObject.create({
      data: {
        projectId: dto.projectId,
        name: dto.name,
        type: dto.type,
        description: dto.description,
      },
      include: {
        stages: true,
        _count: {
          select: {
            defects: true,
          },
        },
      },
    });
  }

  async findObjectById(id: number) {
    const object = await this.prisma.buildingObject.findUnique({
      where: { id },
      include: {
        project: true,
        stages: true,
        _count: {
          select: {
            defects: true,
          },
        },
      },
    });

    if (!object) {
      throw new NotFoundException(`Building object with ID ${id} not found`);
    }

    return object;
  }

  async updateObject(id: number, dto: UpdateObjectDto) {
    await this.findObjectById(id);

    return this.prisma.buildingObject.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
      include: {
        stages: true,
        _count: {
          select: {
            defects: true,
          },
        },
      },
    });
  }

  async deleteObject(id: number) {
    await this.findObjectById(id);

    // Check if object has any defects
    const defectsCount = await this.prisma.defect.count({
      where: { buildingObjectId: id },
    });

    if (defectsCount > 0) {
      throw new BadRequestException(
        `Cannot delete building object with existing defects`,
      );
    }

    await this.prisma.buildingObject.delete({
      where: { id },
    });

    return { message: 'Building object deleted successfully' };
  }

  // Stages CRUD
  async createStage(dto: CreateStageDto) {
    // Check if building object exists
    await this.findObjectById(dto.buildingObjectId);

    return this.prisma.stage.create({
      data: {
        buildingObjectId: dto.buildingObjectId,
        name: dto.name,
        description: dto.description,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      },
      include: {
        buildingObject: true,
        _count: {
          select: {
            defects: true,
          },
        },
      },
    });
  }

  async findStageById(id: number) {
    const stage = await this.prisma.stage.findUnique({
      where: { id },
      include: {
        buildingObject: {
          include: {
            project: true,
          },
        },
        _count: {
          select: {
            defects: true,
          },
        },
      },
    });

    if (!stage) {
      throw new NotFoundException(`Stage with ID ${id} not found`);
    }

    return stage;
  }

  async updateStage(id: number, dto: UpdateStageDto) {
    await this.findStageById(id);

    return this.prisma.stage.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.startDate && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate && { endDate: new Date(dto.endDate) }),
      },
      include: {
        buildingObject: true,
        _count: {
          select: {
            defects: true,
          },
        },
      },
    });
  }

  async deleteStage(id: number) {
    await this.findStageById(id);

    // Check if stage has any defects
    const defectsCount = await this.prisma.defect.count({
      where: { stageId: id },
    });

    if (defectsCount > 0) {
      throw new BadRequestException(`Cannot delete stage with existing defects`);
    }

    await this.prisma.stage.delete({
      where: { id },
    });

    return { message: 'Stage deleted successfully' };
  }

  // Manager-specific methods
  async findManagerProjects(managerId: number) {
    return this.prisma.project.findMany({
      where: {
        managers: {
          some: {
            id: managerId,
          },
        },
        isArchived: false,
      },
      include: {
        objects: {
          include: {
            stages: true,
            _count: {
              select: {
                defects: true,
              },
            },
          },
        },
        _count: {
          select: {
            defects: true,
          },
        },
        managers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async assignManager(projectId: number, managerId: number) {
    await this.findProjectById(projectId);

    // Verify user is a manager
    const user = await this.prisma.user.findUnique({
      where: { id: managerId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${managerId} not found`);
    }

    if (user.role !== 'manager') {
      throw new BadRequestException(`User is not a manager`);
    }

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        managers: {
          connect: { id: managerId },
        },
      },
      include: {
        managers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async removeManager(projectId: number, managerId: number) {
    await this.findProjectById(projectId);

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        managers: {
          disconnect: { id: managerId },
        },
      },
      include: {
        managers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  // Observer-specific methods
  async findObserverProjects(observerId: number) {
    return this.prisma.project.findMany({
      where: {
        observers: {
          some: {
            id: observerId,
          },
        },
        isArchived: false,
      },
      include: {
        objects: {
          include: {
            stages: true,
            _count: {
              select: {
                defects: true,
              },
            },
          },
        },
        _count: {
          select: {
            defects: true,
          },
        },
        observers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async assignObserver(projectId: number, observerId: number) {
    await this.findProjectById(projectId);

    // Verify user is an observer
    const user = await this.prisma.user.findUnique({
      where: { id: observerId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${observerId} not found`);
    }

    if (user.role !== 'observer') {
      throw new BadRequestException(`User is not an observer`);
    }

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        observers: {
          connect: { id: observerId },
        },
      },
      include: {
        observers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async removeObserver(projectId: number, observerId: number) {
    await this.findProjectById(projectId);

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        observers: {
          disconnect: { id: observerId },
        },
      },
      include: {
        observers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }
}
