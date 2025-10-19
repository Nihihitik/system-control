import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
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
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Comments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @Roles('engineer', 'manager')
  @ApiOperation({ summary: 'Создать комментарий к дефекту (Engineer, Manager)' })
  @ApiResponse({ status: 201, description: 'Комментарий создан' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  @ApiResponse({ status: 404, description: 'Дефект не найден' })
  createComment(@Body() dto: CreateCommentDto, @Request() req: any) {
    return this.commentsService.createComment(dto, req.user.sub);
  }

  @Get('defect/:defectId')
  @ApiOperation({ summary: 'Получить все комментарии к дефекту' })
  @ApiParam({ name: 'defectId', description: 'ID дефекта' })
  @ApiResponse({ status: 200, description: 'Список комментариев' })
  @ApiResponse({ status: 404, description: 'Дефект не найден' })
  findCommentsByDefectId(@Param('defectId', ParseIntPipe) defectId: number) {
    return this.commentsService.findCommentsByDefectId(defectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить комментарий по ID' })
  @ApiParam({ name: 'id', description: 'ID комментария' })
  @ApiResponse({ status: 200, description: 'Комментарий найден' })
  @ApiResponse({ status: 404, description: 'Комментарий не найден' })
  findCommentById(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.findCommentById(id);
  }

  @Patch(':id')
  @Roles('engineer', 'manager')
  @ApiOperation({ summary: 'Обновить свой комментарий' })
  @ApiParam({ name: 'id', description: 'ID комментария' })
  @ApiResponse({ status: 200, description: 'Комментарий обновлен' })
  @ApiResponse({ status: 403, description: 'Можно редактировать только свои комментарии' })
  @ApiResponse({ status: 404, description: 'Комментарий не найден' })
  updateComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCommentDto,
    @Request() req: any,
  ) {
    return this.commentsService.updateComment(id, dto, req.user.sub);
  }

  @Delete(':id')
  @Roles('engineer', 'manager')
  @ApiOperation({ summary: 'Удалить свой комментарий' })
  @ApiParam({ name: 'id', description: 'ID комментария' })
  @ApiResponse({ status: 200, description: 'Комментарий удален' })
  @ApiResponse({ status: 403, description: 'Можно удалять только свои комментарии' })
  @ApiResponse({ status: 404, description: 'Комментарий не найден' })
  deleteComment(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.commentsService.deleteComment(id, req.user.sub);
  }
}
