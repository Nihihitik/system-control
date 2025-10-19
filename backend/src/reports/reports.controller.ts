import { Controller, Get, Query, UseGuards, Request, Response } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { ExportFiltersDto } from './dto/export-filters.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type { Response as ExpressResponse } from 'express';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('defects/csv')
  @Roles('manager', 'observer')
  @ApiOperation({ summary: 'Экспортировать дефекты в CSV (Manager и Observer)' })
  @ApiResponse({ status: 200, description: 'CSV файл с дефектами' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  async exportDefectsToCSV(
    @Query() filters: ExportFiltersDto,
    @Request() req: any,
    @Response() res: ExpressResponse,
  ) {
    const csv = await this.reportsService.exportToCSV(req.user.sub, filters, req.user.role);

    const filename = `defects_${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('\uFEFF' + csv); // Add BOM for correct UTF-8 handling in Excel
  }

  @Get('defects/excel')
  @Roles('manager', 'observer')
  @ApiOperation({ summary: 'Экспортировать дефекты в Excel (Manager и Observer)' })
  @ApiResponse({ status: 200, description: 'Excel файл с дефектами' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  async exportDefectsToExcel(
    @Query() filters: ExportFiltersDto,
    @Request() req: any,
    @Response() res: ExpressResponse,
  ) {
    const buffer = await this.reportsService.exportToExcel(req.user.sub, filters, req.user.role);

    const filename = `defects_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }
}
