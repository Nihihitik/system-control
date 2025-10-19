import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateCommentDto {
  @ApiProperty({ description: 'Новое содержимое комментария' })
  @IsString()
  content: string;
}
