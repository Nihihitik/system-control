import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttachmentsService {
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
  private readonly ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  constructor(private prisma: PrismaService) {}

  // Upload attachment
  async uploadAttachment(
    file: Express.Multer.File,
    defectId?: number,
    commentId?: number,
    userId?: number,
  ) {
    // Validate that at least one of defectId or commentId is provided
    if (!defectId && !commentId) {
      throw new BadRequestException('Either defectId or commentId must be provided');
    }

    // Validate file
    this.validateFile(file);

    // If defectId is provided, check if defect exists
    if (defectId) {
      const defect = await this.prisma.defect.findUnique({
        where: { id: defectId },
      });
      if (!defect) {
        throw new NotFoundException(`Defect with ID ${defectId} not found`);
      }
    }

    // If commentId is provided, check if comment exists
    if (commentId) {
      const comment = await this.prisma.comment.findUnique({
        where: { id: commentId },
      });
      if (!comment) {
        throw new NotFoundException(`Comment with ID ${commentId} not found`);
      }
    }

    // Save attachment
    return this.prisma.attachment.create({
      data: {
        fileName: file.originalname,
        mimeType: file.mimetype,
        fileData: file.buffer,
        fileSize: file.size,
        defectId: defectId || null,
        commentId: commentId || null,
      },
    });
  }

  // Find attachment by ID
  async findAttachmentById(id: number) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
      include: {
        defect: true,
        comment: true,
      },
    });

    if (!attachment) {
      throw new NotFoundException(`Attachment with ID ${id} not found`);
    }

    return attachment;
  }

  // Get attachment file data
  async getAttachmentFile(id: number) {
    const attachment = await this.findAttachmentById(id);

    return {
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
      fileData: attachment.fileData,
      fileSize: attachment.fileSize,
    };
  }

  // Delete attachment (only defect author/assignee or comment author)
  async deleteAttachment(id: number, userId: number, userRole: string) {
    const attachment = await this.findAttachmentById(id);

    // Manager can delete any attachment
    if (userRole === 'manager') {
      await this.prisma.attachment.delete({ where: { id } });
      return { message: 'Attachment deleted successfully' };
    }

    // Check permissions for defect attachments
    if (attachment.defectId) {
      const defect = await this.prisma.defect.findUnique({
        where: { id: attachment.defectId },
      });

      const isAuthor = defect?.authorId === userId;
      const isAssignee = defect?.assigneeId === userId;

      if (!isAuthor && !isAssignee) {
        throw new ForbiddenException(
          'You can only delete attachments from your own defects',
        );
      }
    }

    // Check permissions for comment attachments
    if (attachment.commentId) {
      const comment = await this.prisma.comment.findUnique({
        where: { id: attachment.commentId },
      });

      if (comment?.authorId !== userId) {
        throw new ForbiddenException(
          'You can only delete attachments from your own comments',
        );
      }
    }

    await this.prisma.attachment.delete({ where: { id } });
    return { message: 'Attachment deleted successfully' };
  }

  // Find attachments by defect ID
  async findAttachmentsByDefectId(defectId: number) {
    const defect = await this.prisma.defect.findUnique({
      where: { id: defectId },
    });

    if (!defect) {
      throw new NotFoundException(`Defect with ID ${defectId} not found`);
    }

    return this.prisma.attachment.findMany({
      where: { defectId },
      select: {
        id: true,
        fileName: true,
        mimeType: true,
        fileSize: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  // Find attachments by comment ID
  async findAttachmentsByCommentId(commentId: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    return this.prisma.attachment.findMany({
      where: { commentId },
      select: {
        id: true,
        fileName: true,
        mimeType: true,
        fileSize: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  // Private: Validate file
  private validateFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.MAX_FILE_SIZE / 1024 / 1024} MB`,
      );
    }

    // Check MIME type
    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Allowed types: ${this.ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }
  }
}
