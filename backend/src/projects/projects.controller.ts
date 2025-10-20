import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
  ApiQuery,
} from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateObjectDto } from './dto/create-object.dto';
import { UpdateObjectDto } from './dto/update-object.dto';
import { CreateStageDto } from './dto/create-stage.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // Projects endpoints
  @Post()
  @Roles('manager')
  @ApiOperation({ summary: 'Создать новый проект (только Manager)' })
  @ApiResponse({ status: 201, description: 'Проект успешно создан' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  createProject(@Body() dto: CreateProjectDto, @Request() req: any) {
    return this.projectsService.createProject(dto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список всех проектов' })
  @ApiQuery({ name: 'includeArchived', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Список проектов' })
  findAllProjects(@Query('includeArchived') includeArchived?: string) {
    return this.projectsService.findAllProjects(includeArchived === 'true');
  }

  // Manager, Observer, and Engineer - My projects endpoint
  @Get('my')
  @Roles('manager', 'observer', 'engineer')
  @ApiOperation({ summary: 'Получить проекты текущего пользователя (Manager, Observer, или Engineer)' })
  @ApiResponse({ status: 200, description: 'Список проектов пользователя' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  findMyProjects(@Request() req: any) {
    const role = req.user.role;
    if (role === 'manager') {
      return this.projectsService.findManagerProjects(req.user.sub);
    } else if (role === 'observer') {
      return this.projectsService.findObserverProjects(req.user.sub);
    } else if (role === 'engineer') {
      return this.projectsService.findEngineerProjects(req.user.sub);
    }
    return [];
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить проект по ID' })
  @ApiParam({ name: 'id', description: 'ID проекта' })
  @ApiResponse({ status: 200, description: 'Проект найден' })
  @ApiResponse({ status: 404, description: 'Проект не найден' })
  findProjectById(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.findProjectById(id);
  }

  @Patch(':id')
  @Roles('manager')
  @ApiOperation({ summary: 'Обновить проект (только Manager)' })
  @ApiParam({ name: 'id', description: 'ID проекта' })
  @ApiResponse({ status: 200, description: 'Проект обновлен' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  @ApiResponse({ status: 404, description: 'Проект не найден' })
  updateProject(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProjectDto) {
    return this.projectsService.updateProject(id, dto);
  }

  @Patch(':id/archive')
  @Roles('manager')
  @ApiOperation({ summary: 'Архивировать проект (только Manager)' })
  @ApiParam({ name: 'id', description: 'ID проекта' })
  @ApiResponse({ status: 200, description: 'Проект архивирован' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  @ApiResponse({ status: 404, description: 'Проект не найден' })
  archiveProject(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.archiveProject(id);
  }

  @Delete(':id')
  @Roles('manager')
  @ApiOperation({ summary: 'Удалить проект (только Manager, если нет дефектов)' })
  @ApiParam({ name: 'id', description: 'ID проекта' })
  @ApiResponse({ status: 200, description: 'Проект удален' })
  @ApiResponse({ status: 409, description: 'Проект имеет связанные дефекты' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  @ApiResponse({ status: 404, description: 'Проект не найден' })
  deleteProject(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.deleteProject(id);
  }

  // Building Objects endpoints
  @Post('objects')
  @Roles('manager')
  @ApiOperation({ summary: 'Создать объект строительства (только Manager)' })
  @ApiResponse({ status: 201, description: 'Объект успешно создан' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  @ApiResponse({ status: 404, description: 'Проект не найден' })
  createObject(@Body() dto: CreateObjectDto) {
    return this.projectsService.createObject(dto);
  }

  @Get('objects/:id')
  @ApiOperation({ summary: 'Получить объект по ID' })
  @ApiParam({ name: 'id', description: 'ID объекта' })
  @ApiResponse({ status: 200, description: 'Объект найден' })
  @ApiResponse({ status: 404, description: 'Объект не найден' })
  findObjectById(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.findObjectById(id);
  }

  @Patch('objects/:id')
  @Roles('manager')
  @ApiOperation({ summary: 'Обновить объект (только Manager)' })
  @ApiParam({ name: 'id', description: 'ID объекта' })
  @ApiResponse({ status: 200, description: 'Объект обновлен' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  @ApiResponse({ status: 404, description: 'Объект не найден' })
  updateObject(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateObjectDto) {
    return this.projectsService.updateObject(id, dto);
  }

  @Delete('objects/:id')
  @Roles('manager')
  @ApiOperation({ summary: 'Удалить объект (только Manager, если нет дефектов)' })
  @ApiParam({ name: 'id', description: 'ID объекта' })
  @ApiResponse({ status: 200, description: 'Объект удален' })
  @ApiResponse({ status: 400, description: 'Объект имеет связанные дефекты' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  @ApiResponse({ status: 404, description: 'Объект не найден' })
  deleteObject(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.deleteObject(id);
  }

  // Stages endpoints
  @Post('stages')
  @Roles('manager')
  @ApiOperation({ summary: 'Создать этап работ (только Manager)' })
  @ApiResponse({ status: 201, description: 'Этап успешно создан' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  @ApiResponse({ status: 404, description: 'Объект не найден' })
  createStage(@Body() dto: CreateStageDto) {
    return this.projectsService.createStage(dto);
  }

  @Get('stages/:id')
  @ApiOperation({ summary: 'Получить этап по ID' })
  @ApiParam({ name: 'id', description: 'ID этапа' })
  @ApiResponse({ status: 200, description: 'Этап найден' })
  @ApiResponse({ status: 404, description: 'Этап не найден' })
  findStageById(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.findStageById(id);
  }

  @Patch('stages/:id')
  @Roles('manager')
  @ApiOperation({ summary: 'Обновить этап (только Manager)' })
  @ApiParam({ name: 'id', description: 'ID этапа' })
  @ApiResponse({ status: 200, description: 'Этап обновлен' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  @ApiResponse({ status: 404, description: 'Этап не найден' })
  updateStage(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStageDto) {
    return this.projectsService.updateStage(id, dto);
  }

  @Delete('stages/:id')
  @Roles('manager')
  @ApiOperation({ summary: 'Удалить этап (только Manager, если нет дефектов)' })
  @ApiParam({ name: 'id', description: 'ID этапа' })
  @ApiResponse({ status: 200, description: 'Этап удален' })
  @ApiResponse({ status: 400, description: 'Этап имеет связанные дефекты' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  @ApiResponse({ status: 404, description: 'Этап не найден' })
  deleteStage(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.deleteStage(id);
  }

  // Manager assignments endpoints
  @Patch(':id/managers/:managerId')
  @Roles('manager')
  @ApiOperation({ summary: 'Назначить менеджера на проект (только Manager)' })
  @ApiParam({ name: 'id', description: 'ID проекта' })
  @ApiParam({ name: 'managerId', description: 'ID менеджера' })
  @ApiResponse({ status: 200, description: 'Менеджер назначен' })
  @ApiResponse({ status: 400, description: 'Пользователь не является менеджером' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  @ApiResponse({ status: 404, description: 'Проект или пользователь не найден' })
  assignManager(
    @Param('id', ParseIntPipe) id: number,
    @Param('managerId', ParseIntPipe) managerId: number,
  ) {
    return this.projectsService.assignManager(id, managerId);
  }

  @Delete(':id/managers/:managerId')
  @Roles('manager')
  @ApiOperation({ summary: 'Снять менеджера с проекта (только Manager)' })
  @ApiParam({ name: 'id', description: 'ID проекта' })
  @ApiParam({ name: 'managerId', description: 'ID менеджера' })
  @ApiResponse({ status: 200, description: 'Менеджер снят с проекта' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  @ApiResponse({ status: 404, description: 'Проект не найден' })
  removeManager(
    @Param('id', ParseIntPipe) id: number,
    @Param('managerId', ParseIntPipe) managerId: number,
  ) {
    return this.projectsService.removeManager(id, managerId);
  }

  // Observer assignments endpoints

  @Patch(':id/observers/:observerId')
  @Roles('manager')
  @ApiOperation({ summary: 'Назначить наблюдателя на проект (только Manager)' })
  @ApiParam({ name: 'id', description: 'ID проекта' })
  @ApiParam({ name: 'observerId', description: 'ID наблюдателя' })
  @ApiResponse({ status: 200, description: 'Наблюдатель назначен' })
  @ApiResponse({ status: 400, description: 'Пользователь не является наблюдателем' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  @ApiResponse({ status: 404, description: 'Проект или пользователь не найден' })
  assignObserver(
    @Param('id', ParseIntPipe) id: number,
    @Param('observerId', ParseIntPipe) observerId: number,
  ) {
    return this.projectsService.assignObserver(id, observerId);
  }

  @Delete(':id/observers/:observerId')
  @Roles('manager')
  @ApiOperation({ summary: 'Снять наблюдателя с проекта (только Manager)' })
  @ApiParam({ name: 'id', description: 'ID проекта' })
  @ApiParam({ name: 'observerId', description: 'ID наблюдателя' })
  @ApiResponse({ status: 200, description: 'Наблюдатель снят с проекта' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  @ApiResponse({ status: 404, description: 'Проект не найден' })
  removeObserver(
    @Param('id', ParseIntPipe) id: number,
    @Param('observerId', ParseIntPipe) observerId: number,
  ) {
    return this.projectsService.removeObserver(id, observerId);
  }

  // Engineer assignments endpoints
  @Patch(':id/engineers/:engineerId')
  @Roles('manager')
  @ApiOperation({ summary: 'Назначить инженера на проект (только Manager)' })
  @ApiParam({ name: 'id', description: 'ID проекта' })
  @ApiParam({ name: 'engineerId', description: 'ID инженера' })
  @ApiResponse({ status: 200, description: 'Инженер назначен' })
  @ApiResponse({ status: 400, description: 'Пользователь не является инженером' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  @ApiResponse({ status: 404, description: 'Проект или пользователь не найден' })
  assignEngineer(
    @Param('id', ParseIntPipe) id: number,
    @Param('engineerId', ParseIntPipe) engineerId: number,
  ) {
    return this.projectsService.assignEngineer(id, engineerId);
  }

  @Delete(':id/engineers/:engineerId')
  @Roles('manager')
  @ApiOperation({ summary: 'Удалить инженера с проекта (только Manager)' })
  @ApiParam({ name: 'id', description: 'ID проекта' })
  @ApiParam({ name: 'engineerId', description: 'ID инженера' })
  @ApiResponse({ status: 200, description: 'Инженер снят с проекта' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  @ApiResponse({ status: 404, description: 'Проект не найден' })
  removeEngineer(
    @Param('id', ParseIntPipe) id: number,
    @Param('engineerId', ParseIntPipe) engineerId: number,
  ) {
    return this.projectsService.removeEngineer(id, engineerId);
  }
}
