import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

export class UploadAttachmentDto {
  @ApiProperty({ description: 'ID дефекта', required: false })
  @IsInt()
  @IsOptional()
  defectId?: number;

  @ApiProperty({ description: 'ID комментария', required: false })
  @IsInt()
  @IsOptional()
  commentId?: number;

  @ApiProperty({ type: 'string', format: 'binary', description: 'Файл изображения' })
  file: any;
}
