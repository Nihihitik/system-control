import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  // Create comment
  async createComment(dto: CreateCommentDto, authorId: number) {
    // Check if defect exists
    const defect = await this.prisma.defect.findUnique({
      where: { id: dto.defectId },
    });

    if (!defect) {
      throw new NotFoundException(`Defect with ID ${dto.defectId} not found`);
    }

    return this.prisma.comment.create({
      data: {
        defectId: dto.defectId,
        authorId,
        content: dto.content,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            email: true,
            role: true,
          },
        },
        attachments: true,
      },
    });
  }

  // Find comments by defect ID
  async findCommentsByDefectId(defectId: number) {
    // Check if defect exists
    const defect = await this.prisma.defect.findUnique({
      where: { id: defectId },
    });

    if (!defect) {
      throw new NotFoundException(`Defect with ID ${defectId} not found`);
    }

    return this.prisma.comment.findMany({
      where: { defectId },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            email: true,
            role: true,
          },
        },
        attachments: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  // Find comment by ID
  async findCommentById(id: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            email: true,
            role: true,
          },
        },
        defect: {
          select: {
            id: true,
            title: true,
          },
        },
        attachments: true,
      },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return comment;
  }

  // Update comment (only author)
  async updateComment(id: number, dto: UpdateCommentDto, userId: number) {
    const comment = await this.findCommentById(id);

    // Check if user is the author
    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    return this.prisma.comment.update({
      where: { id },
      data: {
        content: dto.content,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            email: true,
            role: true,
          },
        },
        attachments: true,
      },
    });
  }

  // Delete comment (only author)
  async deleteComment(id: number, userId: number) {
    const comment = await this.findCommentById(id);

    // Check if user is the author
    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.prisma.comment.delete({
      where: { id },
    });

    return { message: 'Comment deleted successfully' };
  }
}
