import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Response,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { AttachmentsService } from './attachments.service';
import { UploadAttachmentDto } from './dto/upload-attachment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type { Response as ExpressResponse } from 'express';

@ApiTags('Attachments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post('upload')
  @Roles('engineer', 'manager')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Загрузить изображение (Engineer, Manager)' })
  @ApiBody({ type: UploadAttachmentDto })
  @ApiResponse({ status: 201, description: 'Файл успешно загружен' })
  @ApiResponse({ status: 400, description: 'Некорректный файл или параметры' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  async uploadAttachment(
    @UploadedFile() file: Express.Multer.File,
    @Body('defectId') defectId?: string,
    @Body('commentId') commentId?: string,
    @Request() req?: any,
  ) {
    const parsedDefectId = defectId ? parseInt(defectId, 10) : undefined;
    const parsedCommentId = commentId ? parseInt(commentId, 10) : undefined;

    if (defectId && isNaN(parsedDefectId!)) {
      throw new BadRequestException('defectId must be a valid number');
    }

    if (commentId && isNaN(parsedCommentId!)) {
      throw new BadRequestException('commentId must be a valid number');
    }

    return this.attachmentsService.uploadAttachment(
      file,
      parsedDefectId,
      parsedCommentId,
      req.user.sub,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить информацию о вложении' })
  @ApiParam({ name: 'id', description: 'ID вложения' })
  @ApiResponse({ status: 200, description: 'Информация о вложении' })
  @ApiResponse({ status: 404, description: 'Вложение не найдено' })
  findAttachmentById(@Param('id', ParseIntPipe) id: number) {
    return this.attachmentsService.findAttachmentById(id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Скачать файл вложения' })
  @ApiParam({ name: 'id', description: 'ID вложения' })
  @ApiResponse({ status: 200, description: 'Файл вложения' })
  @ApiResponse({ status: 404, description: 'Вложение не найдено' })
  async downloadAttachment(
    @Param('id', ParseIntPipe) id: number,
    @Response() res: ExpressResponse,
  ) {
    const { fileName, mimeType, fileData } = await this.attachmentsService.getAttachmentFile(id);

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    res.send(fileData);
  }

  @Delete(':id')
  @Roles('engineer', 'manager')
  @ApiOperation({ summary: 'Удалить вложение' })
  @ApiParam({ name: 'id', description: 'ID вложения' })
  @ApiResponse({ status: 200, description: 'Вложение удалено' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  @ApiResponse({ status: 404, description: 'Вложение не найдено' })
  deleteAttachment(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.attachmentsService.deleteAttachment(id, req.user.sub, req.user.role);
  }

  @Get('defect/:defectId')
  @ApiOperation({ summary: 'Получить все вложения дефекта' })
  @ApiParam({ name: 'defectId', description: 'ID дефекта' })
  @ApiResponse({ status: 200, description: 'Список вложений' })
  @ApiResponse({ status: 404, description: 'Дефект не найден' })
  findAttachmentsByDefectId(@Param('defectId', ParseIntPipe) defectId: number) {
    return this.attachmentsService.findAttachmentsByDefectId(defectId);
  }

  @Get('comment/:commentId')
  @ApiOperation({ summary: 'Получить все вложения комментария' })
  @ApiParam({ name: 'commentId', description: 'ID комментария' })
  @ApiResponse({ status: 200, description: 'Список вложений' })
  @ApiResponse({ status: 404, description: 'Комментарий не найден' })
  findAttachmentsByCommentId(@Param('commentId', ParseIntPipe) commentId: number) {
    return this.attachmentsService.findAttachmentsByCommentId(commentId);
  }
}
