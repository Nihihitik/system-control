import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ description: 'ID дефекта' })
  @IsInt()
  defectId: number;

  @ApiProperty({ description: 'Содержимое комментария' })
  @IsString()
  content: string;
}
