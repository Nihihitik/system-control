import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
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
  @Roles('manager')
  @ApiOperation({ summary: 'Получить общую статистику по дефектам (только Manager)' })
  @ApiResponse({
    status: 200,
    description: 'Общая статистика: количество по статусам и приоритетам',
  })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  getOverview(@Request() req: any) {
    return this.analyticsService.getOverview(req.user.sub);
  }

  @Get('overdue')
  @Roles('manager')
  @ApiOperation({ summary: 'Получить просроченные дефекты (только Manager)' })
  @ApiResponse({
    status: 200,
    description: 'Список просроченных дефектов с количеством и процентом',
  })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  getOverdue(@Request() req: any) {
    return this.analyticsService.getOverdue(req.user.sub);
  }

  @Get('by-assignee')
  @Roles('manager')
  @ApiOperation({ summary: 'Получить статистику по исполнителям (только Manager)' })
  @ApiResponse({
    status: 200,
    description: 'Дефекты сгруппированные по исполнителям с детальной статистикой',
  })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  getByAssignee(@Request() req: any) {
    return this.analyticsService.getByAssignee(req.user.sub);
  }

  @Get('by-location')
  @Roles('manager')
  @ApiOperation({ summary: 'Получить статистику по объектам строительства (только Manager)' })
  @ApiResponse({
    status: 200,
    description: 'Дефекты сгруппированные по объектам строительства',
  })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  getByLocation(@Request() req: any) {
    return this.analyticsService.getByLocation(req.user.sub);
  }
}
