import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ExportFiltersDto } from './dto/export-filters.dto';
import { Workbook } from 'exceljs';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDefectsForExport(managerId: number, filters: ExportFiltersDto) {
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
      return [];
    }

    // Build where clause
    const where: any = {
      projectId: { in: projectIds },
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.projectId) {
      where.projectId = filters.projectId;
    }

    if (filters.buildingObjectId) {
      where.buildingObjectId = filters.buildingObjectId;
    }

    if (filters.assigneeId) {
      where.assigneeId = filters.assigneeId;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.createdAt.lte = new Date(filters.dateTo);
      }
    }

    // Fetch defects
    return this.prisma.defect.findMany({
      where,
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
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
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
  }

  async exportToCSV(managerId: number, filters: ExportFiltersDto): Promise<string> {
    const defects = await this.getDefectsForExport(managerId, filters);

    // CSV headers
    const headers = [
      'ID',
      'Название',
      'Описание',
      'Статус',
      'Приоритет',
      'Проект',
      'Объект',
      'Этап',
      'Автор',
      'Исполнитель',
      'Плановая дата',
      'Комментариев',
      'Вложений',
      'Создан',
      'Обновлен',
    ];

    // Build CSV content
    let csv = headers.join(',') + '\n';

    for (const defect of defects) {
      const row = [
        defect.id,
        `"${defect.title.replace(/"/g, '""')}"`,
        `"${defect.description.replace(/"/g, '""')}"`,
        this.translateStatus(defect.status),
        this.translatePriority(defect.priority),
        `"${defect.project.name.replace(/"/g, '""')}"`,
        `"${defect.buildingObject.name.replace(/"/g, '""')}"`,
        `"${defect.stage.name.replace(/"/g, '""')}"`,
        `"${defect.author.lastName} ${defect.author.firstName}"`,
        defect.assignee
          ? `"${defect.assignee.lastName} ${defect.assignee.firstName}"`
          : 'Не назначено',
        defect.plannedDate
          ? new Date(defect.plannedDate).toLocaleDateString('ru-RU')
          : '',
        defect._count.comments,
        defect._count.attachments,
        new Date(defect.createdAt).toLocaleDateString('ru-RU'),
        new Date(defect.updatedAt).toLocaleDateString('ru-RU'),
      ];

      csv += row.join(',') + '\n';
    }

    return csv;
  }

  async exportToExcel(managerId: number, filters: ExportFiltersDto): Promise<Buffer> {
    const defects = await this.getDefectsForExport(managerId, filters);

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Дефекты');

    // Define columns
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Название', key: 'title', width: 30 },
      { header: 'Описание', key: 'description', width: 40 },
      { header: 'Статус', key: 'status', width: 15 },
      { header: 'Приоритет', key: 'priority', width: 15 },
      { header: 'Проект', key: 'project', width: 25 },
      { header: 'Объект', key: 'object', width: 25 },
      { header: 'Этап', key: 'stage', width: 25 },
      { header: 'Автор', key: 'author', width: 25 },
      { header: 'Исполнитель', key: 'assignee', width: 25 },
      { header: 'Плановая дата', key: 'plannedDate', width: 15 },
      { header: 'Комментариев', key: 'comments', width: 12 },
      { header: 'Вложений', key: 'attachments', width: 12 },
      { header: 'Создан', key: 'createdAt', width: 15 },
      { header: 'Обновлен', key: 'updatedAt', width: 15 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // Add data rows
    for (const defect of defects) {
      worksheet.addRow({
        id: defect.id,
        title: defect.title,
        description: defect.description,
        status: this.translateStatus(defect.status),
        priority: this.translatePriority(defect.priority),
        project: defect.project.name,
        object: defect.buildingObject.name,
        stage: defect.stage.name,
        author: `${defect.author.lastName} ${defect.author.firstName}`,
        assignee: defect.assignee
          ? `${defect.assignee.lastName} ${defect.assignee.firstName}`
          : 'Не назначено',
        plannedDate: defect.plannedDate
          ? new Date(defect.plannedDate).toLocaleDateString('ru-RU')
          : '',
        comments: defect._count.comments,
        attachments: defect._count.attachments,
        createdAt: new Date(defect.createdAt).toLocaleDateString('ru-RU'),
        updatedAt: new Date(defect.updatedAt).toLocaleDateString('ru-RU'),
      });
    }

    // Auto-filter
    worksheet.autoFilter = {
      from: 'A1',
      to: 'O1',
    };

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private translateStatus(status: string): string {
    const statusMap: Record<string, string> = {
      new: 'Новая',
      in_progress: 'В работе',
      under_review: 'На проверке',
      closed: 'Закрыта',
      cancelled: 'Отменена',
    };
    return statusMap[status] || status;
  }

  private translatePriority(priority: string): string {
    const priorityMap: Record<string, string> = {
      critical: 'Критический',
      high: 'Высокий',
      medium: 'Средний',
      low: 'Низкий',
    };
    return priorityMap[priority] || priority;
  }
}
