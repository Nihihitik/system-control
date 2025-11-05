import { Controller, Get, Query, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @Roles('manager', 'observer')
  @ApiOperation({
    summary: 'Получить общую статистику по дефектам (Manager и Observer)',
  })
  @ApiResponse({
    status: 200,
    description: 'Общая статистика: количество по статусам и приоритетам',
  })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  getOverview(@Request() req: any) {
    return this.analyticsService.getOverview(req.user.sub, req.user.role);
  }

  @Get('overdue')
  @Roles('manager', 'observer')
  @ApiOperation({ summary: 'Получить просроченные дефекты (Manager и Observer)' })
  @ApiResponse({
    status: 200,
    description: 'Список просроченных дефектов с количеством и процентом',
  })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  getOverdue(@Request() req: any) {
    return this.analyticsService.getOverdue(req.user.sub, req.user.role);
  }

  @Get('by-assignee')
  @Roles('manager', 'observer')
  @ApiOperation({ summary: 'Получить статистику по исполнителям (Manager и Observer)' })
  @ApiResponse({
    status: 200,
    description: 'Дефекты сгруппированные по исполнителям с детальной статистикой',
  })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  getByAssignee(@Request() req: any) {
    return this.analyticsService.getByAssignee(req.user.sub, req.user.role);
  }

  @Get('by-location')
  @Roles('manager', 'observer')
  @ApiOperation({
    summary: 'Получить статистику по объектам строительства (Manager и Observer)',
  })
  @ApiResponse({
    status: 200,
    description: 'Дефекты сгруппированные по объектам строительства',
  })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  getByLocation(@Request() req: any) {
    return this.analyticsService.getByLocation(req.user.sub, req.user.role);
  }

  @Get('trends')
  @Roles('manager', 'observer')
  @ApiOperation({ summary: 'Получить динамику создания и закрытия дефектов' })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'Количество дней для анализа (по умолчанию 30)',
  })
  @ApiResponse({
    status: 200,
    description: 'Динамика дефектов по дням',
  })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  getTrends(@Request() req: any, @Query('days', new ParseIntPipe({ optional: true })) days?: number) {
    return this.analyticsService.getTrends(req.user.sub, req.user.role, days ?? 30);
  }
}
