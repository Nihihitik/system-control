import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { DefectsService } from './defects.service';
import { CreateDefectDto } from './dto/create-defect.dto';
import { UpdateDefectDto } from './dto/update-defect.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { DefectFilterDto } from './dto/defect-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Defects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('defects')
export class DefectsController {
  constructor(private readonly defectsService: DefectsService) {}

  @Post()
  @Roles('engineer', 'manager')
  @ApiOperation({ summary: 'Создать новый дефект (Engineer, Manager)' })
  @ApiResponse({ status: 201, description: 'Дефект успешно создан' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  @ApiResponse({ status: 404, description: 'Проект/объект/этап не найден' })
  createDefect(@Body() dto: CreateDefectDto, @Request() req: any) {
    return this.defectsService.createDefect(dto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список всех дефектов с фильтрами и пагинацией' })
  @ApiResponse({ status: 200, description: 'Список дефектов' })
  findAllDefects(@Query() filters: DefectFilterDto) {
    return this.defectsService.findAllDefects(filters);
  }

  @Get('my-tasks')
  @ApiOperation({ summary: 'Получить задачи текущего пользователя (созданные или назначенные)' })
  @ApiResponse({ status: 200, description: 'Мои задачи' })
  findMyTasks(@Query() filters: DefectFilterDto, @Request() req: any) {
    return this.defectsService.findMyTasks(req.user.sub, filters);
  }

  @Get('assigned')
  @ApiOperation({ summary: 'Получить дефекты, назначенные на текущего пользователя' })
  @ApiResponse({ status: 200, description: 'Назначенные дефекты' })
  findAssignedDefects(@Query() filters: DefectFilterDto, @Request() req: any) {
    return this.defectsService.findAssignedDefects(req.user.sub, filters);
  }

  @Get('created')
  @ApiOperation({ summary: 'Получить дефекты, созданные текущим пользователем' })
  @ApiResponse({ status: 200, description: 'Созданные дефекты' })
  findCreatedDefects(@Query() filters: DefectFilterDto, @Request() req: any) {
    return this.defectsService.findCreatedDefects(req.user.sub, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить дефект по ID' })
  @ApiParam({ name: 'id', description: 'ID дефекта' })
  @ApiResponse({ status: 200, description: 'Дефект найден' })
  @ApiResponse({ status: 404, description: 'Дефект не найден' })
  findDefectById(@Param('id', ParseIntPipe) id: number) {
    return this.defectsService.findDefectById(id);
  }

  @Patch(':id')
  @Roles('engineer', 'manager')
  @ApiOperation({ summary: 'Обновить дефект (автор, исполнитель, или Manager)' })
  @ApiParam({ name: 'id', description: 'ID дефекта' })
  @ApiResponse({ status: 200, description: 'Дефект обновлен' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  @ApiResponse({ status: 404, description: 'Дефект не найден' })
  updateDefect(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDefectDto,
    @Request() req: any,
  ) {
    return this.defectsService.updateDefect(id, dto, req.user.sub, req.user.role);
  }

  @Patch(':id/status')
  @Roles('engineer', 'manager')
  @ApiOperation({ summary: 'Изменить статус дефекта' })
  @ApiParam({ name: 'id', description: 'ID дефекта' })
  @ApiResponse({ status: 200, description: 'Статус изменен' })
  @ApiResponse({ status: 400, description: 'Недопустимый переход статуса' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  @ApiResponse({ status: 404, description: 'Дефект не найден' })
  updateDefectStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDto,
    @Request() req: any,
  ) {
    return this.defectsService.updateDefectStatus(id, dto, req.user.sub, req.user.role);
  }

  @Patch(':id/assign/:assigneeId')
  @Roles('manager')
  @ApiOperation({ summary: 'Назначить исполнителя на дефект (только Manager)' })
  @ApiParam({ name: 'id', description: 'ID дефекта' })
  @ApiParam({ name: 'assigneeId', description: 'ID исполнителя (Engineer)' })
  @ApiResponse({ status: 200, description: 'Исполнитель назначен' })
  @ApiResponse({ status: 400, description: 'Можно назначить только Engineer' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  @ApiResponse({ status: 404, description: 'Дефект или пользователь не найден' })
  assignDefect(
    @Param('id', ParseIntPipe) id: number,
    @Param('assigneeId', ParseIntPipe) assigneeId: number,
  ) {
    return this.defectsService.assignDefect(id, assigneeId);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Получить историю изменений дефекта' })
  @ApiParam({ name: 'id', description: 'ID дефекта' })
  @ApiResponse({ status: 200, description: 'История изменений' })
  @ApiResponse({ status: 404, description: 'Дефект не найден' })
  getDefectHistory(@Param('id', ParseIntPipe) id: number) {
    return this.defectsService.getDefectHistory(id);
  }
}
