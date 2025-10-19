import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDateString, MaxLength } from 'class-validator';
import { DefectPriority } from '@prisma/client';

export class UpdateDefectDto {
  @ApiProperty({ description: 'Заголовок дефекта', maxLength: 200, required: false })
  @IsString()
  @MaxLength(200)
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Подробное описание дефекта', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Приоритет дефекта',
    enum: DefectPriority,
    required: false
  })
  @IsEnum(DefectPriority)
  @IsOptional()
  priority?: DefectPriority;

  @ApiProperty({ description: 'Плановая дата устранения', required: false })
  @IsDateString()
  @IsOptional()
  plannedDate?: string;
}
